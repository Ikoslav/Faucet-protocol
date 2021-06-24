const hre = require("hardhat");


async function main() {


  // const signers = await ethers.getSigners();
  // const ownerSigner = signers[0];
  // const hotWalletSigner = signers[1];

  // console.log("ownerSigner:", ownerSigner.address);
  // console.log("hotWalletSigner:", hotWalletSigner.address);

  // // We get the contract to deploy
  // const Faucet = await hre.ethers.getContractFactory("Faucet");
  // const faucet = await Faucet.deploy(hotWalletSigner.address);

  // await faucet.deployed();

  // console.log("Faucet to:", faucet.address);



  // const result = await faucet.owner();
  // console.log("check owner:", result);

  // const result2 = await faucet.hotwallet();
  // console.log("check hotwallet:", result2);

  // r = await ethers.provider.getBalance("0x9707c3C93c59Dc9cb6dcBfC4Dea3eD784D5726fa");
  // console.log("test balance ", ethers.utils.formatEther(r));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
