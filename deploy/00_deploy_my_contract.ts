const config = require("../cross/config.ts");

module.exports = async ({ getNamedAccounts, deployments }: { getNamedAccounts: any, deployments: any }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const network = config.network;

  let net = "hardhat";
  for (let i = 0; i < process?.argv?.length; i++) {
    const arg = process.argv[i]
    if (arg === "--network") {
      net = process?.argv[i + 1];
    }
  }

  if (net === config.landMintNetwork[net?.includes("test") ? "testnet" : "mainnet"]) {
    const LandMint = await deploy("PPXLandMint", {
      from: deployer,
      args: [network[net].endpoint, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]],
      log: true,
    });
    console.log("LandMint deployed to:", LandMint.address, network[net].endpoint);
  } else {
    const Land = await deploy("PPXLand", {
      from: deployer,
      args: [network[net].endpoint],
      log: true,
    });
    console.log("Land deployed to:", Land.address, network[net].endpoint);
  }
};

module.exports.tags = ["PPXLand"];