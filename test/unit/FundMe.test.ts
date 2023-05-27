import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { assert, expect } from "chai";
import { testNetworks } from "../../helper-hardhat-config";

!testNetworks.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe: FundMe, mockV3Aggregator: MockV3Aggregator;
      //   @ts-ignore
      let deployer: string;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        // deploy our contract
        // using hardhat-deploy
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", async () => {
        it("sets aggregator address correctly", async () => {
          const receivedPriceFeedAddress = await fundMe.getPriceFeed();
          assert.equal(
            receivedPriceFeedAddress,
            mockV3Aggregator.address,
            "Not matched"
          );
        });
      });

      describe("fund", () => {
        it("Fails if you don't send enough eth", async () => {
          expect(await fundMe.fund({ value: sendValue }))?.to.be.revertedWith(
            "You need to spend more eth"
          );
        });

        it("update the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });

          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funder to funders array", async () => {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });

        describe("withdraw", () => {
          beforeEach(async () => {
            await fundMe.fund({ value: sendValue });
          });
          it("withdraw ETH from single funder", async () => {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            // Act
            const transactionRespone = await fundMe.withdraw();
            const transactionReceipt = await transactionRespone.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasValue = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Assert
            assert(endingFundMeBalance.toString(), "0");
            assert(
              startingDeployerBalance.add(startingFundMeBalance).toString(),
              endingDeployerBalance.add(gasValue).toString()
            );
          });

          it("Withdraw from multiple accounts", async () => {
            // Arrange
            const accounts = await ethers.getSigners();
            for (const account of accounts) {
              const fundMeConnectedContract = await fundMe.connect(account);
              await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            // Act
            const transactionRespone = await fundMe.withdraw();
            const transactionReceipt = await transactionRespone.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasValue = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Assert
            assert(endingFundMeBalance.toString(), "0");
            assert(
              startingDeployerBalance.add(startingFundMeBalance).toString(),
              endingDeployerBalance.add(gasValue).toString()
            );

            // Reset funders properly
            await expect(fundMe.s_funders(0)).to.be.reverted;

            for (const account of accounts) {
              assert.equal(
                (
                  await fundMe.getAddressToAmountFunded(account.address)
                ).toString(),
                "0"
              );
            }
          });

          it("Only owner can withdraw", async () => {
            const accounts = await ethers.getSigners();
            const attackerConnectedContract = await fundMe.connect(accounts[1]);
            await expect(
              attackerConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner");
          });
        });
      });
    });
