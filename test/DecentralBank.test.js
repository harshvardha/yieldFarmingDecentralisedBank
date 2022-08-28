const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { ethers } = require("hardhat")

const toWei = (amount) => ethers.utils.parseEther(amount.toString())
const fromWei = (amount) => ethers.utils.formatEther(amount)

describe("DecentralBank Contract", function () {
    async function deployDecentralBankContract() {
        const totalSupply = toWei(1000000)
        const [owner, addr1] = await ethers.getSigners()
        const DecentralBank = await ethers.getContractFactory("DecentralBank")
        const Sikka = await ethers.getContractFactory("Sikka")
        const sikkaContract = await Sikka.deploy()
        await sikkaContract.deployed()
        const RewardToken = await ethers.getContractFactory("RewardToken")
        const rewardTokenContract = await RewardToken.deploy()
        await rewardTokenContract.deployed()
        const decentralBankContract = await DecentralBank.deploy(rewardTokenContract.address, sikkaContract.address)
        await decentralBankContract.deployed()
        await sikkaContract.transfer(addr1.address, toWei(100))
        await rewardTokenContract.transfer(decentralBankContract.address, totalSupply)
        return { owner, addr1, decentralBankContract, sikkaContract, rewardTokenContract }
    }

    describe("Contract Deployment", function () {
        it("name of the contract should be DECENTRAL BANK", async function () {
            const { decentralBankContract } = await loadFixture(deployDecentralBankContract)
            expect(await decentralBankContract.name()).to.equal("DECENTRAL BANK")
        })

        it("address of owner should be equal to owner", async function () {
            const { owner, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            expect(await decentralBankContract.owner()).to.equal(owner.address)
        })
    })

    describe("Deposit Tokens", function () {
        const amount = toWei(100)
        it("decentral bank should get approved to transfer deposited tokens on behalf of addr1", async function () {
            const { addr1, sikkaContract, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            await expect(await sikkaContract.connect(addr1).approve(decentralBankContract.address, amount))
                .to.be.emit(sikkaContract, "Approved")
                .withArgs(addr1.address, decentralBankContract.address, amount)
        })

        it("transaction should revert if the deposited amount is equal to 0", async function () {
            const { addr1, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            await expect(decentralBankContract.connect(addr1).depositTokens(0))
                .to.be.revertedWith("Deposit amount should be greater than 0")
        })

        it("tokens must be deposited if amount is greater than 0", async function () {
            const { addr1, sikkaContract, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            const depositAmount = toWei(50)
            await sikkaContract.connect(addr1).approve(decentralBankContract.address, depositAmount)
            await decentralBankContract.connect(addr1).depositTokens(depositAmount)
            const depositedAmount = await decentralBankContract.depositorBalance(addr1.address)
            expect(+fromWei(depositedAmount)).to.equal(50)
        })
    })

    describe("Issue Reward Tokens", function () {
        it("should revert if owner is not issuing the tokens", async function () {
            const { addr1, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            await expect(decentralBankContract.connect(addr1).issueRewardTokens(addr1.address))
                .to.be.revertedWith("Only owner is allowed to issue reward tokens")
        })

        it("should revert if deposited amount is less than 50", async function () {
            const { addr1, sikkaContract, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            const depositAmount = toWei(30)
            await expect(await sikkaContract.connect(addr1).approve(decentralBankContract.address, depositAmount))
                .to.be.emit(sikkaContract, "Approved")
                .withArgs(addr1.address, decentralBankContract.address, depositAmount)
            await expect(await decentralBankContract.connect(addr1).depositTokens(depositAmount))
                .to.be.emit(sikkaContract, "Transfer")
                .withArgs(addr1.address, decentralBankContract.address, depositAmount)
            await expect(decentralBankContract.issueRewardTokens(addr1.address))
                .to.be.revertedWith("Recipient is not qualified for reward tokens")
        })

        it("should issue reward tokens when deposited amount is greater than or equal to 50", async function () {
            const { addr1, sikkaContract, decentralBankContract, rewardTokenContract } = await loadFixture(deployDecentralBankContract)
            const depositAmount = toWei(90)
            await expect(await sikkaContract.connect(addr1).approve(decentralBankContract.address, depositAmount))
                .to.be.emit(sikkaContract, "Approved")
                .withArgs(addr1.address, decentralBankContract.address, depositAmount)
            await expect(await decentralBankContract.connect(addr1).depositTokens(depositAmount))
                .to.be.emit(sikkaContract, "Transfer")
                .withArgs(addr1.address, decentralBankContract.address, depositAmount)
            await expect(await decentralBankContract.issueRewardTokens(addr1.address))
                .to.be.emit(rewardTokenContract, "Transfer")
                .withArgs(decentralBankContract.address, addr1.address, toWei(90 / 9))
            const rewardTokenBalance = await rewardTokenContract.balanceOf(addr1.address)
            expect(+fromWei(rewardTokenBalance)).to.equal(10)
        })
    })

    describe("Withdraw Tokens", function () {
        it("should revert if depositor balance is not greater than 0", async function () {
            const { addr1, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            await expect(decentralBankContract.connect(addr1).withdrawTokens())
                .to.be.revertedWith("Insufficient Balance")
        })

        it("depositor balance should be 0, sikka tokens should return to addr1 and reward tokens will be transfered back to bank", async function () {
            const { addr1, sikkaContract, rewardTokenContract, decentralBankContract } = await loadFixture(deployDecentralBankContract)
            const depositAmount = toWei(90)
            await sikkaContract.connect(addr1).approve(decentralBankContract.address, depositAmount)
            await decentralBankContract.connect(addr1).depositTokens(depositAmount)
            await decentralBankContract.issueRewardTokens(addr1.address)
            await rewardTokenContract.connect(addr1).approve(decentralBankContract.address, toWei(10))
            await decentralBankContract.connect(addr1).withdrawTokens()
            const depositorBalance = await decentralBankContract.depositorBalance(addr1.address)
            const sikkaTokenBalance = await sikkaContract.balanceOf(addr1.address)
            const rewardTokenBalance = await rewardTokenContract.balanceOf(addr1.address)
            expect(+fromWei(depositorBalance)).to.equal(0)
            expect(+fromWei(sikkaTokenBalance)).to.equal(100)
            expect(+fromWei(rewardTokenBalance)).to.equal(0)
        })
    })
})