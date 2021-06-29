let dailyLimit = ethers.utils.parseEther("0.01");

let LendingPool = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
let IncentivesController = "0x357D51124f59836DeD84c8a1730D72B749d8BC23";
let amWMATIC = "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4";
let WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

module.exports = [
    process.env.MATIC_OWNER_ADDRESS,
    process.env.MATIC_FAUCET_HANDLER_ADDRESS,
    process.env.MATIC_FAUCET_TARGET_ADDRESS,
    dailyLimit,
    LendingPool,
    IncentivesController,
    amWMATIC,
    WMATIC,
];
