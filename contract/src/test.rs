#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env, String,
};

// Helper: set up env with a registered native token and initialized contract
fn setup() -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SkillBountyContract);
    let arbitrator = Address::generate(&env);

    // Create a test "native" token (SAC) owned by the arbitrator
    let token_id = env.register_stellar_asset_contract(arbitrator.clone());

    let client = SkillBountyContractClient::new(&env, &contract_id);
    client.initialize(&arbitrator, &token_id);

    (env, contract_id, arbitrator, token_id)
}

fn make_string(env: &Env, s: &str) -> String {
    String::from_str(env, s)
}

fn mint_tokens(env: &Env, token_id: &Address, to: &Address, amount: i128) {
    let token_admin = token::StellarAssetClient::new(env, token_id);
    token_admin.mint(to, &amount);
}

// ─── Test 1: post_bounty creates an entry ────────────────────────────────────
#[test]
fn test_post_bounty_creates_entry() {
    let (env, contract_id, _, token_id) = setup();
    let client = SkillBountyContractClient::new(&env, &contract_id);

    let poster = Address::generate(&env);
    mint_tokens(&env, &token_id, &poster, 100_000_000);

    let id = client.post_bounty(
        &poster,
        &make_string(&env, "Build a UI"),
        &make_string(&env, "Build a nice UI"),
        &10_000_000i128,
        &72u64,
        &soroban_sdk::vec![&env, make_string(&env, "Frontend")],
    );

    assert_eq!(id, 1u64);
    let bounty = client.get_bounty(&id);
    assert_eq!(bounty.poster, poster);
    assert_eq!(bounty.status, BountyStatus::Open);
    assert_eq!(bounty.reward, 10_000_000i128);
}

// ─── Test 2: claim_bounty changes status to InProgress ───────────────────────
#[test]
fn test_claim_bounty_changes_status() {
    let (env, contract_id, _, token_id) = setup();
    let client = SkillBountyContractClient::new(&env, &contract_id);

    let poster = Address::generate(&env);
    let hunter = Address::generate(&env);
    mint_tokens(&env, &token_id, &poster, 100_000_000);

    let id = client.post_bounty(
        &poster,
        &make_string(&env, "Write tests"),
        &make_string(&env, "All green"),
        &10_000_000i128,
        &72u64,
        &soroban_sdk::vec![&env, make_string(&env, "Backend")],
    );

    client.claim_bounty(&hunter, &id);

    let bounty = client.get_bounty(&id);
    assert_eq!(bounty.status, BountyStatus::InProgress);
    assert_eq!(bounty.hunter, Some(hunter));
}

// ─── Test 3: approve_work releases funds and increments reputation ────────────
#[test]
fn test_approve_work_releases_funds() {
    let (env, contract_id, _, token_id) = setup();
    let client = SkillBountyContractClient::new(&env, &contract_id);

    let poster = Address::generate(&env);
    let hunter = Address::generate(&env);
    mint_tokens(&env, &token_id, &poster, 100_000_000);

    let id = client.post_bounty(
        &poster,
        &make_string(&env, "Design logo"),
        &make_string(&env, "SVG needed"),
        &10_000_000i128,
        &72u64,
        &soroban_sdk::vec![&env, make_string(&env, "Design")],
    );

    client.claim_bounty(&hunter, &id);
    client.submit_work(&hunter, &id, &make_string(&env, "https://figma.com/work"));
    client.approve_work(&poster, &id);

    let bounty = client.get_bounty(&id);
    assert_eq!(bounty.status, BountyStatus::Completed);
    assert_eq!(client.get_reputation(&hunter), 1u64);
}

// ─── Test 4: claim_timeout releases to hunter after deadline ─────────────────
#[test]
fn test_timeout_releases_to_hunter() {
    let (env, contract_id, _, token_id) = setup();
    let client = SkillBountyContractClient::new(&env, &contract_id);

    let poster = Address::generate(&env);
    let hunter = Address::generate(&env);
    mint_tokens(&env, &token_id, &poster, 100_000_000);

    env.ledger().set_timestamp(1_000_000u64);

    let id = client.post_bounty(
        &poster,
        &make_string(&env, "Write docs"),
        &make_string(&env, "Markdown"),
        &10_000_000i128,
        &1u64, // 1-hour deadline for testing
        &soroban_sdk::vec![&env, make_string(&env, "Writing")],
    );

    client.claim_bounty(&hunter, &id);
    client.submit_work(&hunter, &id, &make_string(&env, "https://notion.so/docs"));

    // Advance past the 1-hour deadline
    env.ledger().set_timestamp(1_003_601u64);
    client.claim_timeout(&id);

    let bounty = client.get_bounty(&id);
    assert_eq!(bounty.status, BountyStatus::Completed);
}

// ─── Test 5: only arbitrator can arbitrate ───────────────────────────────────
#[test]
#[should_panic(expected = "only arbitrator can arbitrate")]
fn test_only_arbitrator_can_arbitrate() {
    let (env, contract_id, _, token_id) = setup();
    let client = SkillBountyContractClient::new(&env, &contract_id);

    let poster = Address::generate(&env);
    let hunter = Address::generate(&env);
    let fake_arb = Address::generate(&env);
    mint_tokens(&env, &token_id, &poster, 100_000_000);

    let id = client.post_bounty(
        &poster,
        &make_string(&env, "Fix bug"),
        &make_string(&env, "Critical"),
        &10_000_000i128,
        &72u64,
        &soroban_sdk::vec![&env, make_string(&env, "Other")],
    );

    client.claim_bounty(&hunter, &id);
    client.submit_work(&hunter, &id, &make_string(&env, "https://github.com/pr/1"));
    client.dispute_work(&poster, &id);

    // Should panic — fake_arb is not the real arbitrator
    client.arbitrate(&fake_arb, &id, &true);
}
