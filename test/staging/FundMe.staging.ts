import { ethers, getNamedAccounts, network } from "hardhat";
import { testNetworks } from "../../helper-hardhat-config";
import {
  FundMe,
  FundMeInterface,
} from "../../typechain-types/contracts/FundMe";
import { assert } from "chai";

testNetworks.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let deployer: string, fundMe: FundMe;
      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows user to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await ethers.provider.getBalance(fundMe.address);
        assert(endingBalance.toString(), "0");
      });
    });
