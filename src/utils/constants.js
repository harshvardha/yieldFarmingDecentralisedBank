// This file contains the abi and address of all the three contracts Sikka.sol, RewardToken.sol and DecentralBank.sol
// It also contains the address of the contract deployer or owner address

import sikkaContractABI from "../contractsData/Sikka.json"
import sikkaContractAddr from "../contractsData/Sikka-address.json"
import rewardTokenContractABI from "../contractsData/RewardToken.json"
import rewardTokenContractAddr from "../contractsData/RewardToken-address.json"
import decentralBankContractABI from "../contractsData/DecentralBank.json"
import decentralBankContractAddr from "../contractsData/DecentralBank-address.json"
import owner from "../contractsData/owner-address.json"

export const _sikkaContractAbi = sikkaContractABI.abi
export const _sikkaContractAddress = sikkaContractAddr.address
export const _rewardTokenContractAbi = rewardTokenContractABI.abi
export const _rewardTokenContractAddress = rewardTokenContractAddr.address
export const _decentralBankContractAbi = decentralBankContractABI.abi
export const _decentralBankContractAddress = decentralBankContractAddr.address
export const _ownerAddress = owner.address