import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const GWEI = 1000000000;
const accounts = process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    matictest: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: accounts,
      chainId: 80001
    },
    ftmtest: {
      url: "https://rpc.ankr.com/fantom_testnet",
      accounts: accounts,
    },
    avaxtest: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: accounts
    },
    bsctest: {
      url: "https://bsctestapi.terminet.io/rpc",
      chainId: 97,
      accounts: accounts
    },

    polygon: {
      url: "https://polygon-rpc.com",
      gasPrice: 30 * GWEI,
      accounts: accounts,
    },
    ftm: {
      url: "https://rpc3.fantom.network",
      gasPrice: 2 * GWEI,
      accounts: accounts,
    },
    avax: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 2 * GWEI,
      chainId: 43114,
      accounts: accounts,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
