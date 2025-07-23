import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, DollarSign, Wifi } from 'lucide-react';
import { generateCompleteShareData } from '@/utils/inviteCodeUtils';

/**
 * Demo component showing the performance difference between
 * onchain vs frontend invite code generation
 */
export const InviteCodeDemo: React.FC = () => {
  const [frontendTime, setFrontendTime] = useState<number | null>(null);
  const [frontendCode, setFrontendCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFrontendCode = async () => {
    setIsGenerating(true);
    const startTime = performance.now();
    
    try {
      // Simulate a vault ID
      const vaultId = BigInt(123);
      
      // Generate instantly on frontend
      const shareData = generateCompleteShareData(vaultId);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setFrontendTime(duration);
      setFrontendCode(shareData.inviteCode);
      
    } catch (error) {
      console.error('Error generating frontend code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateOnchainGeneration = () => {
    // Simulate typical blockchain transaction time
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Invite Code Generation Comparison</h2>
        <p className="text-muted-foreground">
          See the performance difference between onchain and frontend generation
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Frontend Generation */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Frontend Generation (Hybrid)
            </CardTitle>
            <CardDescription>
              Instant generation with onchain validation when joining
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Speed: Instant</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Cost: $0</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span>Network: Not required</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Gas Free</Badge>
              </div>
            </div>

            <Button 
              onClick={generateFrontendCode}
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? 'Generating...' : 'Generate Frontend Code'}
            </Button>

            {frontendTime !== null && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Generation Time:</span>
                  <Badge variant="outline" className="text-green-600">
                    {frontendTime.toFixed(2)}ms
                  </Badge>
                </div>
                {frontendCode && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Generated Code:</span>
                    <div className="p-2 bg-white rounded border font-mono text-sm">
                      {frontendCode}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Onchain Generation */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Onchain Generation (Traditional)
            </CardTitle>
            <CardDescription>
              Requires blockchain transaction and gas fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Speed: 2-15 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Cost: $0.50-$5.00</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span>Network: Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Gas Required</Badge>
              </div>
            </div>

            <div className="p-4 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Typical onchain flow:</strong>
                <br />
                1. Submit transaction (~2-15s)
                <br />
                2. Pay gas fees ($0.50-$5.00)
                <br />
                3. Wait for confirmation
                <br />
                4. Store mapping onchain
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Why Frontend Generation is Better</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">⚡ Performance</h4>
              <p className="text-sm text-muted-foreground">
                Instant generation vs 2-15 second blockchain transactions
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">💰 Cost Savings</h4>
              <p className="text-sm text-muted-foreground">
                Zero gas fees vs $0.50-$5.00 per invite code generation
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">🔒 Security</h4>
              <p className="text-sm text-muted-foreground">
                Validation happens onchain when joining, maintaining security
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Frontend Generation Process:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Extract vault ID from user input</li>
              <li>Generate readable code: GOAL{vaultId}{timestamp}{random}</li>
              <li>Create shareable URL instantly</li>
              <li>No blockchain interaction required</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Validation on Join:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Parse invite code to extract vault ID</li>
              <li>Verify vault exists and is active onchain</li>
              <li>Check user permissions and vault status</li>
              <li>Execute join transaction if valid</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteCodeDemo;
