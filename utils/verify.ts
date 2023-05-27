import { run } from "hardhat";

export const verify = async (contractAddress: string, args: Array<string>) => {
  console.log("Verifying contract ... ");
  console.log(`Contract Address ${contractAddress}, Arguments: ${args}`);
  try {
    // console.log(args);
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (err: { message?: string } | any) {
    console.log(err);
    // if (err.message?.toLowerCase().contains("already verified")) {
    //   console.log("Already Verified");
    // } else {
    //   console.log(err);
    // }
  }
};
