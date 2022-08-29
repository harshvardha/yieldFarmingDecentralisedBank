const { ethers, artifacts } = require("hardhat");
const fs = require("fs")

async function main() {
  const [owner] = await ethers.getSigners()
  const totalSupply = ethers.utils.parseEther("1000000")

  // deploying contracts
  // Sikka contract deployment
  const SikkaContract = await ethers.getContractFactory("Sikka")
  const sikkaContract = await SikkaContract.deploy()

  // RewardToken contract deployment
  const RewardTokenContract = await ethers.getContractFactory("RewardToken")
  const rewardTokenContract = await RewardTokenContract.deploy()

  // DecentralBank contract deployment
  const DecentralBankContract = await ethers.getContractFactory("DecentralBank")
  const decentralBankContract = await DecentralBankContract.deploy(sikkaContract.address, rewardTokenContract.address)

  // transferring all the reward tokens in bank's address
  rewardTokenContract.transfer(decentralBankContract.address, totalSupply)

  // saving the contract artifacts in src folder
  // for eact contract pass the deployed contract and its name to this function
  // and save the contract abi and address
  saveContractsData(owner, "owner")
  saveContractsData(sikkaContract, "Sikka")
  saveContractsData(rewardTokenContract, "RewardToken")
  saveContractsData(decentralBankContract, "DecentralBank")
}

function saveContractsData(contract, name) {
  const contractDir = "E:/Ethereum projects/projects/yield-farming-decentralized-bank/src/contractsData"
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir)
  }
  fs.writeFileSync(
    contractDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  )
  if (name !== "owner") {
    const contractArtifact = artifacts.readArtifactSync(name)
    fs.writeFileSync(
      contractDir + `/${name}.json`,
      JSON.stringify(contractArtifact, null, 2)
    )
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
