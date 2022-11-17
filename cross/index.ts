const deployContractsData = require("../deploy-contracts.json");
import { task } from "hardhat/config";

task("cross", "NFT Cross Chain Task")
    .addOptionalParam("id", "NFT ID example 1")
    .addOptionalParam("type", "action type")
    .addOptionalParam("address", "user address")
    .setAction(async (taskArgs, { network, ethers }: any) => {
        const signers = await ethers.getSigners();
        const deployer = signers[0];
        const deployContracts = {};
        const deployContractData = deployContractsData.filter(item => item.netName === network.name);

        for (let i = 0; i < deployContractData.length; i++) {
            const item = deployContractData[i];
            const factory = await ethers.getContractFactory(item.contractName);
            const c = await factory.attach(item.address);
            deployContracts[item.contractName] = {
                contract: c,
                ...item
            };
        };

        const contract = deployContracts["PPXLand"];
        const LandContract = contract?.contract;

        let id = taskArgs?.id, res;

        switch (taskArgs.type) {
            case "mint":
                res = await LandContract.mint(taskArgs.address || deployer.address, id);
                break;
            default:
                console.log(`❌ type: ${taskArgs.type}, type error`);
                return
        }
        res?.hash && console.log(`${res?.hash}`)
        console.log(`✅ ${taskArgs.type} success`);
    });