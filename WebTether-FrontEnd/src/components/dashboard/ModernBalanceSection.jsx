"use client"

import { useTheme } from "../../contexts/ThemeContext"

const ModernBalanceSection = ({ balance, loading }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const getBalanceData = () => {
    if (loading || !balance) {
      return {
        ethBalance: "...",
        usdValue: "...",
        pendingAmount: "...",
        walletAddress: "...",
      }
    }

    const ethBalance = balance.eth_balance || "0.0000"
    const usdValue = balance.usd_value || "$0.00"
    const totalPings = balance.total_pings || 0
    const walletAddress = balance.wallet_address || "Not connected"

    // Calculate pending based on recent activity (mock calculation)
    const pendingAmount = (Number.parseFloat(ethBalance) * 0.1).toFixed(4)

    return {
      ethBalance,
      usdValue,
      pendingAmount,
      walletAddress: walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4),
      totalPings,
    }
  }

  const balanceData = getBalanceData()

  return (
    <div
      className={`p-6 rounded-2xl backdrop-blur-sm border transition-all ${
        isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
      } ${loading ? "animate-pulse" : ""}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Balance</h3>
        <button
          className={`p-2 rounded-lg transition-all hover:scale-110 ${
            isDark ? "text-blue-300 hover:bg-blue-800/50" : "text-blue-600 hover:bg-blue-100"
          }`}
          disabled={loading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {balanceData.ethBalance} ETH
          </div>
          <div className={`text-sm ${isDark ? "text-blue-300" : "text-blue-600"}`}>≈ {balanceData.usdValue}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Wallet</span>
            <span className={`font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {balanceData.walletAddress}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Pending</span>
            <span className={`font-medium ${isDark ? "text-blue-300" : "text-blue-600"}`}>
              {balanceData.pendingAmount} ETH
            </span>
          </div>

          {balanceData.totalPings !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Total Pings</span>
              <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {balanceData.totalPings}
              </span>
            </div>
          )}
        </div>

        {balance?.simulated && (
          <div
            className={`text-xs px-2 py-1 rounded ${isDark ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-700"}`}
          >
            ⚠️ Simulated balance (demo mode)
          </div>
        )}
      </div>
    </div>
  )
}

export default ModernBalanceSection
