import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Download, FileType, Clock, Calendar, Link as LinkIcon, Edit, CheckCircle, File, Shield, Server, Upload } from "lucide-react";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogoUpload from "./LogoUpload";

interface Vulnerability {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  location: string;
  remediation: string;
  payload?: string;
}

interface PortScan {
  port: number;
  service: string;
  state: string;
  version: string;
}

interface SecurityHeader {
  name: string;
  present: boolean;
  value?: string;
  description: string;
  recommendation: string;
}

interface ScanResultsProps {
  results: {
    id: string;
    targetUrl: string;
    scanType: string;
    scanDate: string;
    scanTime: number;
    toolsUsed: string[];
    vulnerabilities: Vulnerability[];
    portScan?: PortScan[];
    securityHeaders?: SecurityHeader[];
    successfulPayloads?: string[];
    importedFile?: {
      data: string;
      type: string;
      name: string;
    };
    summary: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    editable?: boolean;
    reportStatus?: string;
  };
  onNewScan: () => void;
  reportLogo?: string | null;
  uploadedFile?: {
    data: string;
    type: string;
    name: string;
  } | null;
}

const ScanResults = ({ results, onNewScan, reportLogo, uploadedFile }: ScanResultsProps) => {
  const [editedResults, setEditedResults] = useState<typeof results>(results);
  const [editingVulnerability, setEditingVulnerability] = useState<Vulnerability | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState(results.reportStatus || "Draft");
  const [activeTab, setActiveTab] = useState("vulnerabilities");
  const [editingName, setEditingName] = useState(false);
  const [reportName, setReportName] = useState(results.targetUrl || "Security Report");
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(reportLogo);
  const { toast } = useToast();
  const fileFrameRef = useRef<HTMLIFrameElement>(null);

  // Update local storage when edited results change
  useEffect(() => {
    // Get existing reports
    const existingReports = JSON.parse(localStorage.getItem('scanReports') || '[]');
    
    // Check if this report already exists
    const existingReportIndex = existingReports.findIndex((report: any) => report.id === editedResults.id);
    
    if (existingReportIndex >= 0) {
      // Update existing report
      existingReports[existingReportIndex] = editedResults;
    } else {
      // Add new report
      existingReports.push(editedResults);
    }
    
    // Save back to local storage
    localStorage.setItem('scanReports', JSON.stringify(existingReports));
  }, [editedResults]);

  // Update imported file when props change
  useEffect(() => {
    if (uploadedFile && uploadedFile !== editedResults.importedFile) {
      setEditedResults({
        ...editedResults,
        importedFile: uploadedFile
      });
    }
  }, [uploadedFile]);

  // Update logo when props change
  useEffect(() => {
    if (reportLogo !== currentLogo) {
      setCurrentLogo(reportLogo);
    }
  }, [reportLogo]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${minutes > 1 ? 's' : ''}${remainingSeconds > 0 ? ` ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}` : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }
  };

  // Prepare data for bar chart
  const chartData = [
    { name: "Critical", value: editedResults.summary.critical, color: "#DC2626" },
    { name: "High", value: editedResults.summary.high, color: "#F97316" },
    { name: "Medium", value: editedResults.summary.medium, color: "#FBBF24" },
    { name: "Low", value: editedResults.summary.low, color: "#2DD4BF" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-teal-500";
      default:
        return "bg-blue-500";
    }
  };

  const handleEditVulnerability = (vulnerability: Vulnerability) => {
    setEditingVulnerability({ ...vulnerability });
    setIsEditDialogOpen(true);
  };

  const handleSaveVulnerability = () => {
    if (!editingVulnerability) return;

    // Update the vulnerability in the list
    const updatedVulnerabilities = editedResults.vulnerabilities.map(v => 
      v.id === editingVulnerability.id ? editingVulnerability : v
    );

    // Recalculate summary
    const summary = {
      total: updatedVulnerabilities.length,
      critical: updatedVulnerabilities.filter(v => v.severity === "critical").length,
      high: updatedVulnerabilities.filter(v => v.severity === "high").length,
      medium: updatedVulnerabilities.filter(v => v.severity === "medium").length,
      low: updatedVulnerabilities.filter(v => v.severity === "low").length,
    };

    setEditedResults({
      ...editedResults,
      vulnerabilities: updatedVulnerabilities,
      summary
    });

    setIsEditDialogOpen(false);
    setEditingVulnerability(null);

    toast({
      title: "Vulnerability updated",
      description: "The vulnerability details have been updated",
    });
  };

  const handleFinalizeReport = () => {
    // Update the report status
    const finalizedReport = {
      ...editedResults,
      reportStatus: "Finalized",
      editable: false
    };
    
    setEditedResults(finalizedReport);
    setReportStatus("Finalized");

    // Update in localStorage
    const existingScans = JSON.parse(localStorage.getItem('scanReports') || '[]');
    const updatedScans = existingScans.map((scan: any) => 
      scan.id === finalizedReport.id ? finalizedReport : scan
    );
    localStorage.setItem('scanReports', JSON.stringify(updatedScans));
    
    toast({
      title: "Report finalized",
      description: "The report has been finalized and is ready for export",
    });
  };

  const handleReportNameChange = (newName: string) => {
    setReportName(newName);
    setEditingName(false);
    setEditedResults({
      ...editedResults,
      targetUrl: newName
    });
    
    toast({
      title: "Report name updated",
      description: "The report name has been updated",
    });
  };

  const handleLogoChange = (newLogo: string) => {
    setCurrentLogo(newLogo);
    
    toast({
      title: "Report logo updated",
      description: "The logo will appear in the top right of your report",
    });
  };

  // Generate HTML report content
  const generateHtmlReport = () => {
    const logoHtml = currentLogo ? 
      `<div class="report-logo">
        <img src="${currentLogo}" alt="Company Logo" style="max-height: 80px; max-width: 200px;">
      </div>` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Scan Report - ${editedResults.id}</title>
        <style>
          @media print {
            .page-break {
              page-break-before: always;
            }
          }
          body { font-family: Arial, sans-serif; margin: 2rem; line-height: 1.6; color: #333; }
          h1, h2, h3 { color: #0F172A; }
          .header { margin-bottom: 2rem; position: relative; }
          .header-content { text-align: center; margin-bottom: 30px; }
          .header-logo { text-align: center; margin-bottom: 20px; }
          .corner-logo { position: absolute; top: 0; right: 0; max-height: 60px; max-width: 150px; }
          .summary { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
          .summary-item { background: #f9fafb; padding: 1rem; border-radius: 0.5rem; min-width: 200px; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; }
          .severity { padding: 0.25rem 0.5rem; border-radius: 0.25rem; display: inline-block; color: white; font-weight: bold; }
          .critical { background-color: #DC2626; }
          .high { background-color: #F97316; }
          .medium { background-color: #FBBF24; }
          .low { background-color: #2DD4BF; }
          .open { color: #22C55E; font-weight: bold; }
          .filtered { color: #F59E0B; font-weight: bold; }
          .closed { color: #6B7280; }
          .detail-section { background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
          .code { font-family: monospace; background: #f1f1f1; padding: 0.5rem; border-radius: 0.25rem; overflow-x: auto; }
          .footer { margin-top: 3rem; font-size: 0.875rem; color: #6B7280; border-top: 1px solid #e5e7eb; padding-top: 1rem; }
          .tools-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
          .tool-badge { background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; }
          .present { color: #22C55E; }
          .missing { color: #EF4444; }
          .successful-payload { font-family: monospace; background: #fee2e2; padding: 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0; display: block; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-logo">
            ${currentLogo ? `<img src="${currentLogo}" alt="Company Logo" style="max-height: 100px; max-width: 300px;">` : ''}
          </div>
          <div class="header-content">
            <h1>Security Scan Report</h1>
            <p>Target: ${reportName}</p>
            <p>ID: ${editedResults.id}</p>
            <p>Date: ${formatDate(editedResults.scanDate)}</p>
            <p>Status: ${reportStatus}</p>
          </div>
          ${currentLogo ? `<img src="${currentLogo}" alt="Company Logo" class="corner-logo">` : ''}
        </div>
        
        <h2>Target Information</h2>
        <div class="summary">
          <div class="summary-item">
            <h3>URL/Target</h3>
            <p>${reportName}</p>
          </div>
          <div class="summary-item">
            <h3>Scan Type</h3>
            <p>${editedResults.scanType}</p>
          </div>
          <div class="summary-item">
            <h3>Duration</h3>
            <p>${formatTime(editedResults.scanTime)}</p>
          </div>
        </div>
        
        <h2>Vulnerability Summary</h2>
        <div class="summary">
          <div class="summary-item">
            <h3>Total</h3>
            <p>${editedResults.summary.total}</p>
          </div>
          <div class="summary-item">
            <h3>Critical</h3>
            <p>${editedResults.summary.critical}</p>
          </div>
          <div class="summary-item">
            <h3>High</h3>
            <p>${editedResults.summary.high}</p>
          </div>
          <div class="summary-item">
            <h3>Medium</h3>
            <p>${editedResults.summary.medium}</p>
          </div>
          <div class="summary-item">
            <h3>Low</h3>
            <p>${editedResults.summary.low}</p>
          </div>
        </div>
        
        <h2>Tools Used</h2>
        <div class="tools-list">
          ${editedResults.toolsUsed.map(tool => `<span class="tool-badge">${tool}</span>`).join(' ')}
        </div>
        
        <div class="page-break"></div>
        ${currentLogo ? `<img src="${currentLogo}" alt="Company Logo" class="corner-logo">` : ''}
        
        <h2>Port Scan Results</h2>
        ${editedResults.portScan && editedResults.portScan.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Port</th>
              <th>Service</th>
              <th>State</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            ${editedResults.portScan.map(port => `
              <tr>
                <td>${port.port}</td>
                <td>${port.service}</td>
                <td class="${port.state === 'open' ? 'open' : port.state === 'filtered' ? 'filtered' : 'closed'}">${port.state}</td>
                <td>${port.version}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p>No port scan results available.</p>'}
        
        <h2>Security Headers Analysis</h2>
        ${editedResults.securityHeaders && editedResults.securityHeaders.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Header Name</th>
              <th>Status</th>
              <th>Value</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            ${editedResults.securityHeaders.map(header => `
              <tr>
                <td>${header.name}</td>
                <td class="${header.present ? 'present' : 'missing'}">${header.present ? 'Present' : 'Missing'}</td>
                <td>${header.present && header.value ? header.value : 'N/A'}</td>
                <td>${header.recommendation}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p>No security headers analysis available.</p>'}
        
        <div class="page-break"></div>
        ${currentLogo ? `<img src="${currentLogo}" alt="Company Logo" class="corner-logo">` : ''}
        
        <h2>Detected Vulnerabilities</h2>
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Name</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${editedResults.vulnerabilities.map(vuln => `
              <tr>
                <td><span class="severity ${vuln.severity}">${vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}</span></td>
                <td>${vuln.name}</td>
                <td>${vuln.location}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${editedResults.successfulPayloads && editedResults.successfulPayloads.length > 0 ? `
        <h2>Successful Injection Payloads</h2>
        <div class="detail-section">
          <p>The following payloads were confirmed to be successful during testing:</p>
          ${editedResults.successfulPayloads.map(payload => `
            <code class="successful-payload">${payload}</code>
          `).join('')}
          <p>These payloads should be fixed as a priority.</p>
        </div>
        ` : ''}
        
        <h2>Detailed Findings</h2>
        ${editedResults.vulnerabilities.map(vuln => `
          <div class="detail-section">
            <h3>${vuln.name} <span class="severity ${vuln.severity}">${vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}</span></h3>
            <h4>Description</h4>
            <p>${vuln.description}</p>
            <h4>Location</h4>
            <p>${vuln.location}</p>
            ${vuln.payload ? `
            <h4>Payload</h4>
            <div class="code">${vuln.payload}</div>
            ` : ''}
            <h4>Remediation</h4>
            <p>${vuln.remediation}</p>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>Report generated by AI-Powered VAPT & DAST Security Platform</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${currentLogo ? `<img src="${currentLogo}" alt="Company Logo" style="max-height: 40px; max-width: 100px;">` : ''}
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  // Generate and download HTML report
  const downloadHtmlReport = () => {
    const htmlContent = generateHtmlReport();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${reportName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Report downloaded",
      description: "Your HTML report has been downloaded to your device",
    });
  };

  // Generate CSV data
  const generateCsvData = () => {
    // Create CSV header
    let csv = 'ID,Severity,Name,Location,Payload,Description,Remediation\n';
    
    // Add each vulnerability as a row
    editedResults.vulnerabilities.forEach(vuln => {
      // Escape any commas in text fields
      const escapedDescription = `"${vuln.description.replace(/"/g, '""')}"`;
      const escapedRemediation = `"${vuln.remediation.replace(/"/g, '""')}"`;
      const escapedName = `"${vuln.name.replace(/"/g, '""')}"`;
      const escapedLocation = `"${vuln.location.replace(/"/g, '""')}"`;
      const escapedPayload = vuln.payload ? `"${vuln.payload.replace(/"/g, '""')}"` : '""';
      
      csv += `${vuln.id},${vuln.severity},${escapedName},${escapedLocation},${escapedPayload},${escapedDescription},${escapedRemediation}\n`;
    });
    
    // Add port scan results if available
    if (editedResults.portScan && editedResults.portScan.length > 0) {
      csv += '\n\nPort Scan Results\n';
      csv += 'Port,Service,State,Version\n';
      editedResults.portScan.forEach(port => {
        csv += `${port.port},"${port.service}","${port.state}","${port.version}"\n`;
      });
    }
    
    // Add security headers if available
    if (editedResults.securityHeaders && editedResults.securityHeaders.length > 0) {
      csv += '\n\nSecurity Headers Analysis\n';
      csv += 'Header Name,Present,Value,Recommendation\n';
      editedResults.securityHeaders.forEach(header => {
        const escapedValue = header.value ? `"${header.value.replace(/"/g, '""')}"` : '""';
        const escapedRecommendation = `"${header.recommendation.replace(/"/g, '""')}"`;
        csv += `"${header.name}","${header.present ? 'Yes' : 'No'}",${escapedValue},${escapedRecommendation}\n`;
      });
    }
    
    // Add successful payloads if available
    if (editedResults.successfulPayloads && editedResults.successfulPayloads.length > 0) {
      csv += '\n\nSuccessful Injection Payloads\n';
      csv += 'Payload\n';
      editedResults.successfulPayloads.forEach(payload => {
        const escapedPayload = `"${payload.replace(/"/g, '""')}"`;
        csv += `${escapedPayload}\n`;
      });
    }
    
    return csv;
  };

  // Download CSV report
  const downloadCsvReport = () => {
    const csv = generateCsvData();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${reportName.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "CSV Report downloaded",
      description: "Your CSV report has been downloaded to your device",
    });
  };

  // Generate PDF report using browser's print functionality
  const downloadPdfReport = () => {
    const htmlContent = generateHtmlReport();
    
    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Unable to open print window. Please check your popup blocker settings.",
        variant: "destructive"
      });
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      
      toast({
        title: "PDF Report ready",
        description: "Your report has been processed for PDF download",
      });
    };
  };

  // Render the uploaded file in the iframe
  const renderUploadedFile = () => {
    const file = editedResults.importedFile || uploadedFile;
    if (!file) return null;
    
    // For HTML files, we can render them directly in an iframe
    if (file.type === 'text/html') {
      return (
        <div className="mt-4 border rounded">
          <iframe 
            ref={fileFrameRef}
            src={file.data} 
            title="Uploaded HTML Report" 
            className="w-full h-[600px]"
          />
        </div>
      );
    }
    
    // For PDF files, we need to use the PDF viewer
    if (file.type === 'application/pdf') {
      return (
        <div className="mt-4 border rounded">
          <iframe 
            src={file.data} 
            title="Uploaded PDF Report" 
            className="w-full h-[600px]"
          />
        </div>
      );
    }
    
    return (
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <p className="text-center text-gray-500">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="max-w-[300px]"
                    placeholder="Report Name"
                  />
                  <Button size="sm" onClick={() => handleReportNameChange(reportName)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancel</Button>
                </div>
              ) : (
                <CardTitle className="flex items-center gap-2 cursor-pointer group" onClick={() => editedResults.editable && setEditingName(true)}>
                  {reportName}
                  {reportStatus === "Finalized" && (
                    <Badge className="bg-green-500">Finalized</Badge>
                  )}
                  {reportStatus === "Draft" && (
                    <Badge variant="outline">Draft</Badge>
                  )}
                  {editedResults.editable && (
                    <Edit className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </CardTitle>
              )}
              <CardDescription>
                Scan completed on {formatDate(editedResults.scanDate)}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => setShowLogoUpload(!showLogoUpload)}
              >
                <Upload className="h-4 w-4" />
                {currentLogo ? "Change Logo" : "Add Logo"}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={downloadCsvReport}
              >
                <FileType className="h-4 w-4" />
                CSV Report
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={downloadHtmlReport}
              >
                <File className="h-4 w-4" />
                HTML Report
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={downloadPdfReport}
              >
                <Download className="h-4 w-4" />
                PDF Report
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showLogoUpload && (
          <div className="px-6 pb-4">
            <LogoUpload
              onLogoUploaded={handleLogoChange}
              initialLogo={currentLogo}
            />
          </div>
        )}
        
        <CardContent>
          {/* Show the uploaded file if available */}
          {(editedResults.importedFile || uploadedFile) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Uploaded Report</h3>
              {renderUploadedFile()}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Target URL</h3>
                <div className="flex items-center mt-1">
                  <LinkIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-base font-medium">{reportName}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Scan Type</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-base font-medium capitalize">{editedResults.scanType}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Scan ID</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-base font-medium">{editedResults.id}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-base">{new Date(editedResults.scanDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-base">{formatTime(editedResults.scanTime)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tools Used</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {editedResults.toolsUsed.map((tool, index) => (
                    <Badge key={index} variant="secondary">{tool}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Vulnerability Summary</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="portscan">Port Scan</TabsTrigger>
              <TabsTrigger value="headers">Security Headers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vulnerabilities" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detected Vulnerabilities</h3>
                {editedResults.editable && reportStatus === "Draft" && (
                  <Button 
                    onClick={handleFinalizeReport}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalize Report
                  </Button>
                )}
              </div>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Vulnerability</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Payload</TableHead>
                      {editedResults.editable && reportStatus === "Draft" && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedResults.vulnerabilities.map((vuln) => (
                      <TableRow key={vuln.id}>
                        <TableCell>
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{vuln.name}</TableCell>
                        <TableCell className="text-ellipsis overflow-hidden">{vuln.location}</TableCell>
                        <TableCell>{vuln.payload ? 
                          <code className="text-xs bg-gray-100 p-1 rounded">{vuln.payload.length > 20 ? vuln.payload.substring(0, 20) + '...' : vuln.payload}</code> : 
                          "-"}</TableCell>
                        {editedResults.editable && reportStatus === "Draft" && (
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditVulnerability(vuln)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {editedResults.successfulPayloads && editedResults.successfulPayloads.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                    Successful Injection Payloads
                  </h3>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-700 mb-3">
                        The following payloads were confirmed to be successful during testing:
                      </p>
                      <div className="space-y-2">
                        {editedResults.successfulPayloads.map((payload, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 p-3 rounded font-mono text-sm overflow-x-auto">
                            {payload}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="portscan" className="mt-4">
              <div className="flex items-center mb-4">
                <Server className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Port Scan Results</h3>
              </div>
              
              {editedResults.portScan && editedResults.portScan.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Version</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedResults.portScan.map((port, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{port.port}</TableCell>
                        <TableCell>{port.service}</TableCell>
                        <TableCell>
                          <Badge variant={port.state === "open" ? "default" : 
                                        (port.state === "filtered" ? "outline" : "secondary")}
                                className={port.state === "open" ? "bg-green-500" : 
                                            (port.state === "filtered" ? "text-yellow-500" : "")}>
                            {port.state}
                          </Badge>
                        </TableCell>
                        <TableCell>{port.version}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No port scan results available.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="headers" className="mt-4">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Security Headers Analysis</h3>
              </div>
              
              {editedResults.securityHeaders && editedResults.securityHeaders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Header Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedResults.securityHeaders.map((header, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{header.name}</TableCell>
                        <TableCell>
                          <Badge variant={header.present ? "default" : "destructive"}
                                className={header.present ? "bg-green-500" : ""}>
                            {header.present ? "Present" : "Missing"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {header.present && header.value ? (
                            <code className="text-xs bg-gray-100 p-1 rounded">{header.value.length > 30 ? header.value.substring(0, 30) + '...' : header.value}</code>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>{header.recommendation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No security headers analysis available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onNewScan}>
            New Scan
          </Button>
          <Button 
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/80"
            onClick={downloadPdfReport}
          >
            <Download className="mr-2 h-4 w-4" />
            Generate Full Report
          </Button>
        </CardFooter>
      </Card>
      
      {editedResults.vulnerabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilities Details</CardTitle>
            <CardDescription>Detailed information about each detected vulnerability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {editedResults.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{vuln.name}</h3>
                    <Badge className={getSeverityColor(vuln.severity)}>
                      {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                    </Badge>
                    {editedResults.editable && reportStatus === "Draft" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto" 
                        onClick={() => handleEditVulnerability(vuln)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="mt-1">{vuln.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <p className="mt-1 font-mono text-sm">{vuln.location}</p>
                    </div>
                    {vuln.payload && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Payload</h4>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-x-auto font-mono">
                          {vuln.payload}
                        </pre>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Remediation</h4>
                      <p className="mt-1">{vuln.remediation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit vulnerability dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vulnerability</DialogTitle>
            <DialogDescription>
              Update the details of this vulnerability.
            </DialogDescription>
          </DialogHeader>
          {editingVulnerability && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vuln-name" className="col-span-1">Name</Label>
                <Input
                  id="vuln-name"
                  value={editingVulnerability.name}
                  onChange={(e) => setEditingVulnerability({
                    ...editingVulnerability,
                    name: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vuln-severity" className="col-span-1">Severity</Label>
                <Select
                  value={editingVulnerability.severity}
                  onValueChange={(value) => setEditingVulnerability({
                    ...editingVulnerability,
                    severity: value as "critical" | "high" | "medium" | "low"
                  })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vuln-location" className="col-span-1">Location</Label>
                <Input
                  id="vuln-location"
                  value={editingVulnerability.location}
                  onChange={(e) => setEditingVulnerability({
                    ...editingVulnerability,
                    location: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vuln-payload" className="col-span-1">Payload</Label>
                <Textarea
                  id="vuln-payload"
                  value={editingVulnerability.payload || ""}
                  onChange={(e) => setEditingVulnerability({
                    ...editingVulnerability,
                    payload: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vuln-description" className="col-span-1">Description</Label>
                <Textarea
                  id="vuln-description"
                  value={editingVulnerability.description}
                  onChange={(e) => setEditingVulnerability({
                    ...editingVulnerability,
                    description: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vuln-remediation" className="col-span-1">Remediation</Label>
                <Textarea
                  id="vuln-remediation"
                  value={editingVulnerability.remediation}
                  onChange={(e) => setEditingVulnerability({
                    ...editingVulnerability,
                    remediation: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveVulnerability}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanResults;
