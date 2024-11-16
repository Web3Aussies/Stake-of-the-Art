// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Mock imports
import { Collection } from "../../contracts/Collection.sol";
import { Gallery } from "../../contracts/Gallery.sol";

// OApp imports
import { IOAppOptionsType3, EnforcedOptionParam } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";

// OFT imports
import { IOFT, SendParam, OFTReceipt } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import { MessagingFee, MessagingReceipt } from "@layerzerolabs/oft-evm/contracts/OFTCore.sol";
import { OFTMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTMsgCodec.sol";
import { OFTComposeMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTComposeMsgCodec.sol";

// OZ imports
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

// Forge imports
import "forge-std/console.sol";

// DevTools imports
import { TestHelperOz5 } from "@layerzerolabs/test-devtools-evm-foundry/contracts/TestHelperOz5.sol";

contract TestCommunications is TestHelperOz5 {
    using OptionsBuilder for bytes;

    uint32 private galleryEid = 1;
    uint32 private collectionEid = 2;

    Gallery private gallery;
    Collection private collection;

    address private userA = makeAddr("userA");
    address private userB = makeAddr("userB");
    address private curatorAddress = makeAddr("curatorAddress");
    address private tokenAddress = makeAddr("tokenAddress");
    uint256 private initialBalance = 100 ether;

    function setUp() public virtual override {
        vm.deal(userA, 1000 ether);

        super.setUp();
        setUpEndpoints(2, LibraryType.UltraLightNode);

        gallery = Gallery(_deployOApp(type(Gallery).creationCode, abi.encode(address(endpoints[galleryEid]), address(this))));

        // print address(gallery);
        console.log("Gallery address: %s", address(gallery));

        // collection = Collection(
        //     _deployOApp(
        //         type(Collection).creationCode,
        //         abi.encode(
        //             galleryEid,
        //             address(gallery),
        //             address(collection),
        //             address(collection),
        //             address(endpoints[collectionEid]),
        //             address(this)
        //         )
        //     )
        // );

        collection = Collection(
            _deployOApp(
                type(Collection).creationCode,
                abi.encode(
                    // galleryEid,
                    // address(gallery),
                    curatorAddress,
                    tokenAddress,
                    address(endpoints[collectionEid]),
                    address(this)
                )
            )
        );

        address[] memory oapps = new address[](2);
        oapps[0] = address(gallery);
        oapps[1] = address(collection);
        this.wireOApps(oapps);
    }

    function test_constructor() public {
        assertEq(gallery.owner(), address(this));
        assertEq(collection.owner(), address(this));        
    }

    // function test_send_oft() public {
    //     uint256 tokensToSend = 1 ether;
    //     bytes memory options = OptionsBuilder.newOptions().addExecutorLzReceiveOption(200000, 0);
    //     SendParam memory sendParam = SendParam(
    //         collectionEid,
    //         addressToBytes32(userB),
    //         tokensToSend,
    //         tokensToSend,
    //         options,
    //         "",
    //         ""
    //     );
    //     MessagingFee memory fee = gallery.quoteSend(sendParam, false);

    //     assertEq(gallery.balanceOf(userA), initialBalance);
    //     assertEq(collection.balanceOf(userB), initialBalance);

    //     vm.prank(userA);
    //     gallery.send{ value: fee.nativeFee }(sendParam, fee, payable(address(this)));
    //     verifyPackets(collectionEid, addressToBytes32(address(collection)));

    //     assertEq(gallery.balanceOf(userA), initialBalance - tokensToSend);
    //     assertEq(collection.balanceOf(userB), initialBalance + tokensToSend);
    // }

    function test_notify() public {
        // bytes memory options = OptionsBuilder
        //     .newOptions()
        //     .addExecutorLzReceiveOption(200000, 0)
        //     .addExecutorLzComposeOption(0, 500000, 0);

        // bytes memory composeMsg = hex"1234";
        // SendParam memory sendParam = SendParam(
        //     collectionEid,
        //     addressToBytes32(address(composer)),
        //     tokensToSend,
        //     tokensToSend,
        //     options,
        //     composeMsg,
        //     ""
        // );
        vm.prank(userA);

        bytes32 peer = collection.checkPeer(galleryEid);
        address peerAddr = bytes32ToAddress(peer);
        console.log("Peer address: %s", peerAddr);        

        MessagingFee memory fee = collection.quoteEnrolment(galleryEid, 1);

        // assertEq(gallery.balanceOf(userA), initialBalance);
        // assertEq(collection.balanceOf(address(composer)), 0);

        // console.log("Counter", gallery.counter());
        collection.notifyEnrolment{ value: fee.nativeFee }(galleryEid, 1);
        vm.warp(block.timestamp + 1 minutes);
        // console.log("Counter", gallery.counter());

        // gallery.ping();
        // console.log("Counter", gallery.counter());

        // assertEq(gallery.data(), abi.encode("Nothing received yet."));
        // console.log("Peer address: %s", abi.decode(gallery.data(), (address)));
        // verifyPackets(collectionEid, addressToBytes32(address(collection)));

        // // lzCompose params
        // uint32 dstEid_ = collectionEid;
        // address from_ = address(collection);
        // bytes memory options_ = options;
        // bytes32 guid_ = msgReceipt.guid;
        // address to_ = address(composer);
        // bytes memory composerMsg_ = OFTComposeMsgCodec.encode(
        //     msgReceipt.nonce,
        //     galleryEid,
        //     oftReceipt.amountReceivedLD,
        //     abi.encodePacked(addressToBytes32(userA), composeMsg)
        // );
        // this.lzCompose(dstEid_, from_, options_, guid_, to_, composerMsg_);

        // assertEq(gallery.balanceOf(userA), initialBalance - tokensToSend);
        // assertEq(collection.balanceOf(address(composer)), tokensToSend);

        // assertEq(composer.from(), from_);
        // assertEq(composer.guid(), guid_);
        // assertEq(composer.message(), composerMsg_);
        // assertEq(composer.executor(), address(this));
        // assertEq(composer.extraData(), composerMsg_); // default to setting the extraData to the message as well to test
    }

    function bytes32ToAddress(bytes32 _b) internal pure returns (address) {
        return address(uint160(uint256(_b)));
    }
}
