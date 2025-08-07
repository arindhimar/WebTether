// contracts/PingPayment.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PingPayment {
    address public owner;

    event PingPaid(address indexed payer, uint256 amount);
    event RewardGiven(address indexed receiver, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function payForPing() public payable {
        require(msg.value == 0.0002 ether, "Ping cost is 0.0002 ETH (~Rs 5)");
        emit PingPaid(msg.sender, msg.value);
    }

    function rewardUser(address payable receiver) public {
        require(msg.sender == owner, "Only owner can reward");
        receiver.transfer(0.0001 ether); // Half of fee to user
        emit RewardGiven(receiver, 0.0001 ether);
    }

    receive() external payable {}
}
