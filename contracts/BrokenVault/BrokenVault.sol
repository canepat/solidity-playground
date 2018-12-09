pragma solidity ^0.4.24;

contract BrokenVault {
    bool public locked;
    bytes32 private password;

    constructor() public {
        locked = true;
        password = "really_not_secret";
    }

    function unlock(bytes32 _password) public {
        if (password == _password) {
            locked = false;
        }
    }
}