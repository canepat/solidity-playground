pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "./BrokenToken.sol";

contract BrokenCrowdsale is MintedCrowdsale {
    constructor(uint256 _rate, address _wallet)
    Crowdsale(_rate, _wallet, new BrokenToken())
    public {}    
}