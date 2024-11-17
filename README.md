# Stake of the Art (SOTA)

Default NFT contract deployed to Polygon Amoy
0xA9215c559ea256508D61e37A543ED79A5b287CEb
https://amoy.polygonscan.com/address/0x9e1f2c3432ddce2aae0f605f38e3234ee6fbc91a


Deployed NFT Collection ONFTAdapter on Amoy
0x73D915D9a64318714ca1D97f65475387240C06AF


Official Schema
{
  schemaId: '0xa9',
  txHash: '0x9d291652245b812a74972453ba3b26e12d409e2470018e2331ccbc55b771b058'
}


## Overview

Hello! This is **Stake of the Art**.
It is an ecosystem where artists can stake their artwork and earn royalties for every time someone uses it.

| | |
| --- | --- |
| ![The promise](readme_img/concept_staking.png) | ![The rights](readme_img/concept_rights.png) |

---

The partner technologies we found most helpful to building our project are:
- [**XMTP**](#xmtp)
- [**Filecoin**](#filecoin)
- [**World Coin**](#world-coin)
- [**Layer Zero**](#layer-zero)
- [**Sign Protocol**](#sign-protocol)

_These links go directly to the partner technology breakdown_

---


## Partner Technology breakdown

### XMTP
### Filecoin
### World Coin
### Layer Zero
Layer Zero gives us the power to integrate NFTS from every single chain they support.
This is a huge advantage artists are not tied to the one single chain where they had deployed the NFT's for their artwork.
The more artists we can include in the ecosystem the stronger we become.



|  |  |
| --- | --- |
| ![Collection](readme_img/lz_meet_collection.png) | ![Curator](readme_img/lz_meet_curator.png) | 
| ![Gallery](readme_img/lz_meet_gallery.png) | ![Cashier](readme_img/lz_meet_cashier.png) |


Now that you've met the contracts and know what they're about, let's see how they work together.

**Staking**
![Staking](readme_img/lz_sequence_staking.png)

For an artist, this is their first entry point into our ecosystem.

They first approve the Collection contract to make a transfer of their NFT to itself.
Then they call the `stake` function to lock their NFT.

Layer Zero has an `ONFT721Adapter` that wraps around any nft contract so our ecosystem can support any NFT Contract are the artist may find their artwork deployed to.

Now when the artist stakes their NFT it is not sufficient enough for us to simply trust that these NFTs belong to them. We need to verify that they are the rightful beneficiaries of the artworks royalties.

We can validate this by requiring proof royalty rights in the form of a Sign Protocol attestation. The attestation is a digital representation defining who has the right to claim royalties on the artwork.

This is interesting because it gives the artist the ability to directly transfer these rights to someone else. This is a powerful feature because it allows the artist to sell their artwork and the royalties that come with it.

Finally, when these two conditions are met they are able to enrol into the gallery and start earning royalties.
The gallery itself is an `ONFT721` contract which is a normal ERC721 contract with Cross-Chain messaging. This means we can utilise its mint function to create an NFT representing the enrollment.

The gallery then keeps a record of these minted NFTs for any users of the ecosystem apps to query and pay for.

> As a nice extra feature, We have created a default ERC721 contract to support artists who have artwork but have not yet deployed it to a chain. This allows them to quickly stake their artwork and start earning royalties without having to deploy it to a chain.


**Unstaking**

![Unstaking](readme_img/lz_sequence_unstaking.png)

When the artist wants to unstake their NFT they call the `unstake` function on the Collection contract.

Just like the staking function, it triggers a message to the gallery contract. However, in this case, we are burning the gallery NFT since the artist is no longer eligible for royalties.


**Revoking**

![Revoking](readme_img/lz_sequence_revoking.png)

If the artist wants to revoke the rights to their royalties they can call the `revoke` function on the Collection contract.

This will also trigger a message with the gallery contract to burn the NFT representing the enrollment.


**Claiming**

![Claiming](readme_img/lz_sequence_claiming.png)

When a user wants to claim the royalties they have earned they call the `claim` function on the Curator contract.

The curator contract will then signal the cashier contract to make a payment to the user.

We didn't have time to implement this feature more fully. however the ability to send native tokens from one chain to another gives the artist the chance to receive royalties in their native currency.


#### Implementation

To show you that the contracts are live and working on the blockchain, here are the links to their deployment.




---



### Sign Protocol

| The Multishare Problem | Store and Share | Distribution |
| --- | --- | --- |
| ![Multishare](/readme_img/readme_multishare.png) | ![Store and Share](/readme_img/readme_store_share.png) | ![Distribution](/readme_img/readme_distribution.png) |

## A Typical SignCast Share Scenario

Alice wants to share her exclusive masterclass tutorial with Bob for a month.

### Storage
- On her device, Alice encrypts the video and uploads it to SignCast
- SignCast generates a document id for the file and stores it in the database
- Alice uploads her encrypted video to SignCast

### Issue
- Bob gives Alice his email to request access to the masterclass.
- Alice asks the server to resolve the email to a public key.
- Alice uses the public key and her own private key to create a new transformation key.
- Alice passes the document id, the transformation key, and Bob's email to the server to create an attestation on the chain.

### Access
- Whenever Bob wants to fetch the document, Bob retrieves the attestation from the chain
- Bob presents the attestation as an access pass to the SignCast server for verification
- The server validates Bob's access and fetches the encrypted content from IPFS through Basin S3
- The server re-encrypts the content with Bob's public key and delivers it to Bob
- Bob decrypts the content using his private key on his device and enjoys the masterclass

| ![Store](/readme_img/readme_tech_store.png) | ![Issue](/readme_img/readme_tech_issue.png) | ![Issue](/readme_img/readme_tech_access.png) |
| --- | --- | --- |
| **Store:** Alice uploads her video to SignCast | **Issue:** Alice creates a pass for Bob to access her video | **Access:** Bob presents the pass to access the video to the server |

## Table of Contents
1. [Features](#features)
2. [The Problem](#the-problem)
3. [Trustless Time-Based Access Control](#trustless-time-based-access-control)
    - [Store and Share](#store-and-share)
    - [Distribution](#distribution)
4. [System Architecture](#system-architecture)
    - [Attestation-Based Access Control](#attestation-based-access-control)
    - [Content Storage and Security with Basin S3](#content-storage-and-security-with-basin-s3)
    - [Proxy Re-Encryption for Secure Content Delivery](#proxy-re-encryption-for-secure-content-delivery)
    - [Client-Side Encryption and Decryption](#client-side-encryption-and-decryption)
5. [Component Breakdown of SignCast](#component-breakdown-of-SignCast)

## Features

- **Decentralized Access Control:** 
    - Uses Sign Protocol attestations as passes to securely access exclusive content.
- **Encrypted Content Storage:** 
    - Store encrypted files securely using Basin S3, ensuring no unauthorized consumption.
- **Zero-Knowledge Server Operations:** 
    - Our servers never handle unencrypted data or know the contents of your documents.
- **Proxy Re-Encryption:** 
    - Securely re-encrypt content for delivery, ensuring it can only be decrypted by the intended recipient.
- **Client-Side Security:** 
    - All encryption and decryption operations are performed on the user's device, guaranteeing privacy.

## The Problem

Typical access control requires a lot of overhead to set up.
This involves:
- granting access
- encryption
- delivery

Managing temporary access to your files while sharing with multiple people presents a big challenge when you try to scale.
- Redundant files are created even if they're never accessed
- Manual process to encrypt and share files
- Replay attacks are possible for simple access control systems 

## Trustless Time-Based Access Control

To solve for these issues, we've created a trustless time-based access control system.
- Files are encrypted on device and sent to our servers for storage
- Sharers create a time-based access control passes to share their files with others
- Consumers present their passes to access the content

## System Architecture

### Attestation-Based Access Control

**SignCast** uses Sign Protocol's attestations as passes to control access to content. Here’s how it works:

- **Issue Access passes:**
  - Content owners issue unique attestations to consumers, granting them access to specific content for a predetermined time.
- **Pass Verification:**
  -Consumers present their attestation to SignCast's servers. The server verifies the pass by checking ownership and expiry details, ensuring that only authorized users can access the content.

### Content Storage and Security with Basin S3

- **Encrypted Storage:** 
  - All files are encrypted by the content creator and stored securely using Basin S3. Content Identifiers (CIDs) are stored in a secure directory on SignCast’s servers, preventing unauthorized access.
- **Secure Directory Management:** 
  - CIDs are protected on the server side, adding an extra layer of security and ensuring that content can only be retrieved with a valid attestation. The CIDs are not stored on the attestation itself since attestations are public. Doing so would expose the content to unauthorized access.

### Proxy Re-Encryption for Secure Content Delivery

- **No Plain Text Handling:**
  - Content is uploaded to SignCast fully encrypted by the creator, ensuring that our servers never see plain text files.
- **Transformation Key Integration:** 
  - A transformation key, tailored to the consumer’s public key, is included in the attestation, allowing the server to re-encrypt content specifically for the consumer.
- **Re-Encryption Process:**
  - Upon receiving a valid attestation, the server re-encrypts the content and delivers it to the consumer, who can decrypt it using their private key.

### Client-Side Encryption and Decryption

- **Custom Wallet Creation:**
  - Content creators and consumers create custom wallets via the SignCast client app. These wallets securely store private keys used for encryption and decryption.
- **On-Device Security:**
  - All encryption and decryption processes occur on the user's device, ensuring no sensitive data is transmitted over the network.

### Smart Contract Escrow
- **Schema Hooks**
  - Release subscription payments to content creators
  - Safely manage subscriber's payments.
