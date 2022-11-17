module.exports = async ({ getNamedAccounts, deployments }: { getNamedAccounts: any, deployments: any }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const ppxland = await deploy("PPXLand", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log("PPXLand deployed to:", ppxland.address);
};

module.exports.tags = ["PPXLand"];