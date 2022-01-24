const hre = require("hardhat");

async function main() {
  await hre.run('compile');

  const Vester = await hre.ethers.getContractFactory("Vester");
  const vester = await Vester.deploy("SNX Grant", "gSNX", "0xee8C74634fc1590Ab7510a655F53159524ed0aC5");

  await vester.deployed();

  console.log("Vester deployed to:", vester.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
