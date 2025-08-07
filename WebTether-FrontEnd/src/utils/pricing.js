// Pricing utilities for USDC fee calculation
export class PricingService {
  constructor(apiService) {
    this.api = apiService
  }

  async fetchPriceData(token = 'USDC') {
    try {
      const response = await this.api.request(`/api/price?token=${token}`)
      return response
    } catch (error) {
      console.error("Failed to fetch price data:", error)
      throw new Error("Failed to fetch current prices. Please try again.")
    }
  }

  calculateUSDCFee(inrAmount, usdPerInr, usdcUsdPrice, slippagePercent = 2) {
    // Convert INR to USD
    const usdAmount = inrAmount * usdPerInr
    
    // Convert USD to USDC (accounting for price difference)
    const usdcAmount = usdAmount / usdcUsdPrice
    
    // Add slippage buffer
    const slippageMultiplier = 1 + (slippagePercent / 100)
    const finalAmount = usdcAmount * slippageMultiplier
    
    // Round to 6 decimal places (USDC precision)
    return Math.ceil(finalAmount * 1000000) / 1000000
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }
}
