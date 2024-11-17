require('dotenv').config()
console.log("Creating Attestation");

const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");
const { encodeAbiParameters } = require("viem");

// Congifurable parameters
const rightsHolder = process.env.PUBLIC_KEY
const schemaId = 0xa9;
const tokenAddress = process.env.TOKEN_ADDRESS;

// Set up Wallet
const privateKey = process.env.PRIVATE_KEY;
const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.polygonAmoy,
  account: privateKeyToAccount(privateKey), // Optional, depending on environment
});

// Create attestation
const attest = async ({
  tokenAddress,
  tokenId,
  rightsHolder,
  worldIDSignature,
  validUntil // Math.floor(Date.now() / 1000) + 300 UNIX Time in seconds
}) => {

  // Data for
  const encodedData = encodeAbiParameters(
    [
      { name: 'tokenAddress', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'owner', type: 'address' },
      { name: 'signature', type: 'string' }
    ],
    [
      tokenAddress,
      tokenId,
      rightsHolder,
      worldIDSignature
    ]
  );

  try {
    const res = await client.createAttestation(
      attestation = {
        schemaId: schemaId,
        data: {
          tokenAddress: tokenAddress,
          tokenId: tokenId,
          rightsHolder: rightsHolder,
          worldIDSignature: worldIDSignature
        },
        validUntil: validUntil,
        indexingValue: rightsHolder,
        recipients: [rightsHolder]
      },
      options = {
        extraData: encodedData
      }
    );

    console.log(res);
  } catch (error) {
    console.log(error);
  }
}

attest(
  tokenAddress,
  0,
  rightsHolder,
  worldIDSignature = "0x1234",
  validUntil = Math.floor(Date.now() / 1000) + 300
)