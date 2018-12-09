pragma solidity ^0.4.24;

contract BrokenSplitter {
    address public one;
    address public two;

    constructor(address _two) public payable {
        require(msg.value > 0, "msg value is zero");
        one = msg.sender;
        two = _two;
    }

    function () public payable {
        uint amount = address(this).balance / 3;
        require(one.call.value(amount)(), "call to one failed");
        require(two.call.value(amount)(), "call to two failed");
    }
}