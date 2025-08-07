/**
 * Wallet Balance Component
 * 
 * This component displays the validator's simulated wallet balance and transaction history.
 * It shows earnings from website validations and provides insights into validator activity.
 * 
 * Features:
 * - Real-time balance display
 * - Transaction history
 * - Earnings breakdown
 * - USD value conversion
 * - Network status information
 * - Error handling and loading states
 * 
 * @author Web-Tether Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Wallet, TrendingUp, Activity, RefreshCw, AlertCircle, Coins, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../hooks/use-toast';

/**
 * WalletBalance Component
 * Displays validator wallet information and earnings
 */
export function WalletBalance() {
  // ==================== STATE MANAGEMENT ====================
  
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ==================== HOOKS ====================
  
  const { toast } = useToast();

  // ==================== DATA FETCHING ====================

  /**
   * Fetch wallet balance from API
   * @param {boolean} isRefresh - Whether this is a manual refresh
   */
  const fetchWalletBalance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);

      const balanceData = await api.getWalletBalance();
      setBalance(balanceData);

      // Also fetch recent transactions
      const transactionData = await api.getTransactionHistory();
      setTransactions(transactionData.transactions || []);

      if (isRefresh) {
        toast({
          title: "Balance Updated",
          description: "Your wallet balance has been refreshed successfully.",
        });
      }

    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      setError(error.message);
      
      if (isRefresh) {
        toast({
          title: "Refresh Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle manual refresh button click
   */
  const handleRefresh = () => {
    fetchWalletBalance(true);
  };

  // ==================== EFFECTS ====================

  /**
   * Load wallet data on component mount
   */
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format ETH amount for display
   * @param {number|string} amount - ETH amount
   * @returns {string} Formatted ETH amount
   */
  const formatEthAmount = (amount) => {
    if (!amount) return '0.0000';
    const num = parseFloat(amount);
    return num.toFixed(4);
  };

  /**
   * Format USD amount for display
   * @param {number|string} amount - USD amount
   * @returns {string} Formatted USD amount
   */
  const formatUsdAmount = (amount) => {
    if (!amount) return '$0.00';
    const num = parseFloat(amount);
    return `$${num.toFixed(2)}`;
  };

  /**
   * Calculate earnings statistics
   * @returns {Object} Earnings statistics
   */
  const calculateEarningsStats = () => {
    if (!balance) return { totalEarned: 0, avgPerPing: 0, totalPings: 0 };

    const totalSpent = parseFloat(balance.total_spent || 0);
    const startingBalance = parseFloat(balance.starting_balance || 1);
    const totalEarned = startingBalance - totalSpent; // In this context, "spent" is actually earned
    const totalPings = parseInt(balance.total_pings || 0);
    const avgPerPing = totalPings > 0 ? totalEarned / totalPings : 0;

    return {
      totalEarned: Math.max(0, totalEarned),
      avgPerPing,
      totalPings
    };
  };

  // ==================== RENDER HELPERS ====================

  /**
   * Render loading state
   * @returns {JSX.Element} Loading component
   */
  const renderLoading = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Validator Wallet
        </CardTitle>
        <CardDescription>Loading your earnings...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render error state
   * @returns {JSX.Element} Error component
   */
  const renderError = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Validator Wallet
        </CardTitle>
        <CardDescription>Failed to load wallet information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Wallet</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchWalletBalance()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ==================== MAIN RENDER ====================

  if (loading) return renderLoading();
  if (error && !balance) return renderError();

  const stats = calculateEarningsStats();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Validator Wallet
          </CardTitle>
          <CardDescription>Your earnings from website validations</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="h-6 w-6 text-green-600" />
            <span className="text-3xl font-bold text-green-600">
              {formatEthAmount(balance?.eth_balance)} ETH
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatUsdAmount(balance?.usd_value)}</span>
          </div>
          {balance?.simulated && (
            <Badge variant="outline" className="mt-2">
              Simulated Balance
            </Badge>
          )}
        </div>

        {/* Earnings Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-600">
                {formatEthAmount(stats.totalEarned)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-purple-600">{stats.totalPings}</span>
            </div>
            <p className="text-xs text-muted-foreground">Validations</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-600">
                {formatEthAmount(stats.avgPerPing)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Avg per Ping</p>
          </div>
        </div>

        {/* Wallet Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Wallet Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-mono text-xs">
                {balance?.wallet_address ? 
                  `${balance.wallet_address.slice(0, 6)}...${balance.wallet_address.slice(-4)}` : 
                  'Not set'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Balance:</span>
              <span>{formatEthAmount(balance?.starting_balance)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Validations:</span>
              <span>{balance?.total_pings || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions Preview */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Earnings</h4>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-mono text-xs">{tx.tx_hash}</span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    +{formatEthAmount(tx.amount)} ETH
                  </span>
                </div>
              ))}
              {transactions.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{transactions.length - 3} more transactions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Educational Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Educational Simulation</p>
              <p className="text-yellow-700">
                This wallet shows simulated earnings for educational purposes. 
                In a real deployment, these would be actual cryptocurrency rewards.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
