// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { ONFT721Adapter } from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Adapter.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";
import { MessagingFee, MessagingReceipt } from "@layerzerolabs/oft-evm/contracts/OFTCore.sol";

contract Collection is ONFT721Adapter {
    using OptionsBuilder for bytes;

    address tokenAddress;
    address curator;
    address lzEndpoint;
    address delegate;
    uint32 galleryEid;

    // Store the rights to the NFT
    struct RoyaltyRights {
        uint256 tokenId;
        address owner;
        string signature;
    }

    mapping(uint256 => RoyaltyRights) public rights;

    constructor(
        uint32 _galleryEid,
        address _galleryAddress,
        address _curator,
        address _token,
        address _lzEndpoint,
        address _delegate
    ) ONFT721Adapter(_token, _lzEndpoint, _delegate) {
        setPeer(_galleryEid, addressToBytes32(_galleryAddress));
        tokenAddress = _token;
        galleryEid = _galleryEid;
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

    // Send a message to the gallery Notifying of the enrollment
    struct Enrolment {
        address tokenAddress;
        uint256 tokenId;
    }

    function quoteEnrolment(uint256 tokenId) public view returns (MessagingFee memory) {
        // Notify the gallery of the enrollment
        bytes memory message = abi.encode(Enrolment(tokenAddress, tokenId));

        bytes memory options = OptionsBuilder
            .newOptions()
            .addExecutorLzReceiveOption(200000, 0)
            .addExecutorLzComposeOption(0, 500000, 0);

        // Get quote
        return _quote(galleryEid, message, options, false);
    }

    function notifyEnrollment(uint256 tokenId) public payable{
        // Notify the gallery of the enrollment
        bytes memory message = abi.encode(Enrolment(tokenAddress, tokenId));

        bytes memory options = OptionsBuilder
            .newOptions()
            .addExecutorLzReceiveOption(200000, 0)
            .addExecutorLzComposeOption(0, 500000, 0);

        _lzSend(galleryEid, message, options, MessagingFee(msg.value, 0),msg.sender);                
    }

    function addressToBytes32(address _addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }
}
