module.exports = async ({ getNamedAccounts, deployments }: { getNamedAccounts: any, deployments: any }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const greeter = await deploy("Greeter", {
    from: deployer,
    args: ["Hello, Hardhat!"],
    log: true,
  });

  console.log("Greeter deployed to:", greeter.address);
};

module.exports.tags = ["Greeter"];