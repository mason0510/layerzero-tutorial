const fs = require("fs");
const chalk = require("chalk");

const deploymentsDir = "./deployments";

function publishContract(contractName: any, networkName: any) {
  let data = fs
    .readFileSync(`${deploymentsDir}/${networkName}/${contractName}.json`)
    .toString();
  let chainId = fs
    .readFileSync(`${deploymentsDir}/${networkName}/.chainId`)
    .toString();
  let contract = JSON.parse(data);
  return ({
    "contractName": contractName,
    "chainId": chainId,
    "address": contract.address,
    "netName": networkName
  })
}

async function main() {
  const directories = fs.readdirSync(deploymentsDir);
  const abis: any = [];
  directories.forEach(function (directory: any) {
    const files = fs.readdirSync(`${deploymentsDir}/${directory}`);
    files.forEach(function (file: any) {
      if (file.indexOf(".json") >= 0) {
        const contractName = file.replace(".json", "");
        const item = publishContract(contractName, directory);
        abis.push(item);
      }
    });
  });
  fs.writeFileSync(
    `deploy-contracts.json`,
    `${JSON.stringify(abis, null, 4)}`
  );
  console.log("✅ The file is generated successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
