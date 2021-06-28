require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks:
  {
    hardhat: {
      forking: {
        url: process.env.MATIC_PROVIDER
      }
    },

    matic: {
      url: process.env.MATIC_PROVIDER,
      accounts: [process.env.MATIC_ACC_DEPLOYER],
      gasPrice: 3000000000
    },

    mumbai: {
      url: process.env.MUMBAI_PROVIDER,
      accounts: [process.env.MUMBAI_ACC_OWNER, process.env.MUMBAI_ACC_FAUCETTARGET],
      gasPrice: 7000000000
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};

