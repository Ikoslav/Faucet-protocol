const { expect } = require("chai");
const { ethers } = require("hardhat");

// https://hardhat.org/tutorial/testing-contracts.html

describe("Faucet contract - MATIC MAINNET", function () {

    // Possible errors
    let OnlyOwnerAllowed = "Only owner can call this function.";
    let FallbackNotAllowe = "Fallback not allowed.";
    let ETHTransferFailed = "ETH transfer failed.";

    // AAVE Parts MUMBAI TESNET
    // let LendingPool = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
    // let IncentivesController = "0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644";
    // let amWMATIC = "0xF45444171435d0aCB08a8af493837eF18e86EE27";
    // let WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";

    // AAVE Parts MATIC MAINNET
    let LendingPool = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
    let IncentivesController = "0x357D51124f59836DeD84c8a1730D72B749d8BC23";
    let amWMATIC = "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4";
    let WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

    // https://docs.ethers.io/v4/api-utils.html
    let dailyLimit = ethers.utils.parseEther("0.01");

    let Faucet;
    let faucet;

    let owner;
    let faucetTarget;

    before(async function () {
        const accounts = await ethers.getSigners();
        owner = accounts[0];
        faucetTarget = accounts[1];
    });

    beforeEach(async function () {
        this.timeout(1000000);

        Faucet = await ethers.getContractFactory("Faucet");

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
            expect(await faucet.owner()).to.equal(owner.address);
            expect(await faucet.faucetTarget()).to.equal(faucetTarget.address);
            expect(await faucet.dailyLimit()).to.equal(dailyLimit);
            expect(await faucet.cooldownStartTimestamp()).to.equal(ethers.BigNumber.from(0));
            expect(await faucet.cooldownDuration()).to.equal(ethers.BigNumber.from(0));
            expect(await faucet.POOL()).to.equal(LendingPool);
            expect(await faucet.aWETH()).to.equal(amWMATIC);
            expect(await faucet.WETH()).to.equal(WMATIC);
        });

        it("Should revert transaction when setOwner is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).setOwner(faucetTarget.address)
            ).to.be.revertedWith(OnlyOwnerAllowed);
        });

        it("Should revert transaction when setFaucetTarget is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).setFaucetTarget(faucetTarget.address)
            ).to.be.revertedWith(OnlyOwnerAllowed);
        });

        it("Should set faucet owner", async function () {
            await (await faucet.setOwner(faucetTarget.address)).wait();
            expect(await faucet.owner()).to.equal(faucetTarget.address);
        });

        it("Should set faucet target", async function () {
            await (await faucet.setFaucetTarget(owner.address)).wait();
            expect(await faucet.faucetTarget()).to.equal(owner.address);
        });

        it("Should convert directly send eth to aTokens (faucet funds)", async function () {
            const sendingValue = ethers.utils.parseEther("0.0001");

            await owner.sendTransaction({
                to: faucet.address,
                gasPrice: 8000000000,
                gasLimit: 500000,
                value: sendingValue,
            });

            // CONFIRM from faucet funds.
            expect((await faucet.faucetFunds()).gte(sendingValue));

            // CONFIRM independently from token address
            const amWMATICToken = await ethers.getContractAt(await IERC20_ABI(), amWMATIC, owner);
            expect((await amWMATICToken.balanceOf(faucet.address)).gte(sendingValue));
        });

        it("Should revert transaction when emergencyEtherTransfer is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).emergencyEtherTransfer(faucetTarget.address, 0)
            ).to.be.revertedWith(OnlyOwnerAllowed);
        });

        it("Should revert transaction when emergencyTokenTransfer is not used by owner", async function () {
            await expect(faucet.connect(faucetTarget).emergencyTokenTransfer(amWMATIC, faucetTarget.address, 0)
            ).to.be.revertedWith(OnlyOwnerAllowed);
        });

        it("Should retrieve stuck ether in contract", async function () {

            const sendingValue = ethers.utils.parseEther("0.0001");

            SelfdestructTransfer = await ethers.getContractFactory("SelfdestructTransfer");
            selfdestructTransfer = await SelfdestructTransfer.deploy({ value: sendingValue });

            expect((await AddressBalance(faucet.address)).eq(ethers.BigNumber.from(0)));
            expect((await AddressBalance(selfdestructTransfer.address)).eq(sendingValue));

            await (await selfdestructTransfer.destroyAndTransfer(faucet.address)).wait();

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

            await owner.sendTransaction({
                to: faucet.address,
                gasPrice: 8000000000,
                gasLimit: 500000,
                value: sendingValue,
            });

            await (await faucet.emergencyTokenTransfer(amWMATIC, owner.address, sendingValue)).wait();

            const amWMATICToken = await ethers.getContractAt(await IERC20_ABI(), amWMATIC, owner);
            expect((await amWMATICToken.balanceOf(owner.address)).eq(sendingValue));
        });


    });
});

async function IERC20_ABI() {
    return (await artifacts.readArtifact("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20")).abi;
}

async function AddressBalance(address) {
    return await ethers.provider.getBalance(address);
}

