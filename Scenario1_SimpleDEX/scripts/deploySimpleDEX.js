const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);
  const initialLiquidity = ethers.parseEther("100");

  const DEX = await ethers.getContractFactory("SimpleDEX");
  const dex = await DEX.deploy({ value: initialLiquidity });
  await dex.waitForDeployment();

  console.log("DEX deployed to:", await dex.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

