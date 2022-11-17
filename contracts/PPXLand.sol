// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PPXLand is ERC721 {
    uint256 private _lock = 1;
    uint256 private _id;

    constructor() ERC721("PPXLand", "PPXL") {
        _mint(msg.sender, 0);
        _id++;
    }

    modifier lock() {
        require(_lock == 1, "LOCKED");
        _lock = 2;
        _;
        _lock = 1;
    }

    function mint(address to, uint256 id) external lock {
        _mint(to, id);
        _id++;
    }

    function totalSupply() external view returns (uint256) {
        return _id;
    }
}
