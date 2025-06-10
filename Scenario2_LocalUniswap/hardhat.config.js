require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
const { task } = require("hardhat/config");

task("test", "Prueba hre.ethers")
  .setAction(async (_, hre) => {
    console.log("Ethers disponible:", hre.ethers !== undefined);
  });

task("balances", "Muestra los balances de las cuentas")
  .setAction(async (_, hre) => {
    const ethers = hre.ethers;
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
      const balance = await ethers.provider.getBalance(account.address);
      const balanceInEther = Number(balance) / 1e18; // Convierte wei a ether
      console.log(`Cuenta: ${account.address}, Balance: ${balanceInEther} ETH`);
    }
  });

module.exports = {
  networks: {
    localhost: {
      url: process.env.RPC_URL, 
      chainId: 585858,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
      {
        version: "0.8.20",
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};

