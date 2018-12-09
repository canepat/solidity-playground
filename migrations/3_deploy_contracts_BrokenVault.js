const BrokenVault = artifacts.require("./BrokenVault.sol");

module.exports = function(deployer, network, accounts) {
    let owner = accounts[0];
    deployer.deploy(BrokenVault, { from: owner });
};
