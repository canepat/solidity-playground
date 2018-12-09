"use strict";

// Import the third-party libraries
const promise = require("bluebird");

// Import the local libraries and customize the web3 environment
const addEvmFunctions = require("../utils/evmFunctions.js");

addEvmFunctions(web3);

if (typeof web3.eth.getBlockPromise !== "function") {
    promise.promisifyAll(web3.eth, { suffix: "Promise" });
}
if (typeof web3.evm.increaseTimePromise !== "function") {
    promise.promisifyAll(web3.evm, { suffix: "Promise" });
}
if (typeof web3.version.getNodePromise !== "function") {
    promise.promisifyAll(web3.version, { suffix: "Promise" });
}

web3.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined.js");
web3.eth.makeSureHasAtLeast = require("../utils/makeSureHasAtLeast.js");
web3.eth.makeSureAreUnlocked = require("../utils/makeSureAreUnlocked.js");

const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const assert = chai.assert;

// Import the smart contracts
const BrokenCrowdsale = artifacts.require("BrokenCrowdsale");
const BrokenToken = artifacts.require("BrokenToken");

// Contract unit and interation tests
contract("BrokenCrowdsale", function(accounts) {
    const MAX_GAS               = 2900000;
    const TESTRPC_SLOW_DURATION = 5300;
    const GETH_SLOW_DURATION    = 15000;

    let node, isTestRPC, isGeth, slowDuration;
    before("identifying node", async function() {
        node = await web3.version.getNodePromise();
        isTestRPC = await node.indexOf("EthereumJS TestRPC") >= 0;
        isGeth = await node.indexOf("Geth") >= 0;
        slowDuration = isTestRPC ? TESTRPC_SLOW_DURATION : GETH_SLOW_DURATION;
    });

    let coinbase, owner, wallet, user1;
    before("checking accounts", async function() {
        assert.isAtLeast(accounts.length, 5, "not enough accounts");

        coinbase = await web3.eth.getCoinbasePromise();

        // Coinbase gets the rewards, making calculations difficult.
        const coinbaseIndex = await  accounts.indexOf(coinbase);
        // Remove the actual account
        if (coinbaseIndex > -1) {
            accounts.splice(coinbaseIndex, 1);
        }
        [owner, wallet, user1] = accounts;

        await web3.eth.makeSureAreUnlocked(accounts);
        const txObj = await web3.eth.makeSureHasAtLeast(coinbase, [owner, wallet, user1], web3.toWei(1, 'ether'));
        await web3.eth.getTransactionReceiptMined(txObj);
    });

    describe("#token accumulation attack", async function() {
        it("should allow the crowdsale wallet to get free tokens", async function() {
            this.slow(slowDuration);

            const RATE = 1000;
            const INVESTMENT = 1 * 10**18;

            const crowdsale = await BrokenCrowdsale.new(RATE, wallet, { from: owner, gas: MAX_GAS });
            const tokenAddress = await crowdsale.token();
            const token = await BrokenToken.at(tokenAddress);

            const walletBalanceBefore = await web3.eth.getBalance(wallet);
            const walletTokenBalanceBefore = await token.balanceOf(wallet);
            walletTokenBalanceBefore.should.be.bignumber.equal(0);

            await crowdsale.sendTransaction({ from: user1, gas: MAX_GAS, value: INVESTMENT });

            const walletBalanceAfter1 = await web3.eth.getBalance(wallet);
            (walletBalanceAfter1.minus(walletBalanceBefore)).should.be.bignumber.equal(INVESTMENT);

            const txObj = await crowdsale.sendTransaction({ from: wallet, gas: MAX_GAS, value: INVESTMENT });

            const tx = await web3.eth.getTransaction(txObj.tx);
            const txCost = tx.gasPrice.times(txObj.receipt.gasUsed);
            const walletBalanceAfter2 = await web3.eth.getBalance(wallet);
            (walletBalanceAfter1.minus(walletBalanceAfter2)).should.be.bignumber.equal(txCost);

            const walletTokenBalanceAfter = await token.balanceOf(wallet);
            walletTokenBalanceAfter.should.be.bignumber.equal(INVESTMENT*RATE);
        });
    });
});