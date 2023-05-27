import {
  DECIMALS,
  INITIAL_ANSWER,
  testNetworks,
} from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";

const deployMocks: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const networkName = network.name;

  if (testNetworks.includes(networkName)) {
    log("On Local Network. Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed");
    log("-------------------------------------");
  }
};

export default deployMocks;
deployMocks.tags = ["all", "mocks"];
