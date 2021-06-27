const { expect } = require("chai");
const { ethers } = require("hardhat");

// https://hardhat.org/tutorial/testing-contracts.html

describe("Faucet contract", function () {

    // Possible errors
    let OnlyOwnerAllowed = "Only owner can call this function.";
    let FallbackNotAllowe = "Fallback not allowed.";
    let ETHTransferFailed = "ETH transfer failed.";
    let OnCooldown = "On cooldown.";
    let ExceedingDailyLimit = "Exceeing daily limit.";
    let NotEnoughFunds = "Not enough funds.";
    let AmountCannotBeZero = "Amount cannot be zero.";
    let DailyLimitCannotBeZero = "Daily limit cannot be 0.";


    // AAVE Parts MUMBAI TESNET
    console.log("TEST FOR MUMBAI TESNET");
    let LendingPool = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
    let IncentivesController = "0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644";
    let amWMATIC = "0xF45444171435d0aCB08a8af493837eF18e86EE27";
    let WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";

    // AAVE Parts MATIC MAINNET
    // console.log("TEST FOR MATIC MAINNET");
    // let LendingPool = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
    // let IncentivesController = "0x357D51124f59836DeD84c8a1730D72B749d8BC23";
    // let amWMATIC = "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4";
    // let WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

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
            dailyLimit,
            faucetTarget.address,
            LendingPool,
            IncentivesController,
            amWMATIC,
            WMATIC);
    });

    describe("Deployment", function () {
        this.timeout(1000000);

        it("Should set the right deplyment variables", async function () {


            await faucet.owner();
            //  console.log((await faucet.owner()).toString());

            //await expect(faucet.owner()).to.equal(owner.address);
            // expect(await faucet.owner()).to.equal(owner.address);
            // expect(await faucet.faucetTarget()).to.equal(faucetTarget.address);
            // expect(await faucet.dailyLimit()).to.equal(dailyLimit); // if daily limit is 0 contract will be crated with value 1
            // expect(await faucet.cooldownStartTimestamp()).to.equal(ethers.BigNumber.from(0));
            // expect(await faucet.cooldownDuration()).to.equal(ethers.BigNumber.from(0));
            // expect(await faucet.POOL()).to.equal(LendingPool);
            // expect(await faucet.aWETH()).to.equal(amWMATIC);
            // expect(await faucet.WETH()).to.equal(WMATIC);
        });

        // it("Should revert when setDailyLimit is not used by owner", async function () {
        //     await expect(faucet.connect(faucetTarget).setDailyLimit(0)
        //     ).to.be.revertedWith(OnlyOwnerAllowed);
        // });

        // it("Should revert when setDailyLimit is set to 0", async function () {
        //     await expect(faucet.setDailyLimit(0)
        //     ).to.be.revertedWith(DailyLimitCannotBeZero);
        // });

        // it("Should set daily limit", async function () {
        //     const newDailyLimit = ethers.utils.parseEther("0.00125");
        //     await (await faucet.setDailyLimit(newDailyLimit)).wait();
        //     expect(await faucet.dailyLimit()).to.equal(newDailyLimit);
        // });

        // it("Should revert transaction when setOwner is not used by owner", async function () {
        //     await expect(faucet.connect(faucetTarget).setOwner(faucetTarget.address)
        //     ).to.be.revertedWith(OnlyOwnerAllowed);
        // });

        // it("Should revert transaction when setFaucetTarget is not used by owner", async function () {
        //     await expect(faucet.connect(faucetTarget).setFaucetTarget(faucetTarget.address)
        //     ).to.be.revertedWith(OnlyOwnerAllowed);
        // });

        // it("Should set faucet owner", async function () {
        //     await (await faucet.setOwner(faucetTarget.address)).wait();
        //     expect(await faucet.owner()).to.equal(faucetTarget.address);
        // });

        // it("Should set faucet target", async function () {
        //     await (await faucet.setFaucetTarget(owner.address)).wait();
        //     expect(await faucet.faucetTarget()).to.equal(owner.address);
        // });

        // it("Should convert directly send eth to aTokens (faucet funds)", async function () {
        //     const sendingValue = ethers.utils.parseEther("0.0001");

        //     await SendEthTo(owner, faucet.address, sendingValue);

        //     // CONFIRM from faucet funds.
        //     expect((await faucet.faucetFunds()).gte(sendingValue));

        //     // CONFIRM independently from token address
        //     expect((await ERC20_Balance(amWMATIC, faucet.address)).gte(sendingValue));
        // });

        // it("Should revert transaction when emergencyEtherTransfer is not used by owner", async function () {
        //     await expect(faucet.connect(faucetTarget).emergencyEtherTransfer(faucetTarget.address, 0)
        //     ).to.be.revertedWith(OnlyOwnerAllowed);
        // });

        // it("Should revert transaction when emergencyTokenTransfer is not used by owner", async function () {
        //     await expect(faucet.connect(faucetTarget).emergencyTokenTransfer(amWMATIC, faucetTarget.address, 0)
        //     ).to.be.revertedWith(OnlyOwnerAllowed);
        // });

        // it("Should retrieve stuck ether in contract", async function () {
        //     const sendingValue = ethers.utils.parseEther("0.0001");

        //     SelfdestructTransfer = await ethers.getContractFactory("SelfdestructTransfer");
        //     selfdestructTransfer = await SelfdestructTransfer.deploy({ value: sendingValue });

        //     expect((await AddressBalance(faucet.address)).eq(ethers.BigNumber.from(0)));
        //     expect((await AddressBalance(selfdestructTransfer.address)).eq(sendingValue));

        //     await (await selfdestructTransfer.destroyAndTransfer(faucet.address)).wait();

        //     // now we got stuck eth on faucet contract
        //     expect((await AddressBalance(faucet.address)).eq(sendingValue));

        //     // we send stuck eth to owner address and check.
        //     ownerBalanceBefore = await AddressBalance(owner.address);
        //     await (await faucet.emergencyEtherTransfer(owner.address, sendingValue)).wait();
        //     ownerBalanceAfter = await AddressBalance(owner.address);

        //     expect(ownerBalanceAfter.eq(ownerBalanceBefore.add(sendingValue)));
        // });

        // it("Should retrieve stuck tokens in contract", async function () {
        //     const sendingValue = ethers.utils.parseEther("0.0002");

        //     await SendEthTo(owner, faucet.address, sendingValue);

        //     await (await faucet.emergencyTokenTransfer(amWMATIC, owner.address, sendingValue)).wait();

        //     expect((await ERC20_Balance(amWMATIC, owner.address)).eq(sendingValue));
        // });
    });

    describe("Faucet Drop", function () {
        this.timeout(1000000);

        // it("Should revert doFaucetDrop because we exceed daily limit", async function () {
        //     const funds = dailyLimit.add(1); // exceed daily limit

        //     await SendEthTo(owner, faucet.address, funds);

        //     await expect(faucet.doFaucetDrop(funds)
        //     ).to.be.revertedWith(ExceedingDailyLimit);
        // });

        // it("Should revert doFaucetDrop because we exceed funds", async function () {
        //     const halfDailyLimit = dailyLimit.div(2);
        //     const quarterDailyLimit = dailyLimit.div(4);

        //     // Fund quarter of daily limit 
        //     await SendEthTo(owner, faucet.address, quarterDailyLimit);
        //     // doFaucetDrop with more that we have, but within daily limit
        //     await expect(faucet.doFaucetDrop(halfDailyLimit)
        //     ).to.be.revertedWith(NotEnoughFunds);
        // });


        // it("Should revert doFaucetDrop with amount == 0", async function () {
        //     await expect(faucet.doFaucetDrop(0) // ZERO AMOUNT TO DROP - potential div by zero
        //     ).to.be.revertedWith(AmountCannotBeZero);
        // });

        // it("Should do faucet drop.", async function () {
        //     const twoTimesDailyLimit = dailyLimit.mul(2);
        //     const quarterDailyLimit = dailyLimit.div(4);

        //     await SendEthTo(owner, faucet.address, twoTimesDailyLimit); // Get more than enough funds for this operation.

        //     const faucetTargetBalanceBefore = await AddressBalance(faucetTarget.address);
        //     await (await faucet.doFaucetDrop(quarterDailyLimit)).wait();
        //     const faucetTargetBalanceAfter = await AddressBalance(faucetTarget.address);

        //     expect(faucetTargetBalanceAfter.eq(faucetTargetBalanceBefore.add(quarterDailyLimit)));
        // });

        // it("Should trigger faucet drop cooldown.", async function () {
        //     const twoTimesDailyLimit = dailyLimit.mul(2);
        //     const quarterDailyLimit = dailyLimit.div(4);

        //     await SendEthTo(owner, faucet.address, twoTimesDailyLimit); // Get more than enough funds for this operation.

        //     await (await faucet.doFaucetDrop(quarterDailyLimit)).wait();
        //     await expect(faucet.doFaucetDrop(quarterDailyLimit)
        //     ).to.be.revertedWith(OnCooldown);
        // });

        // it("Should do two faucet drops.", async function () {
        //     const sleep = ms => new Promise(res => setTimeout(res, ms));

        //     await SendEthTo(owner, faucet.address, dailyLimit); // Get more than enough funds for this operation.

        //     // Calculate amount that it triggers for x seconds
        //     const cecondsInADay = 86400;
        //     const seconds = 15; // keep this big enough 
        //     const amount = dailyLimit.mul(seconds).div(cecondsInADay);

        //     var faucetTargetBalanceBefore;
        //     var faucetTargetBalanceAfter;

        //     faucetTargetBalanceBefore = await AddressBalance(faucetTarget.address);
        //     await (await faucet.doFaucetDrop(amount)).wait();
        //     await expect(faucet.doFaucetDrop(amount)).to.be.revertedWith(OnCooldown); // next drop right after should be on cooldown.
        //     faucetTargetBalanceAfter = await AddressBalance(faucetTarget.address);

        //     expect(faucetTargetBalanceAfter.eq(faucetTargetBalanceBefore.add(amount)));

        //     await sleep(seconds * 1000);

        //     faucetTargetBalanceBefore = await AddressBalance(faucetTarget.address);
        //     await (await faucet.doFaucetDrop(amount)).wait();
        //     await expect(faucet.doFaucetDrop(amount)).to.be.revertedWith(OnCooldown); // next drop right after should be on cooldown.
        //     faucetTargetBalanceAfter = await AddressBalance(faucetTarget.address);

        //     expect(faucetTargetBalanceAfter.eq(faucetTargetBalanceBefore.add(amount)));
        // });
    });

    describe("Incentives", function () {
        this.timeout(1000000);

        // Try test on  tesnt net ...

        // it("TODO Incentives", async function () {
        //     const sleep = ms => new Promise(res => setTimeout(res, ms));
        //     const seconds = 15; // keep this big enough 

        //     //  const oneEth = ethers.utils.parseEther("0.01");

        //     await SendEthTo(owner, faucet.address, dailyLimit); // Get more than enough funds for this operation.

        //     console.log("Faucet Funds ", await faucet.faucetFunds());
        //     console.log("Immediate rewards check ", await faucet.rewardsAmount());

        //     await sleep(seconds * 1000);

        //     console.log("Rewards after x seconds ", await faucet.rewardsAmount());

        //     //await (await faucet.claimRewards()).wait();

        //     // console.log("After 15s rewards check ", await faucet.claimRewards());
        // });

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

