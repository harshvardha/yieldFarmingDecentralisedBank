const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { ethers } = require("hardhat")

const toWei = (amount) => ethers.utils.parseEther(amount.toString())
const fromWei = (amount) => ethers.utils.formatEther(amount)

describe("RewardToken Contract", function () {
    async function deployRewardTokenContract() {
        const [owner, addr1, addr2] = await ethers.getSigners()
        const RewardToken = await ethers.getContractFactory("RewardToken")
        const rewardTokenContract = await RewardToken.deploy()
        await rewardTokenContract.deployed()
        return { owner, addr1, addr2, RewardToken, rewardTokenContract }
    }

    describe("Contract Deployment", function () {
        it("name of the token must be REWARD", async function () {
            const { rewardTokenContract } = await loadFixture(deployRewardTokenContract)
            expect(await rewardTokenContract.name()).to.equal("REWARD")
        })

        it("symbol of token must be equal to REWARD", async function () {
            const { rewardTokenContract } = await loadFixture(deployRewardTokenContract)
            expect(await rewardTokenContract.symbol()).to.equal("RWD")
        })

        it("total supply of token must be equal to 10 Lakh", async function () {
            const { rewardTokenContract } = await loadFixture(deployRewardTokenContract)
            const balance = await rewardTokenContract.totalSupply()
            expect(+fromWei(balance)).to.equal(1000000)
        })

        it("owner's balance must be equal to 10 lakh tokens", async function () {
            const { owner, rewardTokenContract } = await loadFixture(deployRewardTokenContract)
            const ownerBalance = await rewardTokenContract.balanceOf(owner.address)
            expect(+fromWei(ownerBalance)).to.equal(1000000)
        })
    })

    describe("should transfer token from one account to another", function () {
        const amount = toWei(100)
        const totalSupply = 1000000

        it("should transfer 100 tokens from owner to addr1", async function () {
            const { owner, addr1, rewardTokenContract } = await loadFixture(deployRewardTokenContract)
            const remaining = totalSupply - 100
            await expect(await rewardTokenContract.transfer(addr1.address, amount))
                .to.be.emit(rewardTokenContract, "Transfer")
                .withArgs(owner.address, addr1.address, amount)
            const ownerBalance = await rewardTokenContract.balanceOf(owner.address)
            const addr1Balance = await rewardTokenContract.balanceOf(addr1.address)
            expect(+fromWei(ownerBalance)).to.equal(remaining)
            expect(+fromWei(addr1Balance)).to.equal(100)
        })

        it("should approve addr1 to spend on behalf of owner", async function () {
            const { owner, addr1, rewardTokenContract } = await loadFixture(deployRewardTokenContract)
            await expect(await rewardTokenContract.approve(addr1.address, amount))
                .to.be.emit(rewardTokenContract, "Approve")
                .withArgs(owner.address, addr1.address, amount)
            const approvedAmount = await rewardTokenContract.approvedToSpend(owner.address, addr1.address)
            expect(+fromWei(approvedAmount)).to.equal(100)
        })

        it("addr1 must transfer 100 tokens from onwer account to addr2", async function () {
            const { owner, addr1, addr2, rewardTokenContract } = await loadFixture(deployRewardTokenContract)
            const remaining = totalSupply - 100
            await rewardTokenContract.approve(addr1.address, amount)
            await expect(await rewardTokenContract.connect(addr1).transferFrom(owner.address, addr2.address, amount))
                .to.be.emit(rewardTokenContract, "Transfer")
                .withArgs(owner.address, addr2.address, amount)
            const ownerBalance = await rewardTokenContract.balanceOf(owner.address)
            const addr2Balance = await rewardTokenContract.balanceOf(addr2.address)
            expect(+fromWei(ownerBalance)).to.equal(remaining)
            expect(+fromWei(addr2Balance)).to.equal(100)
        })
    })
})