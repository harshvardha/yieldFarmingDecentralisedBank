import { useState, useEffect } from "react";
import { ethers } from "ethers"
import {
    sikkaContractAbi,
    sikkaContractAddress,
    rewardTokenContractAbi,
    rewardTokenContractAddress,
    decentralBankContractAbi,
    decentralBankContractAddress,
    ownerAddress
} from "../utils/constants"
import useTimer from "../hooks/useTimer";
import React from "react"
const { ethereum } = window

const YieldFarmingContext = React.createContext()

const createContracts = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const sikkaContract = new ethers.Contract(sikkaContractAddress, sikkaContractAbi, signer)
    const rewardTokenContract = new ethers.Contract(rewardTokenContractAddress, rewardTokenContractAbi, signer)
    const decentralBankContract = new ethers.Contract(decentralBankContractAddress, decentralBankContractAbi, signer)
    return { sikkaContract, rewardTokenContract, decentralBankContract }
}

const getOwnerAddressAsSigner = () => {
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider()
    const jsonRpcSigner = jsonRpcProvider.getSigner(ownerAddress)
    return jsonRpcSigner
}

const toWei = (amount) => ethers.utils.parseEther(amount.toString())
const fromWei = (amount) => ethers.utils.formatEther(amount)

const YieldFarmingProvider = ({ children }) => {
    const [sikkaContract, setSikkaContract] = useState(null)
    const [rewardTokenContract, setRewardTokenContract] = useState(null)
    const [decentralBankContract, setDecentralBankContract] = useState(null)
    const [userAddress, setUserAddress] = useState("")
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const [depositedBalance, setDepositedBalance] = useState(0)
    const [rewardTokenBalance, setRewardTokenBalance] = useState(0)
    const [accountBalance, setAccountBalance] = useState(0)
    const { timeRemaining, isTimeRunning, startTimer, resetTimer } = useTimer()

    const connectWallet = async () => {
        if (!ethereum) {
            window.alert("Please install MetaMask")
        }
        else {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const owner = getOwnerAddressAsSigner()
            setUserAddress(accounts[0])
            setIsWalletConnected(true)
            await sikkaContract.connect(owner).transfer(accounts[0], toWei(100))
            const depositBalance = await decentralBankContract.depositorBalance(accounts[0])
            const rewardTokenBalance = await rewardTokenContract.balanceOf(accounts[0])
            const sikkaBalance = await sikkaContract.balanceOf(accounts[0])
            setDepositedBalance(+fromWei(depositBalance))
            setRewardTokenBalance(+fromWei(rewardTokenBalance))
            setAccountBalance(+fromWei(sikkaBalance))
        }
    }

    const depositTokens = async (amount) => {
        try {
            await sikkaContract.approve(decentralBankContractAddress, toWei(amount))
            await decentralBankContract.connect(userAddress).depositTokens(toWei(amount))
            setDepositedBalance(amount)
            setAccountBalance(prevBalance => prevBalance - amount)
            startTimer(issueRewardTokens)
        } catch (error) {
            console.log(error)
        }
    }

    const issueRewardTokens = async () => {
        try {
            const owner = getOwnerAddressAsSigner()
            await decentralBankContract.connect(owner).issueRewardTokens(userAddress)
            const rewardTokensBalance = await rewardTokenContract.balanceOf(userAddress)
            setRewardTokenBalance(+fromWei(rewardTokensBalance))
        } catch (error) {
            console.log(error)
        }
    }

    const withdrawTokens = async () => {
        try {
            const depositBalance = await decentralBankContract.depositorBalance(userAddress)
            await decentralBankContract.withdrawTokens()
            setAccountBalance(prevBalance => prevBalance + +fromWei(depositBalance))
            setDepositedBalance(0)
            setRewardTokenBalance(0)
            if (isTimeRunning)
                resetTimer()
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const { sikkaContract, rewardTokenContract, decentralBankContract } = createContracts()
        setSikkaContract(sikkaContract)
        setRewardTokenContract(rewardTokenContract)
        setDecentralBankContract(decentralBankContract)
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