pragma solidity ^0.8.4;

contract EventContract {
    event TestEvent1(
        address sender,
        uint256 indexed counter,
        uint256 timestamp
    );
    event TestEvent2(address sender, uint256 counter, uint256 timestamp);
    uint256 counter;

    constructor() {}

    function execEvent1() external {
        counter++;
        emit TestEvent1(msg.sender, counter, block.timestamp);
    }

    function execEvent2() external {
        emit TestEvent2(msg.sender, counter * 69, block.timestamp);
    }
}
