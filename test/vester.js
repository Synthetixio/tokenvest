const { expect } = require("chai");
const { ethers } = require("hardhat");

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe("Vester", function () {

  before(async function () {
    this.TokenContract = await ethers.getContractFactory('SampleToken');
    this.VesterContract = await ethers.getContractFactory('Vester');
  });

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();

    this.tokenContract = await this.TokenContract.deploy();
    await this.tokenContract.deployed();

    this.vester = await this.VesterContract.deploy(owner.address, this.tokenContract.address);
    await this.vester.deployed();
  });

  // Ownership
  it("Should allow ownership to be transfered", async function () {
    const [owner, user] = await ethers.getSigners();

    expect(await this.vester.owner()).to.equal(owner.address);
    await expect(this.vester.connect(user).acceptOwnership()).to.be.reverted;

    await this.vester.nominateOwner(user.address);
    expect(await this.vester.owner()).to.equal(owner.address);
    expect(await this.vester.nominatedOwner()).to.equal(user.address);

    await this.vester.connect(user).acceptOwnership()
    expect(await this.vester.owner()).to.equal(user.address);
    expect(await this.vester.nominatedOwner()).to.equal(ZERO_ADDRESS);
  });

  it("Should restrict the appropriate functions to the owner", async function () {
    const [owner, user] = await ethers.getSigners();

    await expect(this.vester.connect(user).withdraw(ZERO_ADDRESS, 1)).to.be.revertedWith('Only the owner can call this function.');
    await expect(this.vester.connect(user).updateGrant(ZERO_ADDRESS, 1, 1, 1, 1, 1, 1)).to.be.revertedWith('Only the owner can call this function.');
    await expect(this.vester.connect(user).createGrant(ZERO_ADDRESS, 1)).to.be.revertedWith('Only the owner can call this function.');
    await expect(this.vester.connect(user).revokeGrant(ZERO_ADDRESS)).to.be.revertedWith('Only the owner can call this function.');
    await expect(this.vester.connect(user).nominateOwner(ZERO_ADDRESS)).to.be.revertedWith('Only the owner can call this function.');
  });


  // Grant Management
  it("Should allow a grant to be created", async function () {
    const [owner, grantee] = await ethers.getSigners();

    await this.vester.createGrant(grantee.address, 30000)
    const grantData = await this.vester.grants(grantee.address)

    expect(grantData.quarterlyAmount).to.equal(ethers.utils.parseEther("2500"))
    expect(grantData.totalAmount).to.equal(ethers.utils.parseEther("30000"))
    expect(grantData.amountRedeemed).to.equal(0)
    expect(grantData.startTimestamp.toNumber()).to.be.closeTo(Date.now() / 1000, 100)
    expect(grantData.cliffTimestamp.toNumber()).to.be.closeTo((Date.now() / 1000) + (grantData.vestInterval * 2), 100)
    expect(grantData.vestInterval).to.equal(7889400)
    expect(grantData.transferNominee).to.equal(ZERO_ADDRESS)
  });

  it("Should allow a grant to be updated", async function () {
    const [owner, grantee] = await ethers.getSigners();

    await this.vester.createGrant(grantee.address, 30000)
    let grantData = await this.vester.grants(grantee.address)
    expect(grantData.quarterlyAmount).to.equal(ethers.utils.parseEther("2500"))
    expect(grantData.totalAmount).to.equal(ethers.utils.parseEther("30000"))
    expect(grantData.amountRedeemed).to.equal(0)

    await this.vester.connect(owner).updateGrant(
      grantee.address,
      grantData.startTimestamp,
      grantData.cliffTimestamp,
      ethers.utils.parseEther("3000"),
      ethers.utils.parseEther("40000"),
      grantData.amountRedeemed,
      grantData.vestInterval,
    );

    grantData = await this.vester.grants(grantee.address)
    expect(grantData.quarterlyAmount).to.equal(ethers.utils.parseEther("3000"))
    expect(grantData.totalAmount).to.equal(ethers.utils.parseEther("40000"))
    expect(grantData.amountRedeemed).to.equal(0)
  })

  it("Should allow a grant to be revoked", async function () {
    const [owner, grantee] = await ethers.getSigners();

    await this.vester.createGrant(grantee.address, 30000)
    let grantData = await this.vester.grants(grantee.address)
    expect(grantData.totalAmount).to.equal(ethers.utils.parseEther("30000"))

    await this.vester.revokeGrant(grantee.address)
    grantData = await this.vester.grants(grantee.address)
    expect(grantData.totalAmount).to.equal(0)
  })

  // Grant Transfer
  it("Should allow a grant to be transfered", async function () {
    const [owner, grantee, futureGrantee] = await ethers.getSigners();

    await this.vester.createGrant(grantee.address, 30000);
    await expect(this.vester.connect(futureGrantee).acceptGrantTransfer(grantee.address)).to.be.reverted

    const originalGranteeData = await this.vester.grants(grantee.address)
    const originalFutureGranteeData = await this.vester.grants(futureGrantee.address)
    expect(originalGranteeData.totalAmount).to.equal(ethers.utils.parseEther("30000"))
    expect(originalFutureGranteeData.totalAmount).to.equal(0)

    await this.vester.connect(grantee).nominateGrantTransfer(futureGrantee.address)
    await this.vester.connect(futureGrantee).acceptGrantTransfer(grantee.address)

    const newGranteeData = await this.vester.grants(grantee.address)
    const newFutureGranteeData = await this.vester.grants(futureGrantee.address)

    expect(newGranteeData.transferNominee).to.equal(ZERO_ADDRESS)

    expect(originalGranteeData.quarterlyAmount).to.equal(newFutureGranteeData.quarterlyAmount)
    expect(originalGranteeData.totalAmount).to.equal(newFutureGranteeData.totalAmount)
    expect(originalGranteeData.amountRedeemed).to.equal(newFutureGranteeData.amountRedeemed)
    expect(originalGranteeData.startTimestamp).to.equal(newFutureGranteeData.startTimestamp)
    expect(originalGranteeData.cliffTimestamp).to.equal(newFutureGranteeData.cliffTimestamp)
    expect(originalGranteeData.vestInterval).to.equal(newFutureGranteeData.vestInterval)
    expect(futureGrantee.address).to.equal(newFutureGranteeData.transferNominee)
  });

  // Redemption
  it("Should allow tokens to be redeemed", async function () {
    const [owner, grantee] = await ethers.getSigners();

    await this.tokenContract.mint(this.vester.address, ethers.utils.parseEther("30000"))
    await this.vester.createGrant(grantee.address, 30000)
    await expect(this.vester.connect(grantee).redeem()).to.be.reverted;

    await network.provider.send("evm_increaseTime", [7889400 * 2])
    await network.provider.send("evm_mine")

    await this.vester.connect(grantee).redeem()
    expect(await this.tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("30000").div(4).div(3).mul(2));
  });

  it("Should allow tokens to be redeemed with a token deposit", async function () {
    const [owner, grantee] = await ethers.getSigners();

    const incomingTokenContract = await this.TokenContract.deploy();
    await incomingTokenContract.deployed();
    await incomingTokenContract.mint(grantee.address, ethers.utils.parseEther("1000"))
    await incomingTokenContract.connect(grantee).approve(this.vester.address, ethers.utils.parseEther("1000"))

    await this.tokenContract.mint(this.vester.address, ethers.utils.parseEther("30000"))
    await this.vester.createGrant(grantee.address, 30000)
    await expect(this.vester.connect(grantee).redeem()).to.be.reverted;

    await network.provider.send("evm_increaseTime", [7889400 * 2])
    await network.provider.send("evm_mine")

    await this.vester.connect(grantee).redeemWithTransfer(incomingTokenContract.address, ethers.utils.parseEther("1000"))

    expect(await this.tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("30000").div(4).div(3).mul(2));
    expect(await incomingTokenContract.balanceOf(this.vester.address)).to.equal(ethers.utils.parseEther("1000"));
  });

  // Withdrawal
  it("Should allow tokens to be withdrawn by the owner", async function () {
    const [owner, grantee] = await ethers.getSigners();

    await this.tokenContract.mint(this.vester.address, ethers.utils.parseEther("1000"))

    const anotherTokenContract = await this.TokenContract.deploy();
    await anotherTokenContract.deployed();
    await anotherTokenContract.mint(this.vester.address, ethers.utils.parseEther("2000"))

    await expect(this.vester.connect(grantee).withdraw(this.tokenContract.address, this.tokenContract.amount)).to.be.reverted;
    await expect(this.vester.connect(grantee).withdraw(anotherTokenContract.address, anotherTokenContract.amount)).to.be.reverted;

    await this.vester.withdraw(this.tokenContract.address, ethers.utils.parseEther("1000"))
    await this.vester.withdraw(anotherTokenContract.address, ethers.utils.parseEther("2000"))

    expect(await this.tokenContract.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000"));
    expect(await anotherTokenContract.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("2000"));
  });

  // E2E-style test
  it("Should handle a typical scenario", async function () {
    const [owner, grantee] = await ethers.getSigners();

    await this.tokenContract.mint(this.vester.address, ethers.utils.parseEther("30000"))
    await this.vester.createGrant(grantee.address, 30000)

    // The grantee shouldn't able to redeem right away...
    await expect(this.vester.connect(grantee).redeem()).to.be.reverted;

    // ...nor next quarter, because of the cliff
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await expect(this.vester.connect(grantee).redeem()).to.be.reverted;

    // The user should be able to redeem two quarters worth of SNX.
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await this.vester.connect(grantee).redeem()
    expect(await this.tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("5000"));

    // They shouldn't be able to redeem again immediately...
    await expect(this.vester.connect(grantee).redeem()).to.be.reverted;

    // ...but they should be able to redeem next quarter.
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await this.vester.connect(grantee).redeem()
    expect(await this.tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("7500"));

    // The owner, and only the owner, revokes the grantees grant.
    await expect(this.vester.connect(grantee).revokeGrant(grantee.address)).to.be.reverted;
    this.vester.connect(owner).revokeGrant(grantee.address);

    // Now the grantee can't redeem...
    await expect(this.vester.connect(grantee).redeem()).to.be.reverted;

    // ... nor next quarter.
    await network.provider.send("evm_increaseTime", [7889400])
    await network.provider.send("evm_mine")
    await expect(this.vester.connect(grantee).redeem()).to.be.reverted;

    // The owner reactivates the user's grant, under the same vesting schedule.
    const grantInfo = await this.vester.grants(grantee.address)
    await this.vester.connect(owner).updateGrant(
      grantee.address,
      grantInfo.startTimestamp,
      grantInfo.cliffTimestamp,
      grantInfo.quarterlyAmount,
      ethers.utils.parseEther("30000"),
      grantInfo.amountRedeemed,
      grantInfo.vestInterval,
    );

    // Now the user redeems as expected...
    await this.vester.connect(grantee).redeem()
    expect(await this.tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("10000"));

    // ...and long in the future, they're only able to redeem the total size of the grant.
    await network.provider.send("evm_increaseTime", [7889400 * 100])
    await network.provider.send("evm_mine")
    await this.vester.connect(grantee).redeem()
    expect(await this.tokenContract.balanceOf(grantee.address)).to.equal(ethers.utils.parseEther("30000"));
  });

});