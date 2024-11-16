export default function getCurrentEpoch(): number {
    // Epoch duration in seconds (Filecoin uses 30-second epochs)
    const EPOCH_DURATION = 30;

    // Genesis timestamp of the calibration testnet in UTC seconds
    // Replace this with the actual genesis timestamp
    const GENESIS_TIMESTAMP = 1667326380; // Example timestamp

    // Current UTC time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Calculate the current epoch
    const currentEpoch = Math.floor((currentTime - GENESIS_TIMESTAMP) / EPOCH_DURATION);

    return currentEpoch;
}