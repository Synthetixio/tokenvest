const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vester", function () {

  it("Should work as expected", async function () {
    const [owner, grantee] = await ethers.getSigners();

    const TokenContract = await ethers.getContractFactory('SampleToken');
    const tokenContract = await TokenContract.deploy();
    await tokenContract.deployed();

    const VesterContract = await ethers.getContractFactory('Vester');
    const vester = await VesterContract.deploy(tokenContract.address);
    await vester.deployed();

    await tokenContract.mint(vester.address, ethers.utils.parseEther("30000"))

    await vester.createGrant(grantee.address, 30000)

    // The grantee shouldn't able to redeem right away...
    await expect(vester.connect(grantee).redeem()).to.be.reverted;

    // ...nor next quarter, because of the cliff
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await expect(vester.connect(grantee).redeem()).to.be.reverted;

    // The user should be able to redeem two quarters worth of SNX.
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await vester.connect(grantee).redeem()
    expect(await tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("5000"));

    // They shouldn't be able to redeem again immediately...
    await expect(vester.connect(grantee).redeem()).to.be.reverted;

    // ...but they should be able to redeem next quarter.
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await vester.connect(grantee).redeem()
    expect(await tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("7500"));

    // The owner, and only the owner, revokes the grantees grant.
    await expect(vester.connect(grantee).revokeGrant(grantee.address)).to.be.reverted;
    vester.connect(owner).revokeGrant(grantee.address);

    // Now the grantee can't redeem...
    await expect(vester.connect(grantee).redeem()).to.be.reverted;

    // ... nor next quarter.
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await expect(vester.connect(grantee).redeem()).to.be.reverted;

    // The owner reactivates the user's grant, under the same vesting schedule.
    const grantInfo = await vester.grants(grantee.address)
    await vester.connect(owner).updateGrant(
      grantee.address,
      grantInfo.startTimestamp,
      grantInfo.cliffTimestamp,
      grantInfo.quarterlyAmount,
      ethers.utils.parseEther("30000"),
      grantInfo.amountRedeemed,
    );

    // Now the user redeems as expected...
    await vester.connect(grantee).redeem()
    expect(await tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("10000"));

    // ...and long in the future, they're only able to redeem the total size of the grant.
    await network.provider.send("evm_increaseTime", [7889400 * 100])
    await network.provider.send("evm_mine")
    await vester.connect(grantee).redeem()
    expect(await tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("30000"));
  });

});