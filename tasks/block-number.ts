import { task } from "hardhat/config";

task("block-number", "Retrives current block number").setAction(
  async (taskArgs: any, hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`Current block number is ${blockNumber}`);
  }
);
