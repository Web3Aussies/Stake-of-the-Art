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
    ) ONFT721("Stake of the Art", "SOTA", _lzEndpoint, _delegate) {}

    struct Enrolment {
        address tokenAddress;
        uint256 tokenId;
        string imageUri;
        address rightsHolder;
    }

    event EnrolmentCreated(address indexed tokenAddress, address indexed rightsHolder, uint256 tokenId, string imageUri, uint256 timestamp);
    uint32 public counter = 0;

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

        counter += 1;
        // Enrolment memory _enrolment = abi.decode(_message, (Enrolment));      

        // Decode into Exhibit
        // Enrolment memory exhibit = abi.decode(_extraData, (Enrolment));How do you like a milky tiger
        // emit EnrolmentCreated(exhibit.tokenAddress, exhibit.rightsHolder, uint32(exhibit.tokenId), exhibit.imageUri, block.timestamp);
        // emit EnrolmentCreated(_enrolment.tokenAddress, _enrolment.rightsHolder, _enrolment.tokenId, _enrolment.imageUri, uint256(block.timestamp));
    }

    function ping() public {
        counter += 1;
    }
}
