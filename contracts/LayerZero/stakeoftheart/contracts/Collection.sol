// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { ONFT721Adapter } from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Adapter.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Collection is ONFT721Adapter {

    constructor(
        address _token,
        address _lzEndpoint,
        address _delegate
    ) ONFT721Adapter(_token, _lzEndpoint, _delegate) {}

    // Lock the token
    function stake(uint256 tokenId) external onlyOwner {        
        _debit(msg.sender, tokenId, 0);
    }

    // Release the token
    function unstake(uint256 tokenId) external onlyOwner {        
        _credit(msg.sender, tokenId, 0);
    }
    
}
