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
const BrokenSplitter = artifacts.require("BrokenSplitter");
const BrokenSplitterAttack = artifacts.require("BrokenSplitterAttack");

// Contract unit and interation tests
contract("BrokenSplitter", function(accounts) {
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

    let coinbase, owner, user1, user2, user3;
    before("checking accounts", async function() {
        assert.isAtLeast(accounts.length, 5, "not enough accounts");

        coinbase = await web3.eth.getCoinbasePromise();

        // Coinbase gets the rewards, making calculations difficult.
        const coinbaseIndex = await  accounts.indexOf(coinbase);
        // Remove the actual account
        if (coinbaseIndex > -1) {
            const result = accounts.splice(coinbaseIndex, 1);
        }
        [owner, user1, user2, user3] = accounts;

        const result = await web3.eth.makeSureAreUnlocked(accounts);
        const txObj = await web3.eth.makeSureHasAtLeast(coinbase, [owner, user1, user2, user3], web3.toWei(1, 'ether'));
        await web3.eth.getTransactionReceiptMined(txObj);
    });

    describe("#reentrancy attack", async function() {
        it("should extract half of amount leaving splitter empty", async function() {
            this.slow(slowDuration);

            const INITIAL_VALUE = 300;
            const DELTA_VALUE = 300;
            const TOTAL_VALUE = INITIAL_VALUE + DELTA_VALUE;

            const splitterAttack = await BrokenSplitterAttack.new({ from: owner, gas: MAX_GAS });
            const splitter = await BrokenSplitter.new(splitterAttack.address, { from: user1, gas: MAX_GAS, value: INITIAL_VALUE });

            const attackBalanceBefore = await web3.eth.getBalance(splitterAttack.address);
            const splitterBalanceBefore = await web3.eth.getBalance(splitter.address);
            assert.strictEqual(attackBalanceBefore.toNumber(), 0, "initial splitter attack balance is not zero");
            assert.strictEqual(splitterBalanceBefore.toNumber(), INITIAL_VALUE, "initial splitter balance is wrong");

            const txObj = await splitter.sendTransaction({ from: owner, gas: MAX_GAS, value: DELTA_VALUE });
            await web3.eth.getTransactionReceiptMined(txObj.tx);

            const splitterBalanceAfter = await web3.eth.getBalance(splitter.address);
            assert.strictEqual(splitterBalanceAfter.toNumber(), 2-TOTAL_VALUE%2, "final splitter balance is wrong");

            const attackBalanceAfter = await web3.eth.getBalance(splitterAttack.address);
            const attackBalanceDelta = attackBalanceAfter.minus(attackBalanceBefore);
            assert.strictEqual(attackBalanceDelta.toNumber(), TOTAL_VALUE/2-1, "final attacker balance is wrong");
        });
    });
});