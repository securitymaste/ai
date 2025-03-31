
import { useState, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { generatePortScanResults, generateSecurityHeadersResults, generateSuccessfulPayloads, getCachedResults, cacheResults } from "@/utils/scanUtils";

const scanTools = [
  { id: "zap", name: "ZAP" },
  { id: "nikto", name: "Nikto" },
  { id: "w3af", name: "W3AF" },
  { id: "arachni", name: "Arachni" },
  { id: "wapiti", name: "Wapiti" },
  { id: "observatory", name: "HTTP Observatory" },
  { id: "sslyze", name: "SSLyze" },
  { id: "testssl", name: "testssl.sh" },
  { id: "wafw00f", name: "wafw00f" },
  { id: "nmap", name: "Nmap" },
  { id: "whatwaf", name: "WhatWaf" },
  { id: "jwt_tool", name: "JWT Tool" },
  { id: "kiterunner", name: "Kiterunner" },
  { id: "postman", name: "Postman" },
  { id: "graphqlmap", name: "GraphQLmap" },
  { id: "sqlmap", name: "SQLMap" },
  { id: "xsstrike", name: "XSStrike" },
  { id: "nosqlmap", name: "NoSQLMap" },
  { id: "cloudmapper", name: "CloudMapper" },
  { id: "kube-hunter", name: "kube-hunter" },
  { id: "cloudsploit", name: "CloudSploit" },
  { id: "trivy", name: "Trivy" },
  { id: "grype", name: "Grype" },
  { id: "semgrep", name: "Semgrep" },
  { id: "modelscan", name: "ModelScan" },
  { id: "vulnhuntr", name: "VulnHuntr" },
  { id: "securityheaders", name: "Security Headers Scanner" }
];

interface ScanFormProps {
  onScanComplete: (results: any) => void;
}

const ScanForm = ({ onScanComplete }: ScanFormProps) => {
  const [url, setUrl] = useState("");
  const [scanType, setScanType] = useState("quick");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Select default tools based on scan type
    if (scanType === "quick") {
      setSelectedTools(["zap", "nmap", "securityheaders"]);
    } else if (scanType === "standard") {
      setSelectedTools(["zap", "nikto", "nmap", "sqlmap", "xsstrike", "securityheaders", "sslyze"]);
    } else if (scanType === "full") {
      setSelectedTools(["zap", "nikto", "w3af", "nmap", "sqlmap", "xsstrike", "jwt_tool", "securityheaders", "sslyze", "wafw00f", "testssl"]);
    }
  }, [scanType]);

  const validateUrl = (input: string) => {
    // Basic URL validation
    if (!input) {
      return "Please enter a URL";
    }
    
    try {
      const urlObj = new URL(input);
      if (!urlObj.hostname) {
        return "Invalid URL format";
      }
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return "URL must start with http:// or https://";
      }
    } catch (e) {
      return "Invalid URL format";
    }
    
    return "";
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUrl(input);
    setValidationError(validateUrl(input));
  };

  const handleToolSelect = (toolId: string, selected: boolean) => {
    if (selected) {
      setSelectedTools([...selectedTools, toolId]);
    } else {
      setSelectedTools(selectedTools.filter(id => id !== toolId));
    }
  };

  const selectAllTools = () => {
    setSelectedTools(scanTools.map(tool => tool.id));
  };

  const clearToolSelection = () => {
    setSelectedTools([]);
  };

  const simulateScan = async () => {
    setIsScanning(true);
    setProgress(0);
    
    // Check for cached results first
    const cachedResults = getCachedResults(url, scanType);
    if (cachedResults) {
      // Still simulate a scan in progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setIsScanning(false);
      onScanComplete(cachedResults);
      return;
    }
    
    // Generate a unique ID for this scan
    const scanId = "REP-" + Math.floor(Math.random() * 100000);
    const scanDate = new Date().toISOString();
    const scanTime = Math.floor(scanType === "quick" ? 
      (300 + Math.random() * 200) : 
      (scanType === "standard" ? 
        (900 + Math.random() * 500) : 
        (2500 + Math.random() * 1500)
      )
    );
    
    // Generate tool list
    const usedTools = scanTools
      .filter(tool => selectedTools.includes(tool.id))
      .map(tool => tool.name);
    
    // Simulation of scan progress
    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, scanType === "quick" ? 100 : (scanType === "standard" ? 200 : 300)));
    }
    
    // Generate simulated vulnerabilities
    const vulnerabilities = [];
    const criticalCount = Math.floor(Math.random() * (scanType === "quick" ? 2 : (scanType === "standard" ? 3 : 5)));
    const highCount = Math.floor(Math.random() * (scanType === "quick" ? 3 : (scanType === "standard" ? 5 : 8)));
    const mediumCount = Math.floor(Math.random() * (scanType === "quick" ? 4 : (scanType === "standard" ? 7 : 10)));
    const lowCount = Math.floor(Math.random() * (scanType === "quick" ? 5 : (scanType === "standard" ? 8 : 12)));
    
    // Critical vulnerabilities
    for (let i = 0; i < criticalCount; i++) {
      vulnerabilities.push({
        id: `VULN-C-${i + 1}`,
        name: [
          "SQL Injection",
          "Remote Code Execution",
          "Authentication Bypass",
          "Unauthorized Admin Access",
          "Command Injection"
        ][Math.floor(Math.random() * 5)],
        severity: "critical",
        location: `${url}/admin/users.php?id=1`,
        description: "A critical vulnerability allowing an attacker to execute arbitrary SQL commands on the database server.",
        remediation: "Implement prepared statements, use parameterized queries, or apply an ORM that escapes user input.",
        payload: generateSuccessfulPayloads()[0]
      });
    }
    
    // High vulnerabilities
    for (let i = 0; i < highCount; i++) {
      vulnerabilities.push({
        id: `VULN-H-${i + 1}`,
        name: [
          "Cross-Site Scripting (XSS)",
          "CSRF Token Bypass",
          "Broken Access Control",
          "Insecure Direct Object References",
          "XML External Entity Injection"
        ][Math.floor(Math.random() * 5)],
        severity: "high",
        location: `${url}/search?q=test`,
        description: "A vulnerability allowing attackers to inject client-side scripts into web pages viewed by other users.",
        remediation: "Implement proper output encoding and validate input data. Use Content-Security-Policy headers.",
        payload: i % 2 === 0 ? "<script>alert('XSS')</script>" : undefined
      });
    }
    
    // Medium vulnerabilities
    for (let i = 0; i < mediumCount; i++) {
      vulnerabilities.push({
        id: `VULN-M-${i + 1}`,
        name: [
          "Insecure Cookies",
          "Missing Content Security Policy",
          "Cross-Origin Resource Sharing Misconfiguration",
          "Clickjacking Vulnerability",
          "Insecure Password Storage"
        ][Math.floor(Math.random() * 5)],
        severity: "medium",
        location: `${url}/login`,
        description: "The application sets cookies without the secure flag, allowing them to be transmitted over unencrypted connections.",
        remediation: "Set the Secure and HttpOnly flags on all sensitive cookies to prevent transmission over unencrypted connections and access from client-side scripts."
      });
    }
    
    // Low vulnerabilities
    for (let i = 0; i < lowCount; i++) {
      vulnerabilities.push({
        id: `VULN-L-${i + 1}`,
        name: [
          "Server Information Disclosure",
          "Outdated JavaScript Library",
          "Missing X-Content-Type-Options Header",
          "HTML Form Without CSRF Protection",
          "Open Redirect"
        ][Math.floor(Math.random() * 5)],
        severity: "low",
        location: `${url}/js/jquery-1.11.2.min.js`,
        description: "The application uses an outdated JavaScript library with known vulnerabilities.",
        remediation: "Update all JavaScript libraries to their latest versions and implement a process to regularly check for and apply updates."
      });
    }
    
    // Port scan results
    const portScanResults = generatePortScanResults(url);
    
    // Security headers results
    const securityHeaders = generateSecurityHeadersResults();
    
    // Create the final results object
    const results = {
      id: scanId,
      targetUrl: url,
      scanType: scanType === "quick" ? "Quick Scan" : (scanType === "standard" ? "Standard Scan" : "Full Scan"),
      scanDate: scanDate,
      scanTime: scanTime,
      toolsUsed: usedTools,
      vulnerabilities: vulnerabilities,
      summary: {
        total: vulnerabilities.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      portScan: portScanResults,
      securityHeaders: securityHeaders,
      successfulPayloads: generateSuccessfulPayloads(),
      editable: true,
      reportStatus: "Draft"
    };
    
    // Cache the results
    cacheResults(url, scanType, results);
    
    // Complete the scan
    setIsScanning(false);
    onScanComplete(results);
    
    toast({
      title: "Scan Complete",
      description: `Found ${vulnerabilities.length} issues to review.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUrl(url);
    if (error) {
      setValidationError(error);
      return;
    }
    
    if (selectedTools.length === 0) {
      toast({
        title: "No Tools Selected",
        description: "Please select at least one scanning tool.",
        variant: "destructive"
      });
      return;
    }
    
    simulateScan();
  };

  const scanDurationText = scanType === "quick" ? 
    "5-10 minutes" : 
    (scanType === "standard" ? "15-30 minutes" : "30-60 minutes");

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>New Security Scan</CardTitle>
          <CardDescription>
            Configure your scan settings to start a new security assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target URL */}
          <div className="space-y-2">
            <Label htmlFor="target-url">Target URL</Label>
            <Input
              id="target-url"
              placeholder="https://example.com"
              value={url}
              onChange={handleUrlChange}
              className={validationError ? "border-red-500" : ""}
              disabled={isScanning}
            />
            {validationError && (
              <p className="text-sm text-red-500">{validationError}</p>
            )}
            <p className="text-sm text-gray-500">
              Enter the full URL of the application you want to scan
            </p>
          </div>
          
          {/* Scan Type */}
          <div className="space-y-2">
            <Label>Scan Type</Label>
            <RadioGroup 
              value={scanType} 
              onValueChange={setScanType}
              className="flex flex-col space-y-1"
              disabled={isScanning}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="quick" />
                <Label htmlFor="quick" className="font-normal">
                  Quick Scan
                  <span className="block text-sm text-gray-500">Basic security check (~{scanDurationText})</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="font-normal">
                  Standard Scan
                  <span className="block text-sm text-gray-500">Comprehensive scan (~{scanDurationText})</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="font-normal">
                  Full Scan
                  <span className="block text-sm text-gray-500">In-depth analysis (~{scanDurationText})</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Tool Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Selected Tools ({selectedTools.length})</Label>
              <div className="space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllTools}
                  disabled={isScanning}
                >
                  Select All
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={clearToolSelection}
                  disabled={isScanning}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="h-60 overflow-y-auto border rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {scanTools.map((tool) => (
                  <div key={tool.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tool.id}
                      checked={selectedTools.includes(tool.id)}
                      onCheckedChange={(checked) => 
                        handleToolSelect(tool.id, checked as boolean)
                      }
                      disabled={isScanning}
                    />
                    <Label htmlFor={tool.id} className="font-normal">
                      {tool.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Scan Progress */}
          {isScanning && (
            <div className="space-y-2">
              <Label>Scan Progress</Label>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Scanning...</span>
                <span>{progress}%</span>
              </div>
              
              <Alert className="mt-4">
                <AlertDescription>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running security assessment. This may take several minutes...</span>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <Separator />
          
          <div className="text-sm text-gray-500">
            <p>Note: This scan will identify potential security vulnerabilities in the target application. Always ensure you have proper authorization before scanning any system.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/80"
            disabled={isScanning || !!validationError}
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Start Scan
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ScanForm;
