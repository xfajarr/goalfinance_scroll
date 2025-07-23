import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  generateFrontendInviteCode, 
  extractVaultIdFromInviteCode,
  generateCompleteShareData,
  isValidInviteCodeFormat 
} from '@/utils/inviteCodeUtils';
import { useInviteCode } from '@/hooks/useInviteCode';
import { Copy, Check, TestTube, Zap } from 'lucide-react';

const TestInviteCodes = () => {
  const [vaultId, setVaultId] = useState('123');
  const [generatedCode, setGeneratedCode] = useState('');
  const [testCode, setTestCode] = useState('');
  const [extractedId, setExtractedId] = useState<bigint | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { validateInviteCode, isValidating, validateError } = useInviteCode();

  const handleGenerateCode = () => {
    const id = BigInt(vaultId);
    const code = generateFrontendInviteCode(id);
    setGeneratedCode(code);
    
    // Also generate complete share data
    const data = generateCompleteShareData(id);
    setShareData(data);
  };

  const handleTestCode = () => {
    const id = extractVaultIdFromInviteCode(testCode);
    const valid = isValidInviteCodeFormat(testCode);
    
    setExtractedId(id);
    setIsValid(valid);
  };

  const handleValidateOnchain = async () => {
    if (!testCode) return;
    
    try {
      const result = await validateInviteCode(testCode);
      console.log('Onchain validation result:', result);
    } catch (error) {
      console.error('Onchain validation error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-fredoka font-bold text-goal-text mb-2">
            🧪 Invite Code Testing Lab
          </h1>
          <p className="text-goal-text/80">
            Test the new offchain invite code generation and validation system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Generation Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Generate Invite Code
              </CardTitle>
              <CardDescription>
                Test instant offchain invite code generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vault ID</label>
                <Input
                  value={vaultId}
                  onChange={(e) => setVaultId(e.target.value)}
                  placeholder="Enter vault ID (e.g., 123)"
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={handleGenerateCode}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Generate Code
              </Button>

              {generatedCode && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Generated Invite Code</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={generatedCode}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(generatedCode)}
                        variant="outline"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {shareData && (
                    <div>
                      <label className="text-sm font-medium">Share URL</label>
                      <Input
                        value={shareData.shareUrl}
                        readOnly
                        className="mt-1 text-xs"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-600" />
                Validate Invite Code
              </CardTitle>
              <CardDescription>
                Test invite code parsing and validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Invite Code to Test</label>
                <Input
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="Enter invite code (e.g., GOAL123ABC4XYZ)"
                  className="mt-1 font-mono"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleTestCode}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Parse Code
                </Button>
                <Button 
                  onClick={handleValidateOnchain}
                  disabled={isValidating || !testCode}
                  variant="outline"
                  className="flex-1"
                >
                  {isValidating ? 'Validating...' : 'Validate Onchain'}
                </Button>
              </div>

              {testCode && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Format Valid:</span>
                    <Badge variant={isValid ? "default" : "destructive"}>
                      {isValid ? "✅ Valid" : "❌ Invalid"}
                    </Badge>
                  </div>
                  
                  {extractedId !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Extracted Vault ID:</span>
                      <Badge variant="outline">
                        {extractedId.toString()}
                      </Badge>
                    </div>
                  )}

                  {validateError && (
                    <div className="text-red-600 text-sm">
                      Onchain Error: {validateError.message}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Results & Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Generation Speed</h3>
                <p className="text-2xl font-bold text-green-600">~1ms</p>
                <p className="text-sm text-green-700">Instant frontend generation</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Gas Cost</h3>
                <p className="text-2xl font-bold text-blue-600">$0</p>
                <p className="text-sm text-blue-700">No blockchain transaction</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800">Security</h3>
                <p className="text-2xl font-bold text-purple-600">✅</p>
                <p className="text-sm text-purple-700">Validated onchain when joining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Enter a vault ID (e.g., 123) and click "Generate Code"</li>
              <li>Copy the generated invite code</li>
              <li>Paste it in the validation section and click "Parse Code"</li>
              <li>Verify the extracted vault ID matches the original</li>
              <li>Try "Validate Onchain" to test blockchain validation (requires deployed contract)</li>
              <li>Test with invalid codes to see error handling</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default TestInviteCodes;
