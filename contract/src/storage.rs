use soroban_sdk::{contracttype, Address, Env};
use crate::bounty::Bounty;

#[contracttype]
pub enum DataKey {
    BountyCount,
    Bounty(u64),
    Reputation(Address),
    Arbitrator,
    NativeToken,
}

pub fn get_bounty_count(env: &Env) -> u64 {
    env.storage().instance().get(&DataKey::BountyCount).unwrap_or(0u64)
}

pub fn set_bounty_count(env: &Env, count: u64) {
    env.storage().instance().set(&DataKey::BountyCount, &count);
}

pub fn get_bounty(env: &Env, id: u64) -> Option<Bounty> {
    env.storage().persistent().get(&DataKey::Bounty(id))
}

pub fn set_bounty(env: &Env, bounty: &Bounty) {
    env.storage()
        .persistent()
        .set(&DataKey::Bounty(bounty.id), bounty);
}

pub fn get_arbitrator(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Arbitrator)
}

pub fn set_arbitrator(env: &Env, arbitrator: &Address) {
    env.storage().instance().set(&DataKey::Arbitrator, arbitrator);
}

pub fn get_native_token(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::NativeToken)
        .expect("native token not set — call initialize first")
}

pub fn set_native_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::NativeToken, token);
}

pub fn get_reputation(env: &Env, wallet: &Address) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::Reputation(wallet.clone()))
        .unwrap_or(0u64)
}

pub fn increment_reputation(env: &Env, wallet: &Address) {
    let current = get_reputation(env, wallet);
    env.storage()
        .persistent()
        .set(&DataKey::Reputation(wallet.clone()), &(current + 1));
}
