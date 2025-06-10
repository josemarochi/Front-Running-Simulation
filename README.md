Awareness of Front Running Attacks in Blockchain Environments

This repository replicates the undergraduate thesis "Concienciación de Ataques Front Running en Entornos Blockchain". It implements a Red Team-style bot capable of simulating sandwich attacks both in a fully controlled environment and in a local replica of Uniswap, using tools such as Kurtosis, Geth, Hardhat, and Web3.

The goal is to understand the offensive logic of MEV (Maximal Extractable Value) attacks and to provide a reproducible educational environment to raise awareness and support future research.

🚀 Getting Started: Local Environment Setup

This guide will help you replicate the local blockchain test environment used in the project.

1. Start the Kurtosis Engine and Ethereum Network

kurtosis engine start
sudo kurtosis run github.com/ethpandaops/ethereum-package \
  --args-file ./network_params.yaml \
  --image-download always

2. Access Management Tools

Once the network is running:

Use Blockscout (EVM block explorer) to inspect deployed contracts and transactions.

Use Assertor/Dora (beacon chain explorer) for consensus-level data.

These will be accessible via a local URL printed by Kurtosis after setup.

3. Import Prefunded Accounts

Get the container ID of the execution layer (Geth node):

docker ps | grep el-1-geth-lighthouse

Copy your prefunded account file into the container:

docker cp prefunded.txt <CONTAINER_ID>:/prefunded.txt

Access the container and import the accounts:

docker exec -it <CONTAINER_ID> sh
geth account import /prefunded.txt

Move the account keystore to the expected location:

cp /root/.ethereum/keystore/UTC--... /data/geth/execution-data/keystore

4. Verify Accounts Are Loaded

Start Geth’s interactive console and confirm the accounts:

geth attach http://127.0.0.1:8545
eth.accounts

5. Configure Hardhat & MetaMask

In hardhat.config.js, update the RPC URL to match your Kurtosis node IP and port (typically 8545).

In MetaMask, connect to the same local RPC and import the prefunded private key(s).

Example Hardhat config:

networks: {
  localhost: {
    url: "http://<HOST_IP>:8545",
    accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2],
  },
},

6. Deploy & Test Contracts

You can deploy smart contracts using:

Remix IDE (connect it to your local RPC)

Hardhat scripts

Blockscout to verify transactions and inspect contract state

You can also run custom scripts (like attack simulations) via:

npx hardhat run scripts/your-script.js --network localhost

📂 Project Structure

/contracts: Smart contracts used for simulating DEX and attack logic

/scripts: Scripts to deploy contracts and run simulations

/kurtosis: Configuration files for setting up the Ethereum environment

.env: Store private keys and RPC details securely (not committed)

🔧 Built With

Kurtosis - Test environment orchestrator

Geth - Ethereum Execution Layer

Hardhat - Smart contract development environment

Uniswap - DEX contracts

Web3.py / ethers.js - Interaction libraries



🌐 Acknowledgements

Based on the undergraduate thesis by José Manuel Rodríguez Chicano, Universidad de Málaga, 2025.

Supervised by Isaac Agudo Ruiz.
