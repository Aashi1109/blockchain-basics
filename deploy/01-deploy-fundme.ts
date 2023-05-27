import { networkConfig, testNetworks } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { verify } from "../utils/verify";

const deployFundMe: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId!;
  const networkName = network.name;

  let ethUsdPriceFeedAddress: string;
  if (chainId === 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[networkName].ethUsdPriceFeed!;
  }
  log("Deploying FundMe..");
  const args = [ethUsdPriceFeedAddress];
  console.log(networkName);

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig[networkName].blockConfirmations,
  });

  // Verfication of contract code
  if (!testNetworks.includes(networkName) && process.env.ETHERSCAN_API_KEY) {
    // verify
    await verify(fundMe.address, args);
  }
  log("----------------------------------");
};

export default deployFundMe;
deployFundMe.tags = ["all", "fundme"];
