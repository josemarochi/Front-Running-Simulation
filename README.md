# Awareness of Front Running Attacks in Blockchain Environments

This repository replicates the Final Degree Project (TFG) titled "Concienciación de Ataques Front Running en Entornos Blockchain" from Universidad de Málaga. It provides a reproducible environment and detailed steps to simulate sandwich attacks in two scenarios: a fictitious DEX and a local replica of Uniswap. This repository is intended for educational and research purposes only.

## 📚 Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Environment Setup](#environment-setup)
- [Scenario 1: Fictitious DEX](#scenario-1-fictitious-dex)
- [Scenario 2: Uniswap Replica](#scenario-2-uniswap-replica)
- [Legal & Ethical Considerations](#legal--ethical-considerations)
- [Acknowledgements](#acknowledgements)

---

## 📌 Overview

This project aims to raise awareness of front-running attacks in blockchain, particularly in DeFi environments. The work focuses on sandwich attacks, a type of MEV (Maximal Extractable Value), simulating them through a bot implemented in a private Ethereum network.

Two scenarios are implemented:

1. **Scenario 1**: A fully controlled environment using a fictitious DEX smart contract.
2. **Scenario 2**: A more realistic simulation using a local deployment of Uniswap.

## 🛠️ Technologies Used

- Ethereum (Geth) & Mempool analysis
- [Hardhat](https://hardhat.org/) for smart contract deployment
- [Kurtosis](https://docs.kurtosis.com/) for private network setup
- [Blockscout](https://blockscout.com/) for blockchain exploration
- [Remix IDE](https://remix.ethereum.org/) for contract interaction
- Solidity, JavaScript, ethers.js

---

## ⚙️ Environment Setup

1. **Start the local Ethereum environment with Kurtosis:**

```bash
kurtosis engine start
sudo kurtosis run github.com/ethpandaops/ethereum-package \
  --args-file ./network_params.yaml \
  --image-download always
```

2. **Access tools:**

   - Blockscout: visualize transactions
   - Dora/Assertor: beacon chain status

3. **Import prefunded accounts:**

```bash
docker ps | grep el-1-geth-lighthouse

docker cp prefunded.txt <CONTAINER_ID>:/prefunded.txt

docker exec -it <CONTAINER_ID> sh
geth account import /prefunded.txt
cp /root/.ethereum/keystore/UTC--... /data/geth/execution-data/keystore
```

4. **Verify accounts:**

```bash
geth attach http://127.0.0.1:8545
eth.accounts
```

5. **Configure **``** and **``**:**

```env
PRIVATE_KEY=<attacker key>
PRIVATE_KEY2=<victim key>
RPC_URL=http://127.0.0.1:<URL> #This URL will be shown on kurtosis deployment. Example: http://127.0.0.1:3343 -> 8545/rcp, there u will take 3343
DEX_ADDRESS=0x... # To be filled after deployment only in scenario 1 when SimpleDex is deployed.
```

`hardhat.confing.js` is different for each scenario.

6. **Install dependencies:**

```bash
npm install --save-dev hardhat@^2.22.19 \
  @nomicfoundation/hardhat-ethers@^3.0.8 ethers@^6.13.5 \
  @openzeppelin/contracts@^5.2.0 \
  @uniswap/v2-core@^1.0.1 \
  @uniswap/v2-periphery@^1.1.0-beta.0 \
  dotenv@^16.4.7
```
---

## 🧪 Scenario 1: Fictitious DEX

This scenario simulates a sandwich attack in a minimal custom DEX to focus on offensive logic.

### Project Structure

```
.
├── contracts/
│   ├── SimpleDEX.sol
├── scripts/
│   ├── attack-bot.js
│   ├── deploySimpleDEX.js
│   ├── victim-buy.js
├── package-lock.json
├── package.json
├── .env
└── hardhat.config.js
```

### Step-by-Step Guide

1. **Compile contracts:**

```bash
npx hardhat compile
```

2. **Deploy the DEX contract:**

```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Update **``** with DEX address**

4. **Deploy the Monitor contract:**

```bash
npx hardhat run scripts/deploy-monitor.js --network localhost
```

5. **Run the attacker bot:**

```bash
node scripts/attack-bot.js --network localhost
```

6. **Run the victim transaction:**

```bash
npx hardhat run scripts/victim-buy.js --network localhost
```

---

## 🧪 Scenario 2: Uniswap Replica

This scenario increases realism by replicating a full Uniswap DEX locally and testing the sandwich bot.

### Project Structure

```
.
├── contracts/
│   ├── UMA.sol
│   ├── UCO.sol
│   ├── UniswapV2All.sol
│   ├── UniswapV2All2.sol
│   ├── WETH9.sol
├── scripts/
│   ├── DEPLOY.js
│   ├── sandwich-bot.js
│   ├── swap-victim.js
├── package-lock.json
├── package.json
├── .env
└── hardhat.config.js
```

### Step-by-Step Guide

1. **Compile contracts:**

```bash
npx hardhat compile
```

2. **Deploy Uniswap contracts and add liquidity to the pool:**

```bash
npx hardhat run scripts/DEPLOY.js --network localhost
```

3. **Run the sandwich bot:**

```bash
node scripts/sandwich-bot.js --network localhost
```

4. **Execute the victim transaction (separately):**

```bash
node scripts/swap-victim.js --network localhost
```

5. **Review the results manually in logs or via contract state.**

---

## ⚖️ Legal & Ethical Considerations

This project uses an offensive security (Red Team) approach for educational and research purposes only.

Simulating MEV and front-running attacks in controlled environments helps developers and researchers understand vulnerabilities and build more secure systems. **Do not deploy or use these bots on public networks.**

---

## 🙏 Acknowledgements

This project is based on the TFG of **José Manuel Rodríguez Chicano** (Universidad de Málaga, 2025) under the supervision of **Isaac Agudo Ruiz**.

> "El objetivo principal ha consistido en conocer la lógica ofensiva que hay detrás de estos tipos de ataques para concienciar y mejorar las defensas del ecosistema DeFi."

---


