# Awareness of Front Running Attacks in Blockchain Environments

This repository replicates the Final Degree Project (TFG) titled "Concienciación de Ataques Front Running en Entornos Blockchain" from Universidad de Málaga. It provides a reproducible environment and detailed steps to simulate sandwich attacks in two scenarios: a fictitious DEX and a local replica of Uniswap. This repository is intended for educational and research purposes only.

## 📚 Table of Contents

- [Overview](#-overview)
- [Technologies Used](#-technologies-used)
- [Environment Setup](#-environment-setup)
  - [Virtual Machine](#-virtual-machine)
  - [Docker](#-docker)
  - [NodeJS and NPM](#-nodejs-and-npm)
  - [Kurtosis](#-kurtosis)
  - [Hardhat](#-hardhat)
- [Scenario 1: Fictitious DEX](#-scenario-1-fictitious-dex)
- [Scenario 2: Uniswap Replica](#-scenario-2-uniswap-replica)
- [Legal & Ethical Considerations](#-legal--ethical-considerations)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)

---

## 📌 Overview

This project aims to raise awareness of front-running attacks in blockchain, particularly in DeFi environments. The work focuses on sandwich attacks, a type of MEV (Maximal Extractable Value), simulating them through a bot implemented in a private Ethereum network.

Two scenarios are implemented:

1. **Scenario 1**: A fully controlled environment using a fictitious DEX smart contract.
2. **Scenario 2**: A more realistic simulation using a local deployment of Uniswap.

## 🛠️ Technologies Used

- Ethereum (Geth) & mempool analysis
- [Hardhat](https://hardhat.org/) for smart contract deployment
- [Kurtosis](https://docs.kurtosis.com/) for private network setup
- [Blockscout](https://blockscout.com/) for blockchain exploration
- [Remix IDE](https://remix.ethereum.org/) for contract interaction
- Solidity, JavaScript, ethers.js

---

## ⚙️ Environment Setup

Follow these steps to prepare your environment.

### 🖥️ Virtual Machine

All commands were tested on an Ubuntu 22.04.1 virtual machine with superuser privileges, using Oracle VirtualBox. You can also run these on a native Ubuntu installation or other Linux distributions with minimal changes.

### 🐳 Docker

Docker is required to run Geth and other services in containers.

Install Docker:

```bash
sudo apt update && sudo apt install -y docker.io
```

Verify installation:

```bash
docker --version
# Expected output: Docker version 26.1.3, build 26.1.3-0ubuntu1~22.04.1
```

### 🟦 NodeJS and NPM

Node.js is a JavaScript runtime and NPM is its package manager.

Install Node.js 20.x and NPM:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node --version   # e.g. v20.19.0
npm --version    # e.g. 10.8.2
```

### ⚙️ Kurtosis

Kurtosis orchestrates your private Ethereum test network.

Install Kurtosis CLI:

```bash
echo "deb [trusted=yes] https://apt.fury.io/kurtosis-tech/ /" | sudo tee /etc/apt/sources.list.d/kurtosis.list
sudo apt update
sudo apt install kurtosis-cli
```

### 🔧 Hardhat

Hardhat is used to compile, test, and deploy smart contracts.

Initialize a new Node.js project and install dependencies:

```bash
mkdir TFG-project && cd TFG-project
npm init -y
npm install --save-dev hardhat@^2.22.19 \
  @nomicfoundation/hardhat-ethers@^3.0.8 ethers@^6.13.5 \
  @openzeppelin/contracts@^5.2.0 \
  @uniswap/v2-core@^1.0.1 \
  @uniswap/v2-periphery@^1.1.0-beta.0 \
  dotenv@^16.4.7
npx hardhat  # choose "Create an empty hardhat.config.js"
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
├── package.json
├── .env
└── hardhat.config.js
```

### Step-by-Step Guide

1. **Compile contracts**:
   ```bash
   npx hardhat compile
   ```
2. **Deploy the DEX contract**:
   ```bash
   npx hardhat run scripts/deploySimpleDEX.js --network localhost
   ```
3. **Update **`` with the deployed DEX address:
   ```env
   DEX_ADDRESS=0x...  # address from deploy output
   ```
4. **Run the attacker bot**:
   ```bash
   npx hardhat run scripts/attack-bot.js --network localhost
   ```
5. **Run the victim transaction**:
   ```bash
   npx hardhat run scripts/victim-buy.js --network localhost
   ```
6. **Check console logs** for attack details (profit, tx hash).

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
│   ├── deploy.js
│   ├── sandwich-bot.js
│   ├── swap-victim.js
├── package.json
├── .env
└── hardhat.config.js
```

### Step-by-Step Guide

1. **Compile contracts**:
   ```bash
   npx hardhat compile
   ```
2. **Deploy Uniswap contracts and add liquidity** (single script):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
3. **Run the sandwich bot**:
   ```bash
   npx hardhat run scripts/sandwich-bot.js --network localhost
   ```
4. **Execute the victim transaction**:
   ```bash
   npx hardhat run scripts/swap-victim.js --network localhost
   ```
5. **Review logs** or inspect contract state via Remix/Blockscout.

---

## ⚖️ Legal and Ethical Considerations

This project uses an offensive security (Red Team) approach for educational and research purposes only. Simulating MEV and front-running attacks in controlled environments helps developers and researchers understand vulnerabilities and build more secure systems. **Do not deploy or use these bots on public networks.**

---

## 🙏 Acknowledgements

This project is based on the TFG of **José Manuel Rodríguez Chicano** (Universidad de Málaga, 2025) under the supervision of **Isaac Agudo Ruiz**.

> "El objetivo principal ha consisto en conocer la lógica ofensiva que hay detrás de estos tipos de ataques para concienciar y mejorar las defensas del ecosistema DeFi."


