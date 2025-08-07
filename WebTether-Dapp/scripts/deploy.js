// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Get the factory and deploy
  const Factory = await hre.ethers.getContractFactory("PingPayment");
  const contract = await Factory.deploy();

  // Wait for deployment (ethers v6)
  await contract.waitForDeployment();

  // Print deployed address
  console.log("PingPayment deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
