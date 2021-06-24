require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

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
  defaultNetwork: "mumbai",
  networks:
  {
    hardhat: {},
    mumbai:
    {
      url: process.env.PROVIDER_MUMBAI_TESTNET,
      accounts: [process.env.MUMBAI_TESTNET_ACCOUNT],
    },

    matic:
    {
      url: process.env.PROVIDER_MATIC_MAINNET,
      accounts: [process.env.MATIC_MAINNET_ACCOUNT],
      gasPrice: 2000000000,
    }
  }
};

