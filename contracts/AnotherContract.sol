pragma solidity ^0.8.4;

contract AnotherContract {
    event AnotherEvent1(
        address sender,
        uint256 indexed counter,
        uint256 timestamp
    );
    event AnotherEvent2(address sender, uint256 counter, uint256 timestamp);
    uint256 counter;

    constructor() {}

    function execEvent1() external {
        counter++;
        emit AnotherEvent1(msg.sender, counter, block.timestamp);
    }

    function execEvent2() external {
        emit AnotherEvent2(msg.sender, counter * 69, block.timestamp);
    }
}
