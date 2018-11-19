pragma solidity ^0.4.24;

contract BrokenSplitter {
    address public one;
    address public two;

    constructor(address _two) public payable {
        require(msg.value > 0);
        one = msg.sender;
        two = _two;
    }

    function () public payable {
        uint amount = address(this).balance / 3;
        require(one.call.value(amount)());
        require(two.call.value(amount)());
    }
}