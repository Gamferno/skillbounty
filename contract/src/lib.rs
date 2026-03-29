#![no_std]

mod bounty;
mod storage;

#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contractimpl, token, Address, Env, String, Vec,
};

use bounty::{Bounty, BountyStatus};
use storage::{
    get_arbitrator, get_bounty, get_bounty_count, get_native_token, get_reputation,
    increment_reputation, set_arbitrator, set_bounty, set_bounty_count, set_native_token,
};

const SECONDS_PER_HOUR: u64 = 3600;

#[contract]
pub struct SkillBountyContract;

#[contractimpl]
impl SkillBountyContract {
    /// Called once on deployment. Sets the arbitrator wallet and native token address.
    /// Pass the XLM Stellar Asset Contract address as `native_token`.
    /// On testnet: `stellar contract id asset --asset native --network testnet`
    pub fn initialize(env: Env, arbitrator: Address, native_token: Address) {
        if get_arbitrator(&env).is_some() {
            panic!("already initialized");
        }
        set_arbitrator(&env, &arbitrator);
        set_native_token(&env, &native_token);
    }

    /// Post a new bounty. Transfers XLM (in stroops) from poster to the contract.
    pub fn post_bounty(
        env: Env,
        poster: Address,
        title: String,
        description: String,
        reward: i128,
        deadline_hours: u64,
        tags: Vec<String>,
    ) -> u64 {
        poster.require_auth();
        assert!(tags.len() <= 3, "too many tags");

        let contract_address = env.current_contract_address();
        let native_token = token::Client::new(&env, &get_native_token(&env));
        native_token.transfer(&poster, &contract_address, &reward);

        let id = get_bounty_count(&env) + 1;
        set_bounty_count(&env, id);

        let now = env.ledger().timestamp();
        let bounty = Bounty {
            id,
            poster: poster.clone(),
            hunter: None,
            title,
            description,
            reward,
            work_url: None,
            status: BountyStatus::Open,
            tags,
            created_at: now,
            submitted_at: None,
            deadline_hours,
        };
        set_bounty(&env, &bounty);
        
        env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("post")), (id, poster, reward));
        id
    }

    /// Hunter claims an open bounty.
    pub fn claim_bounty(env: Env, hunter: Address, bounty_id: u64) {
        hunter.require_auth();

        let mut bounty = get_bounty(&env, bounty_id).expect("bounty not found");
        assert!(bounty.status == BountyStatus::Open, "bounty is not open");
        assert!(bounty.poster != hunter, "poster cannot claim own bounty");

        bounty.hunter = Some(hunter.clone());
        bounty.status = BountyStatus::InProgress;
        set_bounty(&env, &bounty);

        env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("claim")), (bounty_id, hunter));
    }

    /// Hunter submits work URL — starts the deadline countdown.
    pub fn submit_work(env: Env, hunter: Address, bounty_id: u64, work_url: String) {
        hunter.require_auth();

        let mut bounty = get_bounty(&env, bounty_id).expect("bounty not found");
        assert!(bounty.status == BountyStatus::InProgress, "bounty must be in progress");
        assert!(bounty.hunter == Some(hunter.clone()), "only the assigned hunter can submit work");

        bounty.work_url = Some(work_url);
        bounty.status = BountyStatus::Submitted;
        bounty.submitted_at = Some(env.ledger().timestamp());
        set_bounty(&env, &bounty);

        env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("submit")), (bounty_id, hunter));
    }

    /// Poster approves work — releases XLM to hunter.
    pub fn approve_work(env: Env, poster: Address, bounty_id: u64) {
        poster.require_auth();

        let mut bounty = get_bounty(&env, bounty_id).expect("bounty not found");
        assert!(bounty.poster == poster, "only poster can approve");
        assert!(bounty.status == BountyStatus::Submitted, "work must be submitted first");

        let hunter = bounty.hunter.clone().expect("no hunter assigned");
        release_to(&env, &hunter, bounty.reward);
        increment_reputation(&env, &hunter);

        bounty.status = BountyStatus::Completed;
        set_bounty(&env, &bounty);

        env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("approve")), (bounty_id, poster, hunter, bounty.reward));
    }

    /// Poster disputes work — freezes funds, flags for arbitration.
    pub fn dispute_work(env: Env, poster: Address, bounty_id: u64) {
        poster.require_auth();

        let mut bounty = get_bounty(&env, bounty_id).expect("bounty not found");
        assert!(bounty.poster == poster, "only poster can dispute");
        assert!(bounty.status == BountyStatus::Submitted, "work must be submitted first");

        bounty.status = BountyStatus::Disputed;
        set_bounty(&env, &bounty);

        let hunter = bounty.hunter.clone().expect("no hunter assigned");
        env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("dispute")), (bounty_id, poster, hunter));
    }

    /// Auto-release: callable by anyone after the deadline passes with no response.
    pub fn claim_timeout(env: Env, bounty_id: u64) {
        let mut bounty = get_bounty(&env, bounty_id).expect("bounty not found");
        assert!(bounty.status == BountyStatus::Submitted, "work must be submitted");

        let submitted_at = bounty.submitted_at.expect("submitted_at not set");
        let deadline_secs = bounty.deadline_hours * SECONDS_PER_HOUR;
        let now = env.ledger().timestamp();
        assert!(now >= submitted_at + deadline_secs, "deadline has not passed yet");

        let hunter = bounty.hunter.clone().expect("no hunter assigned");
        release_to(&env, &hunter, bounty.reward);
        increment_reputation(&env, &hunter);

        bounty.status = BountyStatus::Completed;
        set_bounty(&env, &bounty);

        env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("timeout")), (bounty_id, hunter, bounty.reward));
    }

    /// Arbitrator only: resolve dispute in favour of hunter or poster.
    pub fn arbitrate(env: Env, arbitrator: Address, bounty_id: u64, release_to_hunter: bool) {
        arbitrator.require_auth();

        let stored_arb = get_arbitrator(&env).expect("not initialized");
        assert!(arbitrator == stored_arb, "only arbitrator can arbitrate");

        let mut bounty = get_bounty(&env, bounty_id).expect("bounty not found");
        assert!(bounty.status == BountyStatus::Disputed, "bounty is not disputed");

        if release_to_hunter {
            let hunter = bounty.hunter.clone().expect("no hunter");
            release_to(&env, &hunter, bounty.reward);
            increment_reputation(&env, &hunter);
            bounty.status = BountyStatus::Completed;
            env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("arb_win")), (bounty_id, hunter, bounty.reward));
        } else {
            release_to(&env, &bounty.poster, bounty.reward);
            bounty.status = BountyStatus::Refunded;
            env.events().publish((soroban_sdk::symbol_short!("Bounty"), soroban_sdk::symbol_short!("arb_loss")), (bounty_id, bounty.poster.clone(), bounty.reward));
        }
        set_bounty(&env, &bounty);
    }

    // ─── Read functions ───────────────────────────────────────────────────────

    pub fn get_bounty(env: Env, bounty_id: u64) -> Bounty {
        get_bounty(&env, bounty_id).expect("bounty not found")
    }

    pub fn get_all_bounties(env: Env) -> Vec<Bounty> {
        let count = get_bounty_count(&env);
        let mut result = Vec::new(&env);
        for i in 1..=count {
            if let Some(b) = get_bounty(&env, i) {
                result.push_back(b);
            }
        }
        result
    }

    pub fn get_bounties_by_poster(env: Env, poster: Address) -> Vec<Bounty> {
        let count = get_bounty_count(&env);
        let mut result = Vec::new(&env);
        for i in 1..=count {
            if let Some(b) = get_bounty(&env, i) {
                if b.poster == poster {
                    result.push_back(b);
                }
            }
        }
        result
    }

    pub fn get_bounties_by_hunter(env: Env, hunter: Address) -> Vec<Bounty> {
        let count = get_bounty_count(&env);
        let mut result = Vec::new(&env);
        for i in 1..=count {
            if let Some(b) = get_bounty(&env, i) {
                if b.hunter == Some(hunter.clone()) {
                    result.push_back(b);
                }
            }
        }
        result
    }

    pub fn get_reputation(env: Env, wallet: Address) -> u64 {
        get_reputation(&env, &wallet)
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

fn release_to(env: &Env, recipient: &Address, amount: i128) {
    let native_token = token::Client::new(env, &get_native_token(env));
    native_token.transfer(&env.current_contract_address(), recipient, &amount);
}
