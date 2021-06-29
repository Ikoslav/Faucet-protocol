let sleep = ms => new Promise(res => setTimeout(res, ms));

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

// https://hardhat.org/tutorial/testing-contracts.html

describe("Faucet contract", function () {

    // ERROS
    let ONLY_OWNER = "1";
    let NO_FALLBACK = "2";
    let VALUE_TRANSFER_FAILED = "3";
    let ON_COOLDOWN = "4";
    let EXCEEDING_DAILY_LIMIT = "5";
    let NOT_ENOUGH_FUNDS = "6";
    let AMOUNT_CANNOT_BE_ZERO = "7";
    let DAILY_LIMIT_CANNOT_BE_ZERO = "8";
    let ONLY_FAUCET_HANDLER = "9";

    let LendingPool;
    let IncentivesController;
    let amWMATIC;
    let WMATIC;

    let testingOnLiveNet;

    if (hre.network.name == "hardhat") {
        testingOnLiveNet = false;
        // ADDRESSES FROM MATIC MAINNET - BECAUSE WE USE FORKING
        LendingPool = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
        IncentivesController = "0x357D51124f59836DeD84c8a1730D72B749d8BC23";
        amWMATIC = "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4";
        WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    }
    else if (hre.network.name == "mumbai") {
        testingOnLiveNet = true;

        // ADDRESSES FROM MUMBAI TESTNET
        LendingPool = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
        IncentivesController = "0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644";
        amWMATIC = "0xF45444171435d0aCB08a8af493837eF18e86EE27";
        WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
    }
    else {
        console.log("WRONG NETWORK FOR THIS TEST");
    }

    // https://docs.ethers.io/v4/api-utils.html
    let dailyLimit = ethers.utils.parseEther("0.001");

    let Faucet;
    let faucet;

    let owner;
    let faucetTarget;

    before(async function () {
        Faucet = await ethers.getContractFactory("Faucet");

        const accounts = await ethers.getSigners();
        owner = accounts[0];
        faucetTarget = accounts[1];
    });

    beforeEach(async function () {
        this.timeout(1000000);

        faucet = await Faucet.deploy(
            owner.address, // faucetOwner
            owner.address, // owner will be also faucetHandler
            faucetTarget.address, // faucetTarget
            dailyLimit,
            LendingPool,
            IncentivesController,
            amWMATIC,
            WMATIC);
    });

    describe("Deployment", function () {
        this.timeout(1000000);

        it("Should set the right deplyment variables", async function () {
            expect(await faucet.faucetOwner()).to.equal(owner.address);
            expect(await faucet.faucetHandler()).to.equal(owner.address);
            expect(await faucet.faucetTarget()).to.equal(faucetTarget.address);
            expect(await faucet.dailyLimit()).to.equal(dailyLimit); // if daily limit is 0 contract will be crated with value 1
            expect(await faucet.cooldownEnds()).to.equal(ethers.BigNumber.from(0));
            expect(await faucet.lendingPool()).to.equal(LendingPool);
            expect(await faucet.incentivesController()).to.equal(IncentivesController);
            expect(await faucet.aweth()).to.equal(amWMATIC);
            expect(await faucet.weth()).to.equal(WMATIC);
        });

        it("Should revert when setDailyLimit is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).setDailyLimit(0)
            ).to.be.revertedWith(ONLY_OWNER);
        });

        it("Should revert when setDailyLimit is set to 0", async function () {
            await expect(faucet.setDailyLimit(0)
            ).to.be.revertedWith(DAILY_LIMIT_CANNOT_BE_ZERO);
        });

        it("Should set daily limit", async function () {
            const newDailyLimit = ethers.utils.parseEther("0.00125");
            await (await faucet.setDailyLimit(newDailyLimit)).wait();
            expect(await faucet.dailyLimit()).to.equal(newDailyLimit);
        });

        it("Should revert transaction when setOwner is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).setFaucetOwner(faucetTarget.address)
            ).to.be.revertedWith(ONLY_OWNER);
        });

        it("Should revert transaction when setFaucetTarget is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).setFaucetTarget(faucetTarget.address)
            ).to.be.revertedWith(ONLY_OWNER);
        });

        it("Should set faucet owner", async function () {
            await (await faucet.setFaucetOwner(faucetTarget.address)).wait();
            expect(await faucet.faucetOwner()).to.equal(faucetTarget.address);
        });

        it("Should set faucet target", async function () {
            await (await faucet.setFaucetTarget(owner.address)).wait();
            expect(await faucet.faucetTarget()).to.equal(owner.address);
        });

        it("Should set faucet handler", async function () {
            await (await faucet.setFaucetHandler(faucetTarget.address)).wait();
            expect(await faucet.faucetHandler()).to.equal(faucetTarget.address);
        });

        it("Should convert directly send eth to aTokens (faucet funds)", async function () {
            const sendingValue = ethers.utils.parseEther("0.0001");

            await SendEthTo(owner, faucet.address, sendingValue);

            // CONFIRM from faucet funds.
            expect((await faucet.faucetFunds()).gte(sendingValue));

            // CONFIRM independently from token address
            expect((await ERC20_Balance(amWMATIC, faucet.address)).gte(sendingValue));
        });

        it("Should revert transaction when emergencyEtherTransfer is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).emergencyEtherTransfer(faucetTarget.address, 0)
            ).to.be.revertedWith(ONLY_OWNER);
        });

        it("Should revert transaction when tokenTransfer is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).tokenTransfer(amWMATIC, faucetTarget.address, 0)
            ).to.be.revertedWith(ONLY_OWNER);
        });

        it("Should retrieve stuck ether in contract", async function () {
            const sendingValue = ethers.utils.parseEther("0.0001");

            SelfdestructTransfer = await ethers.getContractFactory("SelfdestructTransfer");
            selfdestructTransfer = await SelfdestructTransfer.deploy();

            expect((await AddressBalance(faucet.address)).eq(ethers.BigNumber.from(0)));
            await (await selfdestructTransfer.destroyAndTransfer(faucet.address, { value: sendingValue })).wait();
            // now we got stuck eth on faucet contract
            expect((await AddressBalance(faucet.address)).eq(sendingValue));

            // we send stuck eth to owner address and check.
            ownerBalanceBefore = await AddressBalance(owner.address);
            await (await faucet.emergencyEtherTransfer(owner.address, sendingValue)).wait();
            ownerBalanceAfter = await AddressBalance(owner.address);

            expect(ownerBalanceAfter.eq(ownerBalanceBefore.add(sendingValue)));
        });

        it("Should retrieve stuck tokens in contract", async function () {
            const sendingValue = ethers.utils.parseEther("0.0002");

            await SendEthTo(owner, faucet.address, sendingValue);
            await (await faucet.tokenTransfer(amWMATIC, owner.address, sendingValue, { gasLimit: 300000 })).wait(); // override gas limit was faliing out of gas
            expect((await ERC20_Balance(amWMATIC, owner.address)).eq(sendingValue));
        });
    });

    describe("Faucet Drop", function () {
        this.timeout(1000000);

        it("Should revert doFaucetDrop when not callen by faucetHandler", async function () {
            await expect(faucet.connect(faucetTarget).doFaucetDrop(dailyLimit)
            ).to.be.revertedWith(ONLY_FAUCET_HANDLER);
        });

        it("Should revert doFaucetDrop because we exceed daily limit", async function () {
            const funds = dailyLimit.add(1); // exceed daily limit

            await SendEthTo(owner, faucet.address, funds);

            await expect(faucet.doFaucetDrop(funds)
            ).to.be.revertedWith(EXCEEDING_DAILY_LIMIT);
        });

        it("Should revert doFaucetDrop because we exceed funds", async function () {
            const halfDailyLimit = dailyLimit.div(2);
            const quarterDailyLimit = dailyLimit.div(4);

            // Fund quarter of daily limit 
            await SendEthTo(owner, faucet.address, quarterDailyLimit);
            // doFaucetDrop with more that we have, but within daily limit
            await expect(faucet.doFaucetDrop(halfDailyLimit)
            ).to.be.revertedWith(NOT_ENOUGH_FUNDS);
        });


        it("Should revert doFaucetDrop with amount == 0", async function () {
            await expect(faucet.doFaucetDrop(0) // ZERO AMOUNT TO DROP - potential div by zero
            ).to.be.revertedWith(AMOUNT_CANNOT_BE_ZERO);
        });

        it("Should do faucet drop.", async function () {
            const twoTimesDailyLimit = dailyLimit.mul(2);
            const quarterDailyLimit = dailyLimit.div(4); // dailyLimit 0.001

            await SendEthTo(owner, faucet.address, twoTimesDailyLimit); // Get more than enough funds for this operation.

            const faucetTargetBalanceBefore = await AddressBalance(faucetTarget.address);
            //console.log("faucetTargetBalanceBefore", faucetTargetBalanceBefore.toString());
            await (await faucet.doFaucetDrop(quarterDailyLimit, { gasLimit: 800000 })).wait(); // 0,00025   +  // Failing to estimate gas override
            const faucetTargetBalanceAfter = await AddressBalance(faucetTarget.address);
            //console.log("faucetTargetBalanceAfter", faucetTargetBalanceAfter.toString());
            //console.log("we did drop of ", quarterDailyLimit.toString());

            expect(faucetTargetBalanceAfter.eq(faucetTargetBalanceBefore.add(quarterDailyLimit)));
        });

        it("Should trigger faucet drop cooldown.", async function () {
            const twoTimesDailyLimit = dailyLimit.mul(2);
            const quarterDailyLimit = dailyLimit.div(4);

            await SendEthTo(owner, faucet.address, twoTimesDailyLimit); // Get more than enough funds for this operation.

            await (await faucet.doFaucetDrop(quarterDailyLimit, { gasLimit: 800000 })).wait(); // Failing to estimate gas override
            await expect(faucet.doFaucetDrop(quarterDailyLimit)
            ).to.be.revertedWith(ON_COOLDOWN);
        });

        it("Should do two faucet drops.", async function () {
            await SendEthTo(owner, faucet.address, dailyLimit); // Get more than enough funds for this operation.

            // Calculate amount that it triggers for x seconds
            const cecondsInADay = 86400;
            const seconds = 15; // keep this big enough 
            const amount = dailyLimit.mul(seconds).div(cecondsInADay);

            var faucetTargetBalanceBefore;
            var faucetTargetBalanceAfter;

            faucetTargetBalanceBefore = await AddressBalance(faucetTarget.address);
            await (await faucet.doFaucetDrop(amount, { gasLimit: 800000 })).wait();  // Failing to estimate gas override
            await expect(faucet.doFaucetDrop(amount)).to.be.revertedWith(ON_COOLDOWN); // next drop right after should be on cooldown.
            faucetTargetBalanceAfter = await AddressBalance(faucetTarget.address);

            expect(faucetTargetBalanceAfter.eq(faucetTargetBalanceBefore.add(amount)));

            await sleep(seconds * 1000);

            faucetTargetBalanceBefore = await AddressBalance(faucetTarget.address);
            await (await faucet.doFaucetDrop(amount, { gasLimit: 800000 })).wait(); // Failing to estimate gas override
            await expect(faucet.doFaucetDrop(amount)).to.be.revertedWith(ON_COOLDOWN); // next drop right after should be on cooldown.
            faucetTargetBalanceAfter = await AddressBalance(faucetTarget.address);

            expect(faucetTargetBalanceAfter.eq(faucetTargetBalanceBefore.add(amount)));
        });
    });

    describe("Testing incentives only on live net.", function () {
        this.timeout(1000000);

        if (testingOnLiveNet) {

            it("Getting incentives", async function () {
                const seconds = 10;

                await SendEthTo(owner, faucet.address, dailyLimit);
                await sleep(seconds * 1000);

                const rewardsBeforeClaim = await faucet.rewardsAmount();

                expect(rewardsBeforeClaim.gt(0));
            });

            it("claim incentives", async function () {
                //const sleep = ms => new Promise(res => setTimeout(res, ms));
                const seconds = 30;

                await SendEthTo(owner, faucet.address, dailyLimit);
                await sleep(seconds * 1000);

                const rewardsBeforeClaim = await faucet.rewardsAmount();
                const fundsBeforeClaim = await faucet.faucetFunds();

                await (await faucet.claimRewards()).wait();

                const rewardsAfterClaming = await faucet.rewardsAmount();

                const fundsAfterClaim = await faucet.faucetFunds();

                expect(rewardsBeforeClaim.gte(rewardsAfterClaming));
                expect(fundsAfterClaim.gte(fundsBeforeClaim.add(rewardsBeforeClaim)));
            });
        }
    });

});

async function ERC20_Balance(tokenAddress, ownerAddress) {
    const tokenContract = await ethers.getContractAt(await IERC20_ABI(), tokenAddress, ethers.provider);
    return await tokenContract.balanceOf(ownerAddress);
}

async function SendEthTo(signer, address, wei) {
    await signer.sendTransaction({
        to: address,
        gasPrice: 8000000000,
        gasLimit: 500000,
        value: wei,
    });
}

async function IERC20_ABI() {
    return (await artifacts.readArtifact("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20")).abi;
}

async function AddressBalance(address) {
    return await ethers.provider.getBalance(address);
}

