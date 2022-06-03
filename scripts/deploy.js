const hre = require("hardhat");

async function main() {
  await hre.run('compile');

  const Vester = await hre.ethers.getContractFactory("Vester");
  const vester = await Vester.deploy("Aelin Escrow", "eAELIN", "0x5B8F3fb479571Eca6A06240b21926Db586Cdf10f");

  await vester.deployed();

  console.log("Vester deployed to:", vester.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
