// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Collection } from "./Collection.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { IOAppReceiver, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppReceiver.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Curator is OApp {
    address public galleryAddress;
    address public lzEndpoint;
    address public curatorDelegate;

    mapping(address => address) public collections;

    modifier ownsNFT(address tokenAddress, uint256 tokenId) {
        require(IERC721(tokenAddress).ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        _;
    }

    modifier collectionSupported(address tokenAddress) {
        require(collections[tokenAddress] != address(0), "Collection does not exist");
        _;
    }

    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    function createCollection(address tokenAddress) public onlyOwner {
        require(collections[tokenAddress] == address(0), "Collection already exists");
        Collection child = new Collection(tokenAddress, lzEndpoint, curatorDelegate);
        collections[tokenAddress] = address(child);
    }

    function stake(
        address tokenAddress,
        uint256 tokenId
    ) public ownsNFT(tokenAddress, tokenId) collectionSupported(tokenAddress) {
        Collection(collections[tokenAddress]).stake(tokenId);
    }

    function unstake(
        address tokenAddress,
        uint256 tokenId
    ) public ownsNFT(tokenAddress, tokenId) collectionSupported(tokenAddress) {
        Collection(collections[tokenAddress]).unstake(tokenId);
    }

    function send(
        uint32 _dstEid,
        string memory _message,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory _payload = abi.encode(_message);
        receipt = _lzSend(_dstEid, _payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));
    }

    function quote(
        uint32 _dstEid,
        string memory _message,
        bytes memory _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory payload = abi.encode(_message);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata payload,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {}
}
