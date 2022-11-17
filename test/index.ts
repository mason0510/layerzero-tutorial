import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("PPXLand", function () {
  let LandContract: Contract, owner: SignerWithAddress, owner2: SignerWithAddress;

  it("Deploy Contract", async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    owner2 = signers[1];

    const Land = await ethers.getContractFactory("PPXLand");
    LandContract = await Land.deploy();
    await LandContract.deployed();
    expect(await LandContract.ownerOf(0)).to.equal(owner.address);
  });

  it("Mint NFT", async function () {
    await LandContract.mint(owner.address, 1);
    expect(await LandContract.ownerOf(1)).to.equal(owner.address);

    await LandContract.connect(owner2).mint(owner2.address, 2);
    expect(await LandContract.ownerOf(2)).to.equal(owner2.address);

    expect(await LandContract.totalSupply()).to.equal(3);
  });
});
