// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UCOCoin is ERC20, Ownable {
    constructor()
      ERC20("UCO Coin", "UCO")
      Ownable(msg.sender)
    {
        // initial supply if you want
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /// @notice allow owner to mint new tokens
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}