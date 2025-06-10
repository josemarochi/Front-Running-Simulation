// scripts/deploy-and-add-liquidity.js

require("dotenv").config();
const { Contract, ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

// 1) Cargar los artifacts puros
const WETH9Artifact   = require(path.join(__dirname, "..", "artifacts/contracts/WETH9.sol/WETH9.json"));
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact  = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact    = require("@uniswap/v2-core/build/UniswapV2Pair.json");

async function main() {
  // 2) Signer principal
  const [owner] = await ethers.getSigners();
  console.log("Deploying with:", owner.address);

  // 3) Desplegar UniswapV2Factory
  const FactoryF = new ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    owner
  );
  const factory = await FactoryF.deploy(owner.address);
  console.log("Factory deployed at:", factory.address);

  // 4) Desplegar WETH9
  const WETHF = new ContractFactory(
    WETH9Artifact.abi,
    WETH9Artifact.bytecode,
    owner
  );
  const weth = await WETHF.deploy();
  console.log("WETH9 deployed at:", weth.address);

  // 5) Desplegar UniswapV2Router02
  const RouterF = new ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    owner
  );
  const router = await RouterF.deploy(factory.address, weth.address);
  console.log("Router deployed at:", router.address);

  // 6) Desplegar tokens testeables: Tether (UMA) y UCOCoin (UCO)
  const UMA = await ethers.getContractFactory("Tether", owner);
  const uma = await UMA.deploy();
  await uma.deployed();
  console.log("UMA deployed at:", uma.address);

  const UCO = await ethers.getContractFactory("UCOCoin", owner);
  const uco = await UCO.deploy();
  await uco.deployed();
  console.log("UCO deployed at:", uco.address);

  // 7) Mint inicial: 1000 tokens de cada uno al owner
  const mintAmt = ethers.utils.parseEther("1000");
  await (await uma.mint(owner.address, mintAmt)).wait();
  await (await uco.mint(owner.address, mintAmt)).wait();
  console.log("Minted 1,000 UMA & UCO to owner");

  // 8) Crear par UMA-UCO si no existe
  let pairAddr = await factory.getPair(uma.address, uco.address);
  if (pairAddr === ethers.constants.AddressZero) {
    console.log("Pair not found; creating...");
    await (await factory.createPair(uma.address, uco.address)).wait();
    pairAddr = await factory.getPair(uma.address, uco.address);
  }
  console.log("Pair address:", pairAddr);

  // 9) Instanciar el par y comprobar reservas iniciales
  const pair = new Contract(pairAddr, pairArtifact.abi, owner);
  let [r0, r1] = await pair.getReserves();
  console.log("Initial reserves:", r0.toString(), r1.toString());

  // 10) Aprobar router para mover nuestros tokens
  const MAX = ethers.constants.MaxUint256;
  await (await uma.approve(router.address, MAX)).wait();
  await (await uco.approve(router.address, MAX)).wait();
  console.log("Router approved to spend UMA & UCO");

  // 11) Add liquidez: 50 UMA y 150 UCO
  const amt0 = ethers.utils.parseUnits("50", 18);
  const amt1 = ethers.utils.parseUnits("150", 18);
  const deadline = Math.floor(Date.now()/1000) + 60 * 10;

  const tx = await router.addLiquidity(
    uma.address, uco.address,
    amt0, amt1,
    0, 0,
    owner.address,
    deadline,
    { gasLimit: 5_000_000 }
  );
  await tx.wait();
  console.log("Liquidity added");

  // 12) Leer reservas tras add liquidez
  [r0, r1] = await pair.getReserves();
  console.log("Post-add reserves:", r0.toString(), r1.toString());
  // Deberian acercarse a 50 ... 150 ...

  const out = {
    factory: factory.address,
    weth:    weth.address,
    router:  router.address,
    tokenA:  uma.address,
    tokenB:  uco.address,
    pair:    pairAddr
  };
  const outPath = path.join(__dirname, "..", "uniswap-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("Direcciones guardadas en uniswap-addresses.json");
}
 
  
main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
  });

