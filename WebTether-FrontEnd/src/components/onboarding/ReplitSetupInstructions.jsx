"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Copy, Code, Terminal, Zap } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

export function ReplitSetupInstructions() {
  const { toast } = useToast()

  const getJWTToken = () => {
    return localStorage.getItem("web-tether-token") || ""
  }

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  const envFileContent = `# Web-Tether Agent Configuration
AUTH_TOKEN=${getJWTToken()}
PORT=3000

# Optional: Add your custom settings
PING_TIMEOUT=5000
MAX_RETRIES=3`

  const agentCode = `// Simple ping agent example
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
};

// Ping endpoint
app.post('/ping', verifyToken, async (req, res) => {
  const { url } = req.body;
  try {
    const start = Date.now();
    const response = await fetch(url);
    const latency = Date.now() - start;
    
    res.json({
      is_up: response.ok,
      latency_ms: latency,
      status_code: response.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      is_up: false,
      latency_ms: null,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(process.env.PORT || 3000);`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Replit Agent Setup Guide
          </CardTitle>
          <CardDescription>
            Complete instructions for setting up your ping agent with JWT authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Environment Variables */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">1</Badge>
              <h3 className="font-semibold">Create .env file</h3>
            </div>
            <p className="text-sm text-muted-foreground">Add your JWT token and configuration to the .env file:</p>
            <div className="relative">
              <pre className="bg-black text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                <code>{envFileContent}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                onClick={() => handleCopyToClipboard(envFileContent)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Step 2: Agent Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">2</Badge>
              <h3 className="font-semibold">Agent Implementation</h3>
            </div>
            <p className="text-sm text-muted-foreground">Your agent should implement JWT token verification:</p>
            <div className="relative">
              <pre className="bg-black text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                <code>{agentCode}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                onClick={() => handleCopyToClipboard(agentCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Step 3: Testing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">3</Badge>
              <h3 className="font-semibold">Test Your Agent</h3>
            </div>
            <p className="text-sm text-muted-foreground">Test your agent locally before connecting to Web-Tether:</p>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4 w-4" />
                <span className="font-mono text-sm">curl test command:</span>
              </div>
              <code className="text-xs bg-black text-green-400 p-2 rounded block">
                curl -X POST https://your-agent.repl.co/ping \\
                <br />
                &nbsp;&nbsp;-H "Authorization: Bearer {getJWTToken()}" \\
                <br />
                &nbsp;&nbsp;-H "Content-Type: application/json" \\
                <br />
                &nbsp;&nbsp;-d '{'url": "https://google.com'}'
              </code>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">Important Notes</h4>
            </div>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Your JWT token is unique to your account and session</li>
              <li>• Keep your token secure - don't share it publicly</li>
              <li>• The token may refresh when you log in again</li>
              <li>• Your agent must verify the token on every request</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
