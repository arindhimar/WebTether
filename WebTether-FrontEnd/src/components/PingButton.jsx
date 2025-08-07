import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "./ui/button"
import PingPaymentAbi from "../abi/PingPayment.json"
import { api } from "../services/api"

// Generate 20 sample codes once (e.g. UUIDs or hex strings)
const SAMPLE_CODES = Array.from({length:20}, (_,i)=>`CODE${i+1}-${Math.random().toString(36).slice(2,8)}`)

export function PingButton({ wid, url, toast, onPingComplete }) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleManualPing() {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Connect MetaMask → Hardhat local
      await window.ethereum.request({ method: "eth_requestAccounts" })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Check if we're on the right network (Hardhat local)
      const network = await provider.getNetwork()
      if (network.chainId !== 31337n) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Hardhat Local Network (Chain ID: 31337)",
          variant: "destructive",
        })
        return
      }

      if (!import.meta.env.VITE_CONTRACT_ADDRESS) {
        toast({
          title: "Contract Not Configured",
          description: "Please set VITE_CONTRACT_ADDRESS in your .env file",
          variant: "destructive",
        })
        return
      }

      // Contract instance
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        PingPaymentAbi,
        signer
      )

      toast({
        title: "Processing Payment",
        description: "Sending 0.0002 ETH to PingPayment contract...",
      })

      // Pay exact 0.0002 ETH
      const tx = await contract.payForPing({
        value: ethers.parseEther("0.0002")
      })
      
      toast({
        title: "Transaction Sent",
        description: `Waiting for confirmation... TX: ${tx.hash.slice(0, 10)}...`,
      })

      await tx.wait()

      toast({
        title: "Payment Confirmed",
        description: "Submitting ping request to backend...",
      })

      // Send to backend, include code if provided
      const res = await api.manualPing({
        wid,
        url,
        txHash: tx.hash,
        feePaidNumeric: 0.0002,
        code: code || undefined
      })

      toast({
        title: "Ping Recorded!",
        description: `TX ${tx.hash.slice(0, 16)}... – Site is ${res.result?.is_up ? "UP 🟢" : "DOWN 🔴"}`,
      })

      // Call callback to refresh data
      if (onPingComplete) {
        onPingComplete()
      }

    } catch (err) {
      console.error("Ping failed:", err)
      
      let errorMessage = err.message || "Check console for details"
      
      // Handle specific error cases
      if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH balance for transaction"
      } else if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else if (err.message?.includes("402")) {
        errorMessage = "Payment verification failed on backend"
      }
      
      toast({
        title: "Ping Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="demo-code" className="block text-sm font-medium mb-1">
          Demo Code (Optional)
        </label>
        <select 
          id="demo-code"
          value={code} 
          onChange={e => setCode(e.target.value)}
          className="w-full p-2 border rounded-md text-sm bg-white"
          disabled={isLoading}
        >
          <option value="">-- Select optional demo code --</option>
          {SAMPLE_CODES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      
      <Button 
        onClick={handleManualPing}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600"
      >
        {isLoading ? "Processing..." : "Ping Now (0.0002 ETH)"}
      </Button>
    </div>
  )
}
