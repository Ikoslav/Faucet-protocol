let sleep = ms => new Promise(res => setTimeout(res, ms));

const hre = require("hardhat");
require('dotenv').config();

async function main() {

    let LendingPool = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
    let IncentivesController = "0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644";
    let amWMATIC = "0xF45444171435d0aCB08a8af493837eF18e86EE27";
    let WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";

    let dailyLimit = ethers.utils.parseEther("0.01");

    if (hre.network.name != "mumbai") {
        console.log("WRONG NETWORK! This script is prepared only for mumbai testnet deployment.");
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
