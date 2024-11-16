// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { ONFT721 } from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721.sol";
import { OApp, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { IOAppReceiver, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppReceiver.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { ONFT721MsgCodec } from "@layerzerolabs/onft-evm/contracts/onft721/libs/ONFT721MsgCodec.sol";
import { ONFTComposeMsgCodec } from "@layerzerolabs/onft-evm/contracts/libs/ONFTComposeMsgCodec.sol";

contract Gallery is ONFT721 {

    constructor(
        address _lzEndpoint,
        address _delegate
    ) ONFT721("Stake of the Art", "SOTA", _lzEndpoint, _delegate) {
                
    }    

    struct Exhibit {
        address tokenAddress;
        uint256 tokenId;
        string imageUri;
        address rightsHolder;
    }

    event ExhibitCreated(uint256 indexed exhibitId, address indexed owner, string title, string description, string imageUri, uint256 price);

    /**
     * @dev Internal function to handle the receive on the LayerZero endpoint.
     * @param _origin The origin information.
     *  - srcEid: The source chain endpoint ID.
     *  - sender: The sender address from the src chain.
     *  - nonce: The nonce of the LayerZero message.
     * @param _guid The unique identifier for the received LayerZero message.
     * @param _message The encoded message.
     * @dev _executor The address of the executor.
     * @dev _extraData Additional data.
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address /*_executor*/, // @dev unused in the default implementation.
        bytes calldata _extraData // @dev unused in the default implementation.
    ) internal virtual override {
        // Decode into Exhibit
        Exhibit memory exhibit = abi.decode(_extraData, (Exhibit));
        emit ExhibitCreated(exhibit.tokenId, exhibit.rightsHolder, "", "", exhibit.imageUri, 0);
    }
}
