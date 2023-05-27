import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Withdrawing fund from contract...");
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Withdrawn!");
}

main()
  .then((_) => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
