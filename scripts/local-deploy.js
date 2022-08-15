const hre = require("hardhat");
const fs = require('fs');

async function main() {
  await hre.run('compile');

  const testerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

  const SampleToken = await hre.ethers.getContractFactory("SampleToken");
  const sampleToken = await SampleToken.deploy();

  const Multicall3 = await hre.ethers.getContractFactory("Multicall3");
  const multicall3 = await Multicall3.deploy();

  const Vester = await hre.ethers.getContractFactory("Vester");
  const vester = await Vester.deploy("Token Grant", "gTKN", testerAddress);

  await vester.deployed();
  const signer = vester.provider.getSigner(testerAddress)

  await sampleToken.mint(vester.address, ethers.utils.parseEther("30000"))
  await vester.connect(signer).mint(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    sampleToken.address,
    Math.floor(Date.now() / 1000) - (7889400 * 2), // start timestamp
    Math.floor(Date.now() / 1000) - (7889400 * 1), // cliff timestamp
    ethers.utils.parseEther("2500"), // vest amount
    ethers.utils.parseEther("30000"), // total
    ethers.utils.parseEther("2500"), // redeemed
    7889400 // vest interval
  );

  console.log("Vester deployed to:", vester.address);
  console.log("Sample Token deployed to:", sampleToken.address);

  const data = `NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS=${vester.address}\nNEXT_PUBLIC_MULTICALL_ADDRESS=${multicall3.address}`
  fs.writeFileSync("frontend/.env.local", data);

  console.log("frontend/.env.local updated")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
