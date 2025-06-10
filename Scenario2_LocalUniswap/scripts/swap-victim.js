require("dotenv").config();
const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  // 1) Leer las direcciones
  const addresses = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../uniswap-addresses.json"), "utf8")
  );
  const {
    router: routerAddr,
    tokenA: tokenAAddr,
    tokenB: tokenBAddr,
    pair:   pairAddr
  } = addresses;

  // 2) Tomar el signer de la "victima"
  const [owner, victim] = await ethers.getSigners();
  console.log("Victim address:", victim.address);

  // 3) Instanciar TokenA, TokenB, Router y Pair
  const tokenA     = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    tokenAAddr,
    victim
  );
  const tokenB     = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    tokenBAddr,
    victim
  );
  console.log("routerAddr =", routerAddr);
  const routerJson = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
  const router     = new ethers.Contract(routerAddr, routerJson.abi, victim);

  const pairJson   = require("@uniswap/v2-core/build/UniswapV2Pair.json");
  const pair       = new ethers.Contract(pairAddr, pairJson.abi, victim);

  // 3) Antes de fijar amountIn, lee reserva0:
   const [reserve0,] = await pair.getReserves();
// Calculo ratio victim -> pool:
   const victimRatio = 30; // 30 % de la pool
   const amountIn = reserve0.mul(victimRatio).div(100);
  const balVictim = await tokenA.balanceOf(victim.address);
  if (balVictim.lt(amountIn)) {
    console.log(`Victim solo tiene ${ethers.utils.formatUnits(balVictim,18)}, transfiriendo ${ethers.utils.formatUnits(amountIn,18)} desde owner...`);
    await (await tokenA.connect(owner).transfer(victim.address, amountIn)).wait();
  }

  // 4) Parametros del swap
  
  const amountOutMin = 0;
  const pathTokens   = [ tokenAAddr, tokenBAddr ];
  const to           = victim.address;
  const deadline     = Math.floor(Date.now() / 1000) + 60 * 10;

  // 5) Aprobar el router para gastar TokenA
  console.log("Approving router...");
  await (await tokenA.approve(routerAddr, amountIn)).wait();

  // 6) Verificar estado previo
  console.log("Verificando estado previo...");
  const balance   = await tokenA.balanceOf(victim.address);
  const allowance = await tokenA.allowance(victim.address, routerAddr);
  console.log("Balance TokenA:", ethers.utils.formatUnits(balance, 18));
  console.log("Allowance TokenA:", ethers.utils.formatUnits(allowance, 18));

  const reserves = await pair.getReserves();
  console.log(
    "Reservas en pair:",
    ethers.utils.formatUnits(reserves._reserve0, 18),
    ethers.utils.formatUnits(reserves._reserve1, 18)
  );

  // 7) Ejecutar el swap
  console.log("Executing swapExactTokensForTokens...");
  const tx = await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    pathTokens,
    to,
    deadline,
    { gasLimit: 500000 }
  );
  const receipt = await tx.wait();
  console.log("Victim swap tx hash:", receipt.transactionHash);

  // 8) Mostrar nuevo balance de TokenB
  const balB = await tokenB.balanceOf(victim.address);
  console.log("Victim TokenB balance:", ethers.utils.formatUnits(balB, 18));
}

main().catch(err => {
  console.error("swap-victim.js error:", err);
  process.exit(1);
});