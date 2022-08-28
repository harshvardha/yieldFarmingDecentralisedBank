// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract RewardToken {
    string public name = "REWARD"; // name of the token
    string public symbol = "RWD"; // symbol of the token
    uint256 public totalSupply = 1000000000000000000000000; // 10 Lakh tokens total
    uint8 public decimals = 18; // conversion rate

    // Events to be emitted
    // This event will be emitted when tokens are transferred from one account to another
    event Transfer(address _from, address _to, uint256 _amount);

    // This event will be emitted when spender is approved on behalf of owner to spend from owner account
    event Approve(address _owner, address _spender, uint256 _amount);

    // This mapping is used to store the balance of each account
    mapping(address => uint256) public balanceOf;

    // This mapping is used to store the address of spender with the amount it is allowed to spend on behalf of owner
    mapping(address => mapping(address => uint256)) public approvedToSpend;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    // This function is used to transfer tokens from one account to another
    function transfer(address to, uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient Balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    // This function is used to to transfer tokens from spender on behalf of account owner to another account
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external {
        require(
            approvedToSpend[from][msg.sender] > 0,
            "You are not approved to spend on behalf of this account"
        );
        require(
            approvedToSpend[from][msg.sender] >= amount,
            "Insufficient Balance"
        );
        balanceOf[from] -= amount;
        approvedToSpend[from][msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    // This function is used to approve spender to spend on behalf of owner
    function approve(address spender, uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient Balance");
        approvedToSpend[msg.sender][spender] = amount;
        emit Approve(msg.sender, spender, amount);
    }
}
