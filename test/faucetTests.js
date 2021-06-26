const { expect } = require("chai");

// https://hardhat.org/tutorial/testing-contracts.html

describe("Faucet contract - MUMBAI TESTNET", function () {

    // AAVE Parts
    let LendingPool = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
    let IncentivesController = "0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644";
    let amWMATIC = "0xF45444171435d0aCB08a8af493837eF18e86EE27";
    let WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";

    // https://docs.ethers.io/v4/api-utils.html
    let dailyLimit = ethers.utils.parseEther("0.01");

    let Faucet;
    let faucet;

    let owner;
    let faucetTarget;


    beforeEach(async function () {
        Faucet = await ethers.getContractFactory("Faucet");
        [owner, faucetTarget] = await ethers.getSigners();

        faucet = await Faucet.deploy(
            dailyLimit,
            faucetTarget.address,
            LendingPool,
            IncentivesController,
            amWMATIC,
            WMATIC);
    });

    describe("Deployment", function () {
        this.timeout(60000);

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

        it("Should set faucet owner", async function () {
            await (await faucet.setOwner(faucetTarget.address)).wait();
            expect(await faucet.owner()).to.equal(faucetTarget.address);
        });

        it("Should set faucet target", async function () {
            await (await faucet.setFaucetTarget(owner.address)).wait();
            expect(await faucet.faucetTarget()).to.equal(owner.address);
        });
    });
});