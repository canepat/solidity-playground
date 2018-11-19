const BrokenSplitter = artifacts.require("./BrokenSplitter.sol");
const BrokenSplitterAttack = artifacts.require("./BrokenSplitterAttack.sol");

module.exports = function(deployer, network, accounts) {
    let owner = accounts[0];
    deployer.deploy(BrokenSplitterAttack)
        .then(splitterAttack => deployer.deploy(BrokenSplitter, splitterAttack.address, { from: owner, value: 10 }));
};
