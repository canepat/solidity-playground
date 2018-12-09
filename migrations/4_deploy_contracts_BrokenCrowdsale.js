const BrokenCrowdsale = artifacts.require("./BrokenCrowdsale.sol");

module.exports = function(deployer, network, accounts) {
    let owner = accounts[0];
    let wallet = accounts[1];
    deployer.deploy(BrokenCrowdsale, 1000, wallet, { from: owner });
};
