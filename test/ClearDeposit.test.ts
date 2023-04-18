import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import Exceptions from "./utils/Exceptions";

describe("ClearDeposit", function () {
    let snapshotId: any;
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployClearDepositFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, userAccount] = await ethers.getSigners();

        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        const erc20Mock = await ERC20Mock.deploy();

        const ClearDeposit = await ethers.getContractFactory("ClearDeposit");
        const clearDeposit = await ClearDeposit.deploy(erc20Mock.address);

        return { clearDeposit, erc20Mock, owner, otherAccount, userAccount };
    }

    // beforeEach(async function () {
    //   snapshotId = await network.provider.request({
    //       method: "evm_snapshot",
    //       params: [],
    //   });
    // });

    // afterEach(async function () {
    //     snapshotId = await network.provider.request({
    //         method: "evm_revert",
    //         params: [snapshotId],
    //     });
    // });

    describe("Deployment", function () {
        it("Should set the right owner and token", async function () {
            const { clearDeposit, erc20Mock, owner } = await loadFixture(
                deployClearDepositFixture
            );

            expect(await clearDeposit.owner()).to.equal(owner.address);
            expect(await clearDeposit.token()).to.equal(erc20Mock.address);
            expect(
                await clearDeposit.isManagerWhitelisted(owner.address)
            ).to.equal(true);
        });
    });

    describe("Deposit", function () {
        it("Can't deposit without allowance", async function () {
            const { clearDeposit } = await loadFixture(
                deployClearDepositFixture
            );
            const amount = ethers.utils.parseEther("1");

            await expect(clearDeposit.deposit(amount)).to.be.revertedWith(
                "ERC20: insufficient allowance"
            );
        });

        it("Can't deposit without tokens", async function () {
            const { clearDeposit, erc20Mock, otherAccount } = await loadFixture(
                deployClearDepositFixture
            );
            const amount = ethers.utils.parseEther("1");

            await erc20Mock
                .connect(otherAccount)
                .increaseAllowance(clearDeposit.address, amount);
            await expect(
                clearDeposit.connect(otherAccount).deposit(amount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Successfuly deposit tokens", async function () {
            const { clearDeposit, erc20Mock, otherAccount } = await loadFixture(
                deployClearDepositFixture
            );
            const amount = ethers.utils.parseEther("1");

            await erc20Mock.transfer(otherAccount.address, amount);
            await erc20Mock
                .connect(otherAccount)
                .increaseAllowance(clearDeposit.address, amount);
            await expect(clearDeposit.connect(otherAccount).deposit(amount)).to
                .be.not.reverted;
            expect(await clearDeposit.deposits(otherAccount.address)).to.equal(
                amount
            );
            expect(
                await clearDeposit.lockedBalanceOf(otherAccount.address)
            ).to.equal(amount);
            expect(await erc20Mock.balanceOf(clearDeposit.address)).to.equal(
                amount
            );
        });
    });

    describe("addManagerToWhitelist", function () {
        it("Successfuly add manager to whitelist", async function () {
            const { clearDeposit, otherAccount } = await loadFixture(
                deployClearDepositFixture
            );

            expect(clearDeposit.addManagerToWhitelist(otherAccount.address)).to
                .be.not.reverted;
            expect(
                await clearDeposit.isManagerWhitelisted(otherAccount.address)
            ).to.equal(true);
        });

        it("Only owner can add managers", async function () {
            const { clearDeposit, otherAccount, userAccount } =
                await loadFixture(deployClearDepositFixture);

            await expect(
                clearDeposit
                    .connect(otherAccount)
                    .addManagerToWhitelist(userAccount.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Can't add account to whitelist twice", async function () {
            const { clearDeposit, otherAccount } = await loadFixture(
                deployClearDepositFixture
            );

            await clearDeposit.addManagerToWhitelist(otherAccount.address);
            await expect(
                clearDeposit.addManagerToWhitelist(otherAccount.address)
            ).to.be.revertedWith(Exceptions.ALREADY_WHITELISTED);
        });
    });

    describe("removeManagerFromWhitelist", function () {
        it("Successfuly remove manager from whitelist", async function () {
            const { clearDeposit, otherAccount } = await loadFixture(
                deployClearDepositFixture
            );

            expect(
                clearDeposit.removeManagerFromWhitelist(otherAccount.address)
            ).to.be.not.reverted;
            expect(
                await clearDeposit.isManagerWhitelisted(otherAccount.address)
            ).to.equal(false);
        });

        it("Only owner can remove managers", async function () {
            const { clearDeposit, otherAccount, userAccount } =
                await loadFixture(deployClearDepositFixture);

            await expect(
                clearDeposit
                    .connect(otherAccount)
                    .removeManagerFromWhitelist(userAccount.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Can't remove not whitelisted account", async function () {
            const { clearDeposit, otherAccount } = await loadFixture(
                deployClearDepositFixture
            );

            await clearDeposit.addManagerToWhitelist(otherAccount.address);
            await expect(
                clearDeposit.removeManagerFromWhitelist(otherAccount.address)
            ).to.be.revertedWith(Exceptions.ALREADY_NOT_WHITELISTED);
        });
    });
});
