using System.Numerics;
using System.Text;
using Nethereum.Util;

namespace StakingArt.Infrastructure.WorldCoin;

public record HashResult(BigInteger Hash, string Digest);

public class HashUtil
{
    static readonly Sha3Keccack Keccak = new Sha3Keccack();

    public HashResult HashString(string input)
    {
        // this function is direct port from:
        // https://github.com/worldcoin/idkit-js/blob/a160c13580a35f9657f20befd0e466b2ea5c96e5/packages/core/src/lib/hashing.ts


        var inputBytes = Encoding.UTF8.GetBytes(input);

        // Compute Keccak256 hash
        var hashBytes = Keccak.CalculateHash(inputBytes);

        // Convert hash bytes (big endian) to BigInteger (little endian)
        var hashBytesReversed = hashBytes.Reverse().ToArray();

        // Append a 0 byte to ensure the number is positive
        var hashBytesWithZero = hashBytesReversed.Concat(new byte[] { 0 }).ToArray();

        // Create BigInteger from byte array
        var hash = new BigInteger(hashBytesWithZero);

        // Shift right by 8 bits (equivalent to dividing by 256)
        var shiftedHash = hash >> 8;

        // Convert shifted hash to hexadecimal string without "0x" prefix
        var rawDigest = shiftedHash.ToString("x");

        // Pad the digest with leading zeros to ensure it is 64 characters long
        var paddedDigest = rawDigest.PadLeft(64, '0');

        // Prefix the digest with "0x"
        var digest = "0x" + paddedDigest;

        return new HashResult(shiftedHash, digest);
    }
}
