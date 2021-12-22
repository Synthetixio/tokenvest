const hre = require("hardhat");

async function main() {
  await hre.run('compile');

  const Vester = await hre.ethers.getContractFactory("Vester");
  const vester = await Vester.deploy("0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F");

  await vester.deployed();

  console.log("Vester deployed to:", vester.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
