/**
 * Simulated Ping Button Component
 * 
 * This component allows validators to simulate pinging websites and earning rewards.
 * It provides an educational interface for testing the Web-Tether validation system
 * without requiring real blockchain transactions.
 * 
 * Features:
 * - Transaction code selection from predefined list
 * - Real website pinging through Cloudflare Workers
 * - Reward simulation and tracking
 * - Detailed result display with metrics
 * - Error handling and user feedback
 * 
 * @author Web-Tether Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TestTube, Zap, Clock, Globe, AlertCircle, Coins, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

// Predefined validator transaction codes for simulation
const VALIDATOR_TX_CODES = Array.from({ length: 20 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  return `TX-${num}`;
});

/**
 * SimulatedPingButton Component
 * Provides interface for validators to simulate website pings and earn rewards
 */
export function SimulatedPingButton({ wid, url, toast, onPingComplete }) {
  // ==================== STATE MANAGEMENT ====================
  
  const [selectedTxCode, setSelectedTxCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // ==================== VALIDATION FUNCTIONS ====================

  /**
   * Validate selected transaction code
   * @param {string} txCode - Selected transaction code
   * @returns {Object} Validation result
   */
  const validateTransactionCode = (txCode) => {
    if (!txCode) {
      return { isValid: false, error: "Please select a transaction code" };
    }

    if (!VALIDATOR_TX_CODES.includes(txCode)) {
      return { isValid: false, error: "Invalid transaction code selected" };
    }

    return { isValid: true, error: "" };
  }

  /**
   * Validate website parameters
   * @param {number} wid - Website ID
   * @param {string} url - Website URL
   * @returns {Object} Validation result
   */
  const validateWebsiteParams = (wid, url) => {
    if (!wid || !url) {
      return { isValid: false, error: "Missing website information" };
    }

    if (typeof wid !== 'number' || wid <= 0) {
      return { isValid: false, error: "Invalid website ID" };
    }

    try {
      new URL(url);
      return { isValid: true, error: "" };
    } catch {
      return { isValid: false, error: "Invalid website URL" };
    }
  }

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle transaction code selection
   * @param {Event} e - Select change event
   */
  const handleTxCodeChange = (e) => {
    const newCode = e.target.value;
    setSelectedTxCode(newCode);
    
    // Clear previous result when changing codes
    if (lastResult && lastResult.tx_hash !== newCode) {
      setLastResult(null);
    }
  }

  /**
   * Handle simulated ping submission
   * Validates inputs, calls API, and handles response
   */
  const handleSimulatePing = async () => {
    // Validate transaction code
    const txValidation = validateTransactionCode(selectedTxCode);
    if (!txValidation.isValid) {
      toast({
        title: "Transaction Code Required",
        description: txValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Validate website parameters
    const websiteValidation = validateWebsiteParams(wid, url);
    if (!websiteValidation.isValid) {
      toast({
        title: "Invalid Website",
        description: websiteValidation.error,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Show initial feedback
      toast({
        title: "Processing Validation",
        description: `Pinging ${url} with transaction ${selectedTxCode}...`,
      });

      // Submit ping to backend
      const result = await api.manualPing({
        wid,
        url,
        tx_hash: selectedTxCode
      });

      setLastResult(result);
      
      // Process and display results
      if (result.status === "recorded" && result.result) {
        const { is_up, latency_ms, region } = result.result;
        const rewardEarned = 0.0001; // Standard validator reward

        // Show success toast with detailed information
        toast({
          title: is_up ? "🟢 Site is UP! Reward Earned!" : "🔴 Site is DOWN - Reward Earned!",
          description: (
            <div className="space-y-1">
              <p><strong>URL:</strong> {url}</p>
              <p><strong>Status:</strong> {is_up ? "Online" : "Offline"}</p>
              <p><strong>Response Time:</strong> {latency_ms}ms</p>
              <p><strong>Region:</strong> {region}</p>
              <p><strong>💰 Reward:</strong> +{rewardEarned} ETH</p>
              <p><strong>🎯 Points:</strong> +5 points</p>
              <p><strong>TX:</strong> {selectedTxCode}</p>
            </div>
          ),
          variant: "default", // Always positive since validator earns money
        });
      } else {
        // Fallback success message
        toast({
          title: "Validation Completed - Reward Earned!",
          description: `Successfully validated ${url} and earned 0.0001 ETH with transaction ${selectedTxCode}`,
        });
      }

      // Trigger data refresh
      if (onPingComplete) {
        onPingComplete();
      }

      // Reset selection after successful ping
      setSelectedTxCode('');

    } catch (error) {
      console.error('Validation ping failed:', error);
      
      // Show user-friendly error message
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER HELPERS ====================

  /**
   * Render the last validation result
   * @returns {JSX.Element|null} Result display component
   */
  const renderLastResult = () => {
    if (!lastResult) return null;

    const { result, onchain } = lastResult;
    const isUp = result?.is_up;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-2">
          <Coins className="h-4 w-4" />
          <span>Last Validation Result</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <div className="flex items-center gap-1">
              {isUp ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <Badge variant={isUp ? "default" : "destructive"}>
                {isUp ? "UP" : "DOWN"}
              </Badge>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reward Earned:</span>
            <span className="font-mono text-green-600 font-semibold">+0.0001 ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Response Time:</span>
            <span className="font-mono">{result?.latency_ms || 'N/A'}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Region:</span>
            <span className="font-mono">{result?.region || 'unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TX Code:</span>
            <span className="font-mono text-xs">{onchain?.tx_hash || selectedTxCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gas Used:</span>
            <span className="font-mono text-xs">{onchain?.gas_used || 'N/A'}</span>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="space-y-4">
      {/* Validator Reward Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-800 text-sm">
          <Coins className="h-4 w-4" />
          <span className="font-medium">💰 Earn Rewards as Validator</span>
        </div>
        <p className="text-green-700 text-xs mt-1">
          You earn 0.0001 ETH + 5 points for each website you validate! Rewards are earned regardless of site status.
        </p>
      </div>

      {/* Transaction Code Selection */}
      <div className="space-y-2">
        <label htmlFor="tx-code" className="block text-sm font-medium text-gray-700">
          Select Validator Transaction Code
        </label>
        <select 
          id="tx-code"
          value={selectedTxCode} 
          onChange={handleTxCodeChange}
          className="w-full p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value="">-- Select a transaction code to earn rewards --</option>
          {VALIDATOR_TX_CODES.map(code => (
            <option key={code} value={code}>
              {code} (Earn 0.0001 ETH)
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Each code can only be used once. Select a code to simulate earning validator rewards.
        </p>
      </div>

      {/* Validate Button */}
      <Button 
        onClick={handleSimulatePing}
        disabled={!selectedTxCode || isLoading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Validating & Earning...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Validate Website & Earn 0.0001 ETH</span>
          </div>
        )}
      </Button>

      {/* Last Result Display */}
      {renderLastResult()}

      {/* Educational Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">How Validator Rewards Work:</p>
            <ul className="text-blue-700 text-xs mt-1 space-y-1">
              <li>• Website owners add sites to our monitoring network</li>
              <li>• You earn 0.0001 ETH for each validation ping you perform</li>
              <li>• Earn rewards whether the site is up or down</li>
              <li>• Build reputation and earn more through consistent validations</li>
              <li>• All transactions are simulated for educational purposes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <TestTube className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-gray-800">🧪 Simulation Details:</p>
            <ul className="text-gray-700 text-xs mt-1 space-y-1">
              <li>• Uses fake transaction codes (TX-001 to TX-020)</li>
              <li>• Performs real HTTP requests to validate websites</li>
              <li>• Simulates blockchain rewards without real cryptocurrency</li>
              <li>• Connected to Hardhat local development network</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
