pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract BrokenToken is DetailedERC20, MintableToken {
    constructor() DetailedERC20("MyBrokenToken", "MBT", 18) public {}
}