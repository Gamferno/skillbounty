use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum BountyStatus {
    Open,
    InProgress,
    Submitted,
    Completed,
    Disputed,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Bounty {
    pub id: u64,
    pub poster: Address,
    pub hunter: Option<Address>,
    pub title: String,
    pub description: String,
    pub reward: i128, // in stroops (1 XLM = 10_000_000)
    pub work_url: Option<String>,
    pub status: BountyStatus,
    pub created_at: u64,
    pub submitted_at: Option<u64>,
    pub deadline_hours: u64, // default 72
}
