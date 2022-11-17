import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("PPXLand", function () {
  let LandContract: Contract, LandMintContract: Contract, owner: SignerWithAddress, owner2: SignerWithAddress, lzEndpointMock, chainId = 123;
  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    owner2 = signers[1];

    const LayerZeroEndpointMock = await ethers.getContractFactory("LocalLZEndpoint")
    lzEndpointMock = await LayerZeroEndpointMock.deploy(chainId)

    const PPXLand = await ethers.getContractFactory("PPXLand")
    const PPXLandMint = await ethers.getContractFactory("PPXLandMint")
    LandContract = await PPXLand.deploy(lzEndpointMock.address)
    LandMintContract = await PPXLandMint.deploy(lzEndpointMock.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])

    lzEndpointMock.setDestLzEndpoint(LandContract.address, lzEndpointMock.address)
    lzEndpointMock.setDestLzEndpoint(LandMintContract.address, lzEndpointMock.address)

    LandContract.setTrustedRemote(
      chainId,
      ethers.utils.solidityPack(["address", "address"], [LandMintContract.address, LandContract.address])
    )
    LandMintContract.setTrustedRemote(
      chainId,
      ethers.utils.solidityPack(["address", "address"], [LandContract.address, LandMintContract.address])
    )
  })

  it("Mint NFT", async function () {
    expect(await LandMintContract.ownerOf(1)).to.equal(owner.address);

    await LandMintContract.connect(owner2).mint(owner2.address, [24, 25, 26, 27]);
    expect(await LandMintContract.ownerOf(27)).to.equal(owner2.address);

    expect(await LandMintContract.totalSupply()).to.equal(28);
  });

  it("CrossChain", async function () {
    let ids = [0, 1, 2];
    const [adapterParams1, fees1] = await crossChainData(owner, LandContract, LandMintContract, chainId, true, ids);
    await LandMintContract.crossChain(owner.address, chainId, ids, adapterParams1, {
      value: fees1
    });

    ids = [0, 2]
    const [adapterParams2, fees2] = await crossChainData(owner, LandContract, LandMintContract, chainId, false, ids);
    await LandContract.crossChain(owner.address, chainId, ids, adapterParams2, {
      value: fees2
    });
  });
});

async function crossChainData(owner: SignerWithAddress, LandContract: Contract, LandMintContract: Contract, chainId: number, isMintContract: boolean, ids: number[]) {
  let adapterParams = ethers.utils.solidityPack(
    ['uint16', 'uint256'],
    [1, 200000 + ids.length * 50000]
  )
  let contract = isMintContract ? LandContract : LandMintContract;
  const fees = await contract.estimateFees(
    chainId,
    contract.address,
    {
      owner: owner.address,
      ids
    },
    adapterParams);

  return [adapterParams, fees] as const
}