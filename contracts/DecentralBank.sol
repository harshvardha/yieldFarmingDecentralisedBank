// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./Sikka.sol";
import "./RewardToken.sol";

contract DecentralBank {
    string public name = "DECENTRAL BANK"; // name of the bank
    address public owner; // variable to store address of owner of bank
    RewardToken private rwd; // variable to store the reference to RewardToken contract
    Sikka private sikka; // variable to store the reference of Sikka contract

    mapping(address => uint256) public depositorBalance; // mapping to store deposit balance of accounts

    constructor(RewardToken _rwd, Sikka _sikka) {
        owner = msg.sender;
        rwd = _rwd;
        sikka = _sikka;
    }

    // This function is used to deposit tokens into the bank
    function depositTokens(uint256 amount) external {
        require(amount > 0, "Deposit amount should be greater than 0");
        sikka.transferFrom(msg.sender, address(this), amount);
        depositorBalance[msg.sender] += amount;
    }

    // This function is used to issue Reward Tokens to the depositor
    function issueRewardTokens(address recipient) external {
        require(
            msg.sender == owner,
            "Only owner is allowed to issue reward tokens"
        );
        require(
            depositorBalance[recipient] >= 50000000000000000000,
            "Recipient is not qualified for reward tokens"
        );
        uint256 rewardAmount = depositorBalance[recipient] / 9;
        if (rewardAmount > 0) {
            rwd.transfer(recipient, rewardAmount);
        }
    }

    // This function is used to withdraw SIKKA tokens from the bank
    function withdrawTokens() external {
        require(depositorBalance[msg.sender] > 0, "Insufficient Balance");
        uint256 amount = depositorBalance[msg.sender];
        uint256 rewardTokenAmount = amount / 9;
        depositorBalance[msg.sender] = 0;
        rwd.transferFrom(msg.sender, address(this), rewardTokenAmount);
        sikka.transfer(msg.sender, amount);
    }
}
