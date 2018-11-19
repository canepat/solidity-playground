"use strict";

// Import the third-party libraries
let Promise = require("bluebird");
Promise.retry = require("bluebird-retry");

// Import the local libraries and customize the web3 environment
const addEvmFunctions = require("../utils/evmFunctions.js");
const addMinerFunctions = require("../utils/minerFunctions.js");

addEvmFunctions(web3);
addMinerFunctions(web3);

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}
if (typeof web3.evm.increaseTimePromise !== "function") {
    Promise.promisifyAll(web3.evm, { suffix: "Promise" });
}
if (typeof web3.miner.startPromise !== "function") {
    Promise.promisifyAll(web3.miner, { suffix: "Promise" });
}
if (typeof web3.version.getNodePromise !== "function") {
    Promise.promisifyAll(web3.version, { suffix: "Promise" });
}

module.exports = function getPastBlock(blockNumber) {
    let _node;
    return web3.version.getNodePromise()
        .then(node => {_node=node; return node.indexOf("EthereumJS TestRPC") >= 0})
        .then(isTestRPC => {
            // Wait for node to have mined a block after the requested one
            return Promise.retry(() => web3.eth.getBlockPromise("latest")
                .then(block => {
                    //console.log('block.number= '+block.number)
                    //console.log('blockNumber= '+blockNumber)
                    if (block.number <= blockNumber) {
                        if (isTestRPC == false){                            
                            let isParity = (_node.indexOf("Parity") >= 0)               
                            const src = web3.eth.coinbase;                 
                            const dest = web3.eth.accounts[1];                 
                            let minePromise = isParity ? web3.eth.sendTransaction({from:src, to:dest, value: web3.toWei(0.001, "ether")}) : web3.miner.startPromise(1);
                            return minePromise
                            .then(() => { throw new Error("Not ready yet"); });
                        } else {
                            let minePromise = web3.evm.minePromise();
                            return minePromise
                                .then(() => { throw new Error("Not ready yet"); });
                        }
                    }
                }),
                { max_tries: 1000, interval: 1000, timeout: 400000 });
        });
}
