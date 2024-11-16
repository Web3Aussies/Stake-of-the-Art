// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { ONFT721 } from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721.sol";
import { OApp, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { IOAppReceiver, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppReceiver.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ONFT721MsgCodec } from "@layerzerolabs/onft-evm/contracts/onft721/libs/ONFT721MsgCodec.sol";
import { ONFTComposeMsgCodec } from "@layerzerolabs/onft-evm/contracts/libs/ONFTComposeMsgCodec.sol";

contract Gallery is ONFT721 {
    constructor(address _lzEndpoint, address _delegate) ONFT721("Stake of the Art", "SOTA", _lzEndpoint, _delegate) {}

    struct Enrolment {
        address tokenAddress;
        uint256 tokenId;
        string metadataUri;
        address rightsHolder;
        bool created;
    }

    uint256 private counter = 0;
    mapping(uint256 => Enrolment) private gallery;
    mapping(bytes32 => uint256) private enrolmentId;

    event EnrolmentCreated(
        address indexed tokenAddress,
        address indexed rightsHolder,
        uint256 indexed tokenId,
        string metadataUri,
        uint256 timestamp
    );

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
        Enrolment memory _enrolment = abi.decode(_message, (Enrolment));
        emit EnrolmentCreated(
            _enrolment.tokenAddress,
            _enrolment.rightsHolder,
            _enrolment.tokenId,
            _enrolment.metadataUri,
            uint256(block.timestamp)
        );

        if (_enrolment.created) {
            enrol(_enrolment, _origin.srcEid);
        } else {
            disenrol(_enrolment, _origin.srcEid);
        }
    }

    function enrol(Enrolment memory _enrolment, uint32 _srcEid) internal {
        _credit(_enrolment.rightsHolder, counter, _srcEid);
        bytes32 key = getEnrolmentKey(_enrolment);
        gallery[counter] = _enrolment;
        enrolmentId[key] = counter;
        counter += 1;
    }

    function disenrol(Enrolment memory _enrolment, uint32 _srcEid) internal {
        uint256 _tokenId = enrolmentId[getEnrolmentKey(_enrolment)];
        _debit(_enrolment.rightsHolder, _tokenId, _srcEid);
    }

    function getEnrolmentKey(Enrolment memory _enrolment) internal pure returns (bytes32) {
        return keccak256(abi.encode(_enrolment));
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return gallery[tokenId].metadataUri;
    }
}
