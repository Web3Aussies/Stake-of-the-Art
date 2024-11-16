// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { ONFT721Adapter } from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Adapter.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Collection is ONFT721Adapter {

    address curator;
    address lzEndpoint;
    address delegate;

    // Store the rights to the NFT
    struct RoyaltyRights {
        uint256 tokenId;
        address owner;
        string signature;
    }

    mapping(uint256 => RoyaltyRights) public rights;

    constructor(
        address _curator,
        address _token,
        address _lzEndpoint,
        address _delegate
    ) ONFT721Adapter(_token, _lzEndpoint, _delegate) {
        curator = _curator;
        lzEndpoint = _lzEndpoint;
        delegate = _delegate;
    }

    function stake(uint256 tokenId) external onlyOwner {
        // Send NFT cross-chain to staking contract on destination chain
        _debit(msg.sender, tokenId, 0);
    }

    function unstake(uint256 tokenId) external onlyOwner {
        // Send NFT cross-chain to staking contract on destination chain
        _credit(msg.sender, tokenId, 0);
    }


    // Handle Royalty Rights
    function setRoyaltyRights(uint256 tokenId, RoyaltyRights memory _rights) public {
        // Store the rights to the NFT
        rights[tokenId] = _rights;
    }

    function setRoyaltyRights(uint256 tokenId, address owner, string memory signature) external {
        // Prevent unauthorized access
        require(IERC721(innerToken).ownerOf(tokenId) == owner, "You don't own this NFT");

        // Store the rights to the NFT
        rights[tokenId] = RoyaltyRights(tokenId, owner, signature);
    }

    function revokeRoyaltyRights(uint256 tokenId) public {
        // Revoke the rights to the NFT
        delete rights[tokenId];
    }

    function revokeRoyaltyRights(uint256 tokenId, address owner) public {
        // Prevent unauthorized access
        require(IERC721(innerToken).ownerOf(tokenId) == owner, "You don't own this NFT");

        // Revoke the rights to the NFT
        delete rights[tokenId];
    }

}
