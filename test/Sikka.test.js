const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { ethers } = require("hardhat")

const toWei = (amount) => ethers.utils.parseEther(amount.toString())
const fromWei = (amount) => ethers.utils.formatEther(amount)

describe("Sikka Contract", function () {
    async function deploySikkaContract() {
        const [owner, addr1, addr2] = await ethers.getSigners()
        const Sikka = await ethers.getContractFactory("Sikka")
        const sikkaContract = await Sikka.deploy()
        await sikkaContract.deployed()
        return { owner, addr1, addr2, Sikka, sikkaContract }
    }

    describe("Contract Deployment", function () {
        it("total no. of tokens in owner account should be 10 lakh", async function () {
            const { owner, sikkaContract } = await loadFixture(deploySikkaContract)
            const balance = await sikkaContract.balanceOf(owner.address)
            expect(+fromWei(balance)).to.equal(1000000)
        })

        it("name of the token must be Sikka", async function () {
            const { sikkaContract } = await loadFixture(deploySikkaContract)
            expect(await sikkaContract.name()).to.equal("Sikka")
        })

        it("symbol of the token must be equal to SIKKA", async function () {
            const { sikkaContract } = await loadFixture(deploySikkaContract)
            expect(await sikkaContract.symbol()).to.equal("SIKKA")
        })

        it("total supply should be equal to 10 lakh", async function () {
            const { sikkaContract } = await loadFixture(deploySikkaContract)
            const totalSupply = await sikkaContract.totalSupply()
            expect(+fromWei(totalSupply)).to.equal(1000000)
        })
    })

    describe("Transfer of tokens", function () {
        const amount = toWei(100)
        const totalSupply = 1000000

        it("should transfer tokens from owner to addr1", async function () {
            const { owner, addr1, sikkaContract } = await loadFixture(deploySikkaContract)
            // const amount = toWei(100)
            const remaining = totalSupply - 100
            await sikkaContract.transfer(addr1.address, amount)
            const ownerBalance = await sikkaContract.balanceOf(owner.address)
            const addr1Balance = await sikkaContract.balanceOf(addr1.address)
            expect(+fromWei(ownerBalance)).to.equal(remaining)
            expect(+fromWei(addr1Balance)).to.equal(100)
        })

        it("should approve addr1 to spend on behalf of owner", async function () {
            const { owner, addr1, sikkaContract } = await loadFixture(deploySikkaContract)
            // const amount = toWei(100)
            await expect(await sikkaContract.approve(addr1.address, amount))
                .to.be.emit(sikkaContract, "Approved")
                .withArgs(owner.address, addr1.address, amount)
        })

        it("addr1 should transfer 100 sikka token on behalf of owner to addr2", async function () {
            const { owner, addr1, addr2, sikkaContract } = await loadFixture(deploySikkaContract)
            await sikkaContract.approve(addr1.address, amount)
            const balance = await sikkaContract.approveToSpend(owner.address, addr1.address)
            expect(+fromWei(balance)).to.equal(100)
            await expect(await sikkaContract.connect(addr1).transferFrom(owner.address, addr2.address, amount))
                .to.be.emit(sikkaContract, "Transfer")
                .withArgs(owner.address, addr2.address, amount)
        })
    })
})