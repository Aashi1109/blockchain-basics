import { ethers } from "hardhat";
import { SimpleStorage } from "../typechain-types";
import { assert, expect } from "chai";

describe("Simple Storage", () => {
  let simpleStorageFactory, simpleStorage: SimpleStorage;
  beforeEach(async () => {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });
  it("Initial favourite number should be 0", async () => {
    const currentValue = await simpleStorage.retrieve();
    const expectedValue = "0";

    // Can be checked in two ways both here work same
    // expect(currentValue.toString(),"Not Matched").to.equal(expectedValue)
    assert.equal(currentValue.toString(), expectedValue, "Not matched");
  });

  it("Should update favourite number", async () => {
    const expectedValue = "7";
    const updateResp = await simpleStorage.setFavNumber(expectedValue);
    await updateResp.wait(1);
    const updatedFavNumber = await simpleStorage.retrieve();
    assert.equal(
      updatedFavNumber.toString(),
      expectedValue,
      "Not Updated Fav Number"
    );
  });
});
