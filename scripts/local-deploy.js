const hre = require("hardhat");

async function main() {
  await hre.run('compile');

  const testerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

  const SampleToken = await hre.ethers.getContractFactory("SampleToken");
  const sampleToken = await SampleToken.deploy();

  const Vester = await hre.ethers.getContractFactory("Vester");
  const vester = await Vester.deploy(sampleToken.address);

  await vester.deployed();

  await sampleToken.mint(vester.address, ethers.utils.parseEther("30000"))
  await vester.updateGrant(
    testerAddress,
    Math.floor(Date.now() / 1000) - (7889400 * 2), // start timestamp
    Math.floor(Date.now() / 1000) - (7889400 * 1), // cliff timestamp
    ethers.utils.parseEther("2500"), // quarterly amount
    ethers.utils.parseEther("30000"), // total
    ethers.utils.parseEther("2500"), // redeemed
  );

  console.log("Sample Token deployed to:", sampleToken.address);
  console.log("Vester deployed to:", vester.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
