const { expect } = require("chai");

// https://hardhat.org/tutorial/testing-contracts.html

describe("Faucet contract - MATIC MAINNET", function () {

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

    beforeEach(async function () {
        Faucet = await ethers.getContractFactory("Faucet");
        //[owner, faucetTarget] = await ethers.getSigners();
        const accounts = await ethers.getSigners();

        owner = accounts[0];
        faucetTarget = accounts[1];

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

        it("Should convert directly send eth to aTokens (faucet funds)", async function () {
            const sendingValue = ethers.utils.parseEther("0.0001");
            let tx = await owner.sendTransaction({
                to: faucet.address,
                gasPrice: 8000000000,
                gasLimit: 500000,
                value: sendingValue,
            });

            // faucetFunds grater than or equal to sendingValue
            expect((await faucet.faucetFunds()).gte(sendingValue));
        });
    });
});