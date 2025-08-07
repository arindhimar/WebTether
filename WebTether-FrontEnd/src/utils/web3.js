// Utility functions for Web3 operations (now simplified for simulation)

/**
 * Format ETH amount for display
 * @param {number|string} amount - Amount in ETH
 * @returns {string} Formatted amount
 */
export function formatEthAmount(amount) {
  if (!amount) return '0.0000';
  return parseFloat(amount).toFixed(4);
}

/**
 * Format transaction hash for display
 * @param {string} txHash - Transaction hash
 * @returns {string} Shortened hash
 */
export function formatTxHash(txHash) {
  if (!txHash) return '';
  if (txHash.length <= 10) return txHash;
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}

/**
 * Validate if a string looks like a transaction hash
 * @param {string} hash - Hash to validate
 * @returns {boolean} Is valid format
 */
export function isValidTxHash(hash) {
  if (!hash) return false;
  // For our fake TX codes, accept TX-XXX format
  if (hash.match(/^TX-\d{3}$/)) return true;
  // For real tx hashes, check hex format
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Generate a fake transaction hash for testing
 * @returns {string} Fake transaction hash
 */
export function generateFakeTxHash() {
  const randomNum = Math.floor(Math.random() * 999) + 1;
  return `TX-${String(randomNum).padStart(3, '0')}`;
}

/**
 * Get network configuration for local Hardhat
 * @returns {Object} Network config
 */
export function getNetworkConfig() {
  return {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: null,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  };
}

/**
 * Format timestamp for display
 * @param {string|number} timestamp - Unix timestamp or ISO string
 * @returns {string} Formatted date
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Calculate estimated gas cost
 * @param {number} gasUsed - Gas used
 * @param {number} gasPrice - Gas price in wei
 * @returns {string} Cost in ETH
 */
export function calculateGasCost(gasUsed, gasPrice) {
  if (!gasUsed || !gasPrice) return '0.0000';
  
  const costWei = gasUsed * gasPrice;
  const costEth = costWei / Math.pow(10, 18);
  return costEth.toFixed(6);
}

/**
 * Get status color for transaction status
 * @param {string} status - Transaction status
 * @returns {string} Tailwind color class
 */
export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'confirmed':
      return 'text-green-600';
    case 'failed':
    case 'error':
      return 'text-red-600';
    case 'pending':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Simulate network delay for testing
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export function simulateNetworkDelay(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
