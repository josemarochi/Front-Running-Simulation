// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleDEX {
    mapping(address => uint256) public balances;
    uint256 public ethReserve;
    uint256 public tokenReserve;
    address public owner;

    constructor() payable {
        ethReserve = msg.value;
        tokenReserve = 1000000 ether; // Tokens iniciales
        owner = msg.sender;
    }

    function buy() public payable {
        uint256 tokensToBuy = msg.value * tokenReserve / ethReserve;
        require(tokensToBuy <= tokenReserve, "Not enough tokens");

        balances[msg.sender] += tokensToBuy;
        tokenReserve -= tokensToBuy;
        ethReserve += msg.value;
    }

    function sell(uint256 tokenAmount) public {
        require(balances[msg.sender] >= tokenAmount, "Insufficient balance");

        uint256 ethToReturn = tokenAmount * ethReserve / tokenReserve;
        require(address(this).balance >= ethToReturn, "DEX has no ETH");

        balances[msg.sender] -= tokenAmount;
        tokenReserve += tokenAmount;
        ethReserve -= ethToReturn;

        payable(msg.sender).transfer(ethToReturn);
    }

    // Helper for bot to mint tokens
    function mintTokens(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        balances[to] += amount;
        tokenReserve += amount;
    }
}

