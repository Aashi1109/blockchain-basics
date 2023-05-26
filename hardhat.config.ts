import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "./tasks/block-number";
import "hardhat-gas-reporter";
import "solidity-coverage";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ACCOUNT_PRIAVTE_KEY = process.env.ACCOUNT_PRIVATE_KEY ?? "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

task("accounts", "Prints list of Accounts", async (taskArgs: any, hre) => {
  const accounts = await hre.ethers.getSigners();

  console.log("====================================");
  for (const account of accounts) {
    console.log(account.address);
  }
  console.log("====================================");
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [ACCOUNT_PRIAVTE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  solidity: "0.8.18",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    noColors: true,
    outputFile: "gas-output.txt",
    currency: "INR",
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
};

export default config;
