// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Sikka {
    string public name = "Sikka"; // name of the native token
    string public symbol = "SIKKA"; // symbol of the native token
    uint256 public totalSupply = 1000000000000000000000000; // 10 Lakh tokens
    uint8 public decimals = 18;

    // Events to be emitted

    // Transfer event is emitted when transfer of tokens is done from one account to another
    event Transfer(address _from, address _to, uint256 _amount);

    // Apprive event is emitted when spender is approved on behalf of owner to spend _amount of tokens
    event Approved(address _owner, address _spender, uint256 _amount);

    // This mapping is used to store the SIKKA balance of the address
    mapping(address => uint256) public balanceOf;

    // This mapping is used to store the address of spender with the amount it is allowed to spend on behalf of owner
    mapping(address => mapping(address => uint256)) public approveToSpend;

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

    // This function is used to transfer tokens from account which is approved to spend on behalf of another account
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external {
        require(
            approveToSpend[from][msg.sender] >= amount,
            "Insufficient balance"
        );
        balanceOf[from] -= amount;
        approveToSpend[from][msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    // This function is used to approve the spender to spend on behalf of the owner
    function approve(address spender, uint256 amount) external {
        require(
            balanceOf[msg.sender] >= amount,
            "Insufficient Balance to be approved"
        );
        approveToSpend[msg.sender][spender] = amount;
        emit Approved(msg.sender, spender, amount);
    }
}
