require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  const victim = new ethers.Wallet(process.env.PRIVATE_KEY2, provider);
  const dexAddress = process.env.DEX_ADDRESS;

  const abi = ["function buy() payable"];
  const dex = new ethers.Contract(dexAddress, abi, victim);

  const tx = await dex.buy({ value: ethers.parseEther("0.5") });
  await new Promise(r => setTimeout(r, 4000)); // Espera 4 segundos simulando usuario lento
  await tx.wait();

  console.log("🧍‍♂️ Víctima ha comprado tokens. TX:", tx.hash);
}

main().catch(console.error);

