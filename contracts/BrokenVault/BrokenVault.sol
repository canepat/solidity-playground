pragma solidity ^0.4.24;

contract BrokenVault {
    bool public locked;
    bytes32 private password;

    constructor(bytes32 _password) public {
        locked = true;
        password = _password;
    }

    function unlock(bytes32 _password) public {
        if (password == _password) {
            locked = false;
        }
    }
}