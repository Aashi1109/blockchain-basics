import { ethers, run, network } from "hardhat";

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract ...");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.deployed();
  console.log("Contract deployed to:", simpleStorage.address);

  // ts-ignore
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(4);
    await verify(simpleStorage.address, []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current retrieved value: ${currentValue}`);

  // Updating current value
  const transactionResponse = await simpleStorage.setFavNumber(5);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();

  console.log(`After updating value: ${updatedValue}`);
}

async function verify(contractAddress: String, args: Array<String>) {
  try {
    console.log("Verifying contract ...");
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (err) {
    if (err.message.toLowerCase().contains("already verified")) {
      return console.log("Already Verified");
    } else {
      return console.log(err);
    }
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
