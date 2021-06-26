const hre = require("hardhat");


async function main() {

  // FOR MUMBAI TESTNET
  const LendingPool_Address = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";

  const WETHGateway_Address = "0xee9eE614Ad26963bEc1Bec0D2c92879ae1F209fA";
  const WETHGateway_ABI = `[{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"weth","internalType":"address"}]},{"type":"event","name":"OwnershipTransferred","inputs":[{"type":"address","name":"previousOwner","internalType":"address","indexed":true},{"type":"address","name":"newOwner","internalType":"address","indexed":true}],"anonymous":false},{"type":"fallback","stateMutability":"payable"},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"authorizeLendingPool","inputs":[{"type":"address","name":"lendingPool","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"borrowETH","inputs":[{"type":"address","name":"lendingPool","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint256","name":"interesRateMode","internalType":"uint256"},{"type":"uint16","name":"referralCode","internalType":"uint16"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"depositETH","inputs":[{"type":"address","name":"lendingPool","internalType":"address"},{"type":"address","name":"onBehalfOf","internalType":"address"},{"type":"uint16","name":"referralCode","internalType":"uint16"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"emergencyEtherTransfer","inputs":[{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"emergencyTokenTransfer","inputs":[{"type":"address","name":"token","internalType":"address"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"getWETHAddress","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"owner","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"renounceOwnership","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[],"name":"repayETH","inputs":[{"type":"address","name":"lendingPool","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint256","name":"rateMode","internalType":"uint256"},{"type":"address","name":"onBehalfOf","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"transferOwnership","inputs":[{"type":"address","name":"newOwner","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdrawETH","inputs":[{"type":"address","name":"lendingPool","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"}]},{"type":"receive","stateMutability":"payable"}]`;

  const IncentivesController_Address = "0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644";
  // Zobral som z proxy ale z polygon mainnetu - lebo v mumbai som to nenasiel
  const IncentivesController_ABI = `[{"inputs":[{"internalType":"contract IERC20","name":"rewardToken","type":"address"},{"internalType":"address","name":"emissionManager","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"emission","type":"uint256"}],"name":"AssetConfigUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"AssetIndexUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"claimer","type":"address"}],"name":"ClaimerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"ditributionEnd","type":"uint256"}],"name":"DistributionEndUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newPendingAdmin","type":"address"}],"name":"PendingAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsAccrued","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"address","name":"claimer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"vault","type":"address"}],"name":"RewardsVaultUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAdming","type":"address"},{"indexed":false,"internalType":"uint256","name":"role","type":"uint256"}],"name":"RoleClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"UserIndexUpdated","type":"event"},{"inputs":[],"name":"DISTRIBUTION_END","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EMISSION_MANAGER","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PRECISION","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REVISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARD_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"assets","outputs":[{"internalType":"uint128","name":"emissionPerSecond","type":"uint128"},{"internalType":"uint128","name":"lastUpdateTimestamp","type":"uint128"},{"internalType":"uint256","name":"index","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"claimRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"to","type":"address"}],"name":"claimRewardsOnBehalf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"role","type":"uint256"}],"name":"claimRoleAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"},{"internalType":"uint256[]","name":"emissionsPerSecond","type":"uint256[]"}],"name":"configureAssets","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"role","type":"uint256"}],"name":"getAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getClaimer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getDistributionEnd","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"role","type":"uint256"}],"name":"getPendingAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"},{"internalType":"address","name":"user","type":"address"}],"name":"getRewardsBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRewardsVault","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"asset","type":"address"}],"name":"getUserAssetData","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserUnclaimedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"totalSupply","type":"uint256"},{"internalType":"uint256","name":"userBalance","type":"uint256"}],"name":"handleAction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"rewardsVault","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"caller","type":"address"}],"name":"setClaimer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"distributionEnd","type":"uint256"}],"name":"setDistributionEnd","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"role","type":"uint256"},{"internalType":"address","name":"newPendingAdmin","type":"address"}],"name":"setPendingAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"rewardsVault","type":"address"}],"name":"setRewardsVault","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;


  const amWMATIC_Token_Address = "0xF45444171435d0aCB08a8af493837eF18e86EE27";
  // GENERAL ERC20 ABI
  const amWMATIC_Token_ABI = `[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]`;

  const WMATIC_Token_Address = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
  // GENERAL ERC20 ABI
  const WMATIC_Token_ABI = `[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]`;



  const signers = await ethers.getSigners();
  const ownerSigner = signers[0];
  const hotWalletSigner = signers[1];

  console.log("ownerSigner:", ownerSigner.address);
  console.log("hotWalletSigner:", hotWalletSigner.address);

  // // We get the contract to deploy
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(
    123000,
    hotWalletSigner.address,
    LendingPool_Address,
    WETHGateway_Address,
    IncentivesController_Address,
    amWMATIC_Token_Address,
    WMATIC_Token_Address
  );

  await faucet.deployed();

  console.log("Faucet to:", faucet.address);


  const amWMATIC_Token = new hre.ethers.Contract(amWMATIC_Token_Address, amWMATIC_Token_ABI, ethers.provider);
  console.log("Allowance ", await ERC20Allowance(amWMATIC_Token, faucet.address, WETHGateway_Address));

  //console.log("Test const value", (await faucet.testConst()).toString());

  // const result = await faucet.owner();
  // console.log("check owner:", result);

  // const result2 = await faucet.hotwallet();
  // console.log("check hotwallet:", result2);

  // r = await ethers.provider.getBalance("0x9707c3C93c59Dc9cb6dcBfC4Dea3eD784D5726fa");
  // console.log("test balance ", ethers.utils.formatEther(r));
}

async function ERC20Approve(ERC20Token, spender, amount) {
  const txForApprove = await ERC20Token.approve(spender, amount);
  const receipt = await txForApprove.wait();
  console.log("New ERC20 Approve.");
}

async function ERC20Allowance(ERC20Token, owner, spender) {
  const allowance = await ERC20Token.allowance(owner, spender);
  return ethers.utils.formatEther(allowance);
}

async function ERC20BalanceOf(ERC20Token, address) {
  const balanceOfATokens = await ERC20Token.balanceOf(address.address);
  return ethers.utils.formatEther(balanceOfATokens);
}

async function AccountBallance(address) {
  balance = await ethers.provider.getBalance(address.address);
  console.log(address.address, " balance is: ", ethers.utils.formatEther(balance));
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
