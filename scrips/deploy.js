let sleep = ms => new Promise(res => setTimeout(res, ms));

const hre = require("hardhat");
require('dotenv').config();

async function main() {

    let LendingPool = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
    let IncentivesController = "0x357D51124f59836DeD84c8a1730D72B749d8BC23";
    let amWMATIC = "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4";
    let WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

    let dailyLimit = ethers.utils.parseEther("0.01");

    if (hre.network.name != "matic") {
        console.log("WRONG NETWORK! This script is prepared only for matic mainnet deployment.");
    }
    else {
        const Faucet = await hre.ethers.getContractFactory("Faucet");

        faucet = await Faucet.deploy(
            process.env.MATIC_OWNER_ADDRESS,
            process.env.MATIC_FAUCET_HANDLER_ADDRESS,
            process.env.MATIC_FAUCET_TARGET_ADDRESS,
            dailyLimit,
            LendingPool,
            IncentivesController,
            amWMATIC,
            WMATIC);

        await faucet.deployed();
        console.log("Faucet deployed to address:", faucet.address);

        const seconds = 60;
        console.log("We will wait for seconds:", seconds);
        await sleep(seconds * 1000);

        console.log("Let's verify...");

        await hre.run("verify:verify", {
            address: faucet.address,
            constructorArguments: [
                process.env.MATIC_OWNER_ADDRESS,
                process.env.MATIC_FAUCET_HANDLER_ADDRESS,
                process.env.MATIC_FAUCET_TARGET_ADDRESS,
                dailyLimit,
                LendingPool,
                IncentivesController,
                amWMATIC,
                WMATIC,
            ],
        });

    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
