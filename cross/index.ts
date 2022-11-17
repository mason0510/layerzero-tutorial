const deployContractsData = require("../deploy-contracts.json");
const config = require("./config.ts");
import { task } from "hardhat/config";

task("cross", "NFT Cross Chain Task")
    .addOptionalParam("to", "To Network")
    .addOptionalParam("ids", "Cross Chain ID example 1 or 1,2,3")
    .addOptionalParam("type", "action type")
    .addOptionalParam("address", "user address")
    .setAction(async (taskArgs, { network, ethers }: any) => {
        const { BigNumber } = ethers;
        const signers = await ethers.getSigners();
        const deployer = signers[0];
        const deployContracts = {};
        const deployContractData = deployContractsData.filter(item => item.netName === network.name);

        const networks = config.network;
        const landMintNetwork = config.landMintNetwork[network.name?.includes("test") ? "testnet" : "mainnet"];
        const contractName = (net) => net === landMintNetwork ? "PPXLandMint" : "PPXLand";
        const toData = deployContractsData.filter(item => item.netName === taskArgs.to && item?.contractName === contractName(taskArgs.to));
        const URLS = {
            testnet: 'https://api-testnet.layerzero-scan.com',
            mainnet: 'https://api-mainnet.layerzero-scan.com',
            sandbox: 'https://api-sandbox.layerzero-scan.com',
        };

        const contracts = {};

        for (let i = 0; i < deployContractData.length; i++) {
            const item = deployContractData[i];
            const factory = await ethers.getContractFactory(item.contractName);
            const c = await factory.attach(item.address);
            deployContracts[item.contractName] = {
                contract: c,
                ...item
            };
        };

        const dstCrossChainData = networks[taskArgs.to];
        const srcCrossChainData = networks[network.name];

        if (!dstCrossChainData) {
            console.log("Cross Chain Error");
            return
        }

        let EndpointABI = [
            "function retryPayload(uint16 _srcChainId, bytes calldata _srcAddress, bytes calldata _payload) external",
            "function storedPayload(uint16 _srcChainId, bytes calldata _srcAddress) view"
        ];

        const EndpointContractFactory = new ethers.Contract(srcCrossChainData.endpoint, EndpointABI, deployer);
        const EndpointContract = await EndpointContractFactory.attach(srcCrossChainData.endpoint);
        const LandPawnshopContract = contracts["PPXLandPawnshop"]?.contract;
        const contract = contracts[contractName(network?.name)];
        const LandContract = contract?.contract;
        let dstChainId = BigNumber.from(dstCrossChainData.chainId);
        const trustedRemote = await LandContract.trustedRemoteLookup(dstChainId);
        const dstTrustedRemote = ethers.utils.solidityPack(
            ['address', 'address'],
            [toData[0].address, contract.address]
        )
        const isSetTrustedRemote = dstTrustedRemote?.toLowerCase() === trustedRemote?.toLowerCase();
        const output = {
            account: `${srcCrossChainData.blockscan}/address/${deployer.address}`,
            fromChain: {
                chainId: srcCrossChainData.chainId,
                endpoint: `${srcCrossChainData.blockscan}/address/${srcCrossChainData.endpoint}`,
                contract: `${srcCrossChainData.blockscan}/address/${LandContract.address}`,
                network: network.name
            },
            toChain: {
                chainId: dstCrossChainData.chainId,
                endpoint: `${dstCrossChainData.blockscan}/address/${dstCrossChainData.endpoint}`,
                contract: `${dstCrossChainData.blockscan}/address/${toData[0].address}`,
                network: toData[0].netName,
                trustedRemote,
            },
            ids: taskArgs.ids,
            pawnshop: LandPawnshopContract?.address ? `${networks[landMintNetwork]?.blockscan}/address/${LandPawnshopContract?.address}` : "The Chain No Deploy Pawnshop Contract"
        }
        console.log(output);

        return

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