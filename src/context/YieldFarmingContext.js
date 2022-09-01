// All the function and states that are private to this context are starting with underscore(_)

import { useState, useEffect } from "react";
import { ethers } from "ethers"
import {
    _sikkaContractAbi,
    _sikkaContractAddress,
    _rewardTokenContractAbi,
    _rewardTokenContractAddress,
    _decentralBankContractAbi,
    _decentralBankContractAddress,
    _ownerAddress
} from "../utils/constants"
import React from "react"
const { ethereum } = window

const YieldFarmingContext = React.createContext()

// This function creates the contract instances with respective contract ABI, contract address
// and signer obejct which contains the address of the user which is using the DApp
const _createContracts = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const sikkaContract = new ethers.Contract(_sikkaContractAddress, _sikkaContractAbi, signer)
    const rewardTokenContract = new ethers.Contract(_rewardTokenContractAddress, _rewardTokenContractAbi, signer)
    const decentralBankContract = new ethers.Contract(_decentralBankContractAddress, _decentralBankContractAbi, signer)
    return { sikkaContract, rewardTokenContract, decentralBankContract }
}

// This function creates the JsonRpcSigner obejct with owner or contract deployer's address
const _getOwnerAddressAsSigner = () => {
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider()
    const jsonRpcSigner = jsonRpcProvider.getSigner(_ownerAddress)
    return jsonRpcSigner
}

// These both are utility functions
// toWei() is used to convert from ETH to Wei
const _toWei = (amount) => ethers.utils.parseEther(amount.toString())
// fromWei() is used to convert from Wei to ETH
const _fromWei = (amount) => ethers.utils.formatEther(amount)

// This ContextProvider contains all the states and function that is to be used by other components
// also some internal states which is only for use in this provider
// the states storing the contract instances and states used for running the airdrop timer
const YieldFarmingProvider = ({ children }) => {
    const [_sikkaContract, _setSikkaContract] = useState(null)
    const [_rewardTokenContract, _setRewardTokenContract] = useState(null)
    const [_decentralBankContract, _setDecentralBankContract] = useState(null)
    const [userAddress, setUserAddress] = useState("")
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const [depositedBalance, setDepositedBalance] = useState(0)
    const [rewardTokenBalance, setRewardTokenBalance] = useState(0)
    // accountBalance represent the SIKKA tokens balance in user's account
    const [accountBalance, setAccountBalance] = useState(0)
    // this state is used to track the 20 sec timer for airdrop it decreases every 1 sec when it is started
    const [timeRemaining, setTimeRemaining] = useState(20)
    // this state is used to represent whether or not the timer is running
    const [isTimeRunning, setIsTimeRunning] = useState(false)

    // This function is used to connect with the users wallet
    const connectWallet = async () => {
        if (!ethereum) {
            window.alert("Please install MetaMask")
        }
        else {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const owner = _getOwnerAddressAsSigner()
            setUserAddress(accounts[0])
            setIsWalletConnected(true)
            const balance = await _sikkaContract.balanceOf(accounts[0])
            if (+_fromWei(balance) === 0)
                // Here we are connecting to owner address because when the sikka contract is deployed
                // totalSupply of SIKKA token is transferred into owner's address
                // so for user to have the SIKKA tokens in their account we have to transfer
                // 100 tokens into user's account so that user can deposit in bank
                await _sikkaContract.connect(owner).transfer(accounts[0], _toWei(100))
            const depositBalance = await _decentralBankContract.depositorBalance(accounts[0])
            const rewardTokenBalance = await _rewardTokenContract.balanceOf(accounts[0])
            const sikkaBalance = await _sikkaContract.balanceOf(accounts[0])
            setDepositedBalance(+_fromWei(depositBalance))
            setRewardTokenBalance(+_fromWei(rewardTokenBalance))
            setAccountBalance(+_fromWei(sikkaBalance))
        }
    }

    // This function is used to deposit tokens in bank
    const depositTokens = async (amount) => {
        try {
            const depositAmount = _toWei(amount)
            await _sikkaContract.approve(_decentralBankContractAddress, depositAmount)
            await _decentralBankContract.depositTokens(depositAmount)
            // This isTimeRunning state is set to true to start the airdrop timer
            setIsTimeRunning(true)
        } catch (error) {
            console.log(error)
        }
    }

    // This function is used to withdraw SIKKA tokens from bank
    const withdrawTokens = async () => {
        try {
            await _rewardTokenContract.approve(_decentralBankContractAddress, _toWei(rewardTokenBalance))
            await _decentralBankContract.withdrawTokens()
        } catch (error) {
            console.log(error)
        }
    }

    // This useEffect hook is used to run the airdrop timer
    useEffect(() => {
        // This function is used to issue reward tokens (RWD) after timer reaches 0
        const _issueRewardTokens = async () => {
            try {
                // Here first we get the new signer object with owner's address
                const owner = _getOwnerAddressAsSigner()
                // then connect the decentralBank contract with it and then call the issueRewardTokens() function
                // so that msg.sender value contains the address of owner
                // so the require statement evaluates to true and transaction is successful
                await _decentralBankContract.connect(owner).issueRewardTokens(userAddress)
            } catch (error) {
                console.log(error)
            }
        }

        if (timeRemaining > 0 && isTimeRunning) {
            setTimeout(() => {
                setTimeRemaining(prevTime => prevTime - 1)
            }, 1000)
        }
        else if (timeRemaining === 0) {
            setIsTimeRunning(false)
            _issueRewardTokens()
        }
    }, [timeRemaining, isTimeRunning])

    // This is used to update the states which will store the contract instances
    // with the contract instances
    useEffect(() => {
        const { sikkaContract, rewardTokenContract, decentralBankContract } = _createContracts()
        _setSikkaContract(sikkaContract)
        _setRewardTokenContract(rewardTokenContract)
        _setDecentralBankContract(decentralBankContract)
    }, [])

    return (
        <YieldFarmingContext.Provider
            value={{
                depositedBalance,
                rewardTokenBalance,
                accountBalance,
                isWalletConnected,
                userAddress,
                timeRemaining,
                isTimeRunning,
                connectWallet,
                depositTokens,
                withdrawTokens
            }}
        >
            {children}
        </YieldFarmingContext.Provider>
    )
}

export { YieldFarmingContext, YieldFarmingProvider }