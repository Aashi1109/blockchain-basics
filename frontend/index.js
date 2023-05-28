import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.querySelector("#connectButton");
const fundButton = document.querySelector("#fundButton");
const withdrawButton = document.querySelector("#withdrawButton");
const currentBalanceText = document.querySelector("#balanceText");
const inputForm = document.querySelector("#inputForm");
const inputAmount = document.querySelector("#inputAmount");
const resultDiv = document.querySelector("#results");

// Show only connect button at start
inputForm.style.display = "none";
withdrawButton.style.display = "none";
currentBalanceText.style.display = "none";

// Global variables
let provider, signer, contract, contractBalance;

// Functions
async function getContractBalance() {
  const balance = await provider.getBalance(contractAddress);
  const formattedBalance = ethers.utils.formatEther(balance);
  return formattedBalance;
}

async function updateBalance() {
  contractBalance = await getContractBalance();
  currentBalanceText.innerHTML = `Current balance: ${contractBalance}ETH`;
}

async function connect() {
  const { ethereum } = window;

  if (typeof ethereum === undefined) {
    connectButton.innerHTML = "Please install metamask";
  } else {
    await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(ethereum);
    signer = provider.getSigner();

    contract = new ethers.Contract(contractAddress, abi, signer);

    await updateBalance();

    connectButton.innerHTML = "Connected";
    inputForm.style.display = "block";
    withdrawButton.style.display = "inline";
    currentBalanceText.style.display = "block";

    if (contractBalance === "0.0") {
      console.log("indos");
      withdrawButton.style.display = "none";
    }
  }
}
async function fund() {
  const fundAmount = inputAmount.value;
  if (typeof ethereum !== undefined && fundAmount !== undefined) {
    // Provider - connection to blockchain
    // Signer - wallet | anyone with gas
    inputForm.style.display = "none";
    resultDiv.innerHTML = "Funding...";

    try {
      const parsedAmount = ethers.utils.parseEther(fundAmount);
      //   console.log(parsedAmount);
      const transactionResponse = await contract.fund({
        value: parsedAmount,
      });
      inputAmount.value = "";

      await listenForTransactionMine(transactionResponse);
      inputForm.style.display = "block";
      resultDiv.innerHTML = "";
      await updateBalance();
      withdrawButton.style.display = "inline";
    } catch (error) {
      inputForm.style.display = "block";
      resultDiv.innerHTML = "";
      console.error(error);
    }
  }
}

function listenForTransactionMine(transactionResponse) {
  console.log(`Mining transaction ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
async function withdraw() {
  if (ethereum !== undefined) {
    try {
      resultDiv.innerHTML = "Withdrawing...";
      withdrawButton.style.display = "none";
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse);
      await updateBalance();

      inputAmount.innerHTML = "";
      resultDiv.innerHTML = "";
      if (contractBalance !== "0.0") withdrawButton.style.display = "block";
    } catch (error) {
      console.error(error);
    }
  }
}

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
withdrawButton.addEventListener("click", withdraw);
