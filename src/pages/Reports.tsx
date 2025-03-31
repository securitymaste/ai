import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Filter, Search, Edit, File, Upload, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import LogoUpload from "@/components/LogoUpload";
import FileUpload from "@/components/FileUpload";

interface Report {
  id: string;
  scanDate: string;
  targetUrl: string;
  scanType: string;
  scanTime: number;
  vulnerabilities: any[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  reportStatus?: string;
  toolsUsed: string[];
  portScan?: any[];
  securityHeaders?: any[];
  successfulPayloads?: string[];
  importedFile?: {
    data: string;
    type: string;
    name: string;
  };
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reportLogo, setReportLogo] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    data: string;
    type: string;
    name: string;
  } | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const storedReports = localStorage.getItem('scanReports');
    if (storedReports) {
      const parsedReports = JSON.parse(storedReports);
      parsedReports.sort((a: Report, b: Report) => 
        new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()
      );
      setReports(parsedReports);
    } else {
      const mockReports: Report[] = [
        {
          id: "REP-12345",
          scanDate: "2023-06-15T10:30:00Z",
          targetUrl: "https://example.com",
          scanType: "Full Scan",
          scanTime: 2450,
          vulnerabilities: [],
          toolsUsed: ["ZAP", "Nikto", "W3AF", "Nmap", "SQLMap"],
          summary: {
            total: 14,
            critical: 2,
            high: 3,
            medium: 5,
            low: 4
          },
          reportStatus: "Finalized"
        },
        {
          id: "REP-12346",
          scanDate: "2023-06-10T14:15:00Z",
          targetUrl: "https://test-api.example.org",
          scanType: "Quick Scan",
          scanTime: 475,
          vulnerabilities: [],
          toolsUsed: ["Arachni", "SSLyze", "Wapiti"],
          summary: {
            total: 6,
            critical: 0,
            high: 1,
            medium: 3,
            low: 2
          },
          reportStatus: "Draft"
        },
        {
          id: "REP-12347",
          scanDate: "2023-06-05T09:45:00Z",
          targetUrl: "https://dev.example.net",
          scanType: "Standard Scan",
          scanTime: 1230,
          vulnerabilities: [],
          toolsUsed: ["ZAP", "Nikto", "JWT Tool", "Grype"],
          summary: {
            total: 10,
            critical: 1,
            high: 2,
            medium: 4,
            low: 3
          },
          reportStatus: "Finalized"
        },
        {
          id: "REP-12348",
          scanDate: "2023-05-28T11:20:00Z",
          targetUrl: "https://api.example.com",
          scanType: "API Scan",
          scanTime: 960,
          vulnerabilities: [],
          toolsUsed: ["GraphQLmap", "JWT Tool", "Kiterunner", "Postman"],
          summary: {
            total: 8,
            critical: 0,
            high: 2,
            medium: 3,
            low: 3
          },
          reportStatus: "Draft"
        },
        {
          id: "REP-12349",
          scanDate: "2023-05-20T16:40:00Z",
          targetUrl: "https://staging.example.org",
          scanType: "Full Scan",
          scanTime: 3720,
          vulnerabilities: [],
          toolsUsed: ["ZAP", "SQLMap", "XSStrike", "Nikto", "Nmap", "WhatWaf"],
          summary: {
            total: 18,
            critical: 3,
            high: 5,
            medium: 7,
            low: 3
          },
          reportStatus: "Finalized"
        }
      ];
      
      setReports(mockReports);
      localStorage.setItem('scanReports', JSON.stringify(mockReports));
    }
    
    const savedLogo = localStorage.getItem('reportLogo');
    if (savedLogo) {
      setReportLogo(savedLogo);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterType !== "all" && report.scanType.toLowerCase().replace(" scan", "") !== filterType.toLowerCase()) {
      return false;
    }
    
    if (filterStatus !== "all" && report.reportStatus?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    
    if (searchQuery && 
        !report.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleViewReport = (report: Report) => {
    navigate("/scan", { state: { results: report } });
  };

  const handleEditReport = (report: Report) => {
    navigate("/scan", { state: { results: report, editMode: true } });
  };

  const handleLogoUploaded = (logoData: string) => {
    setReportLogo(logoData);
    localStorage.setItem('reportLogo', logoData);
    
    toast({
      title: "Logo uploaded",
      description: "Your logo has been uploaded and will appear in reports",
    });
  };
  
  const handleFileUploaded = (fileData: { data: string, type: string, name: string }) => {
    setUploadedFile(fileData);
    
    const mockResults = {
      id: `imported-${Date.now()}`,
      targetUrl: fileData.name.replace(/\.(html|pdf)$/, '').replace(/_/g, '.'),
      scanType: "Imported Report",
      scanDate: new Date().toISOString(),
      scanTime: 0,
      toolsUsed: ["Document Import"],
      vulnerabilities: [],
      importedFile: fileData,
      summary: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      editable: true,
      reportStatus: "Draft",
      portScan: [],
      securityHeaders: []
    };
    
    const updatedReports = [mockResults, ...reports];
    setReports(updatedReports);
    localStorage.setItem('scanReports', JSON.stringify(updatedReports));
    
    setUploadDialogOpen(false);
    
    toast({
      title: "Report imported",
      description: "Your report has been imported and is ready for editing",
    });
    
    setTimeout(() => {
      navigate("/scan", { 
        state: { 
          results: mockResults, 
          editMode: true 
        } 
      });
    }, 500);
  };

  const generateHtmlReport = (report: Report) => {
    const logoHtml = reportLogo ? 
      `<div class="report-logo">
        <img src="${reportLogo}" alt="Company Logo" style="max-height: 80px; max-width: 200px;">
      </div>` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Scan Report - ${report.id}</title>
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
            ${reportLogo ? `<img src="${reportLogo}" alt="Company Logo" style="max-height: 100px; max-width: 300px;">` : ''}
          </div>
          <div class="header-content">
            <h1>Security Scan Report</h1>
            <p>ID: ${report.id}</p>
            <p>Date: ${formatDate(report.scanDate)}</p>
            <p>Status: ${report.reportStatus || "Completed"}</p>
          </div>
          ${reportLogo ? `<img src="${reportLogo}" alt="Company Logo" class="corner-logo">` : ''}
        </div>
        
        <h2>Target Information</h2>
        <div class="summary">
          <div class="summary-item">
            <h3>URL</h3>
            <p>${report.targetUrl}</p>
          </div>
          <div class="summary-item">
            <h3>Scan Type</h3>
            <p>${report.scanType}</p>
          </div>
          <div class="summary-item">
            <h3>Duration</h3>
            <p>${formatTime(report.scanTime)}</p>
          </div>
        </div>
        
        <h2>Vulnerability Summary</h2>
        <div class="summary">
          <div class="summary-item">
            <h3>Total</h3>
            <p>${report.summary.total}</p>
          </div>
          <div class="summary-item">
            <h3>Critical</h3>
            <p>${report.summary.critical}</p>
          </div>
          <div class="summary-item">
            <h3>High</h3>
            <p>${report.summary.high}</p>
          </div>
          <div class="summary-item">
            <h3>Medium</h3>
            <p>${report.summary.medium}</p>
          </div>
          <div class="summary-item">
            <h3>Low</h3>
            <p>${report.summary.low}</p>
          </div>
        </div>
        
        <h2>Tools Used</h2>
        <div class="tools-list">
          ${report.toolsUsed.map(tool => `<span class="tool-badge">${tool}</span>`).join(' ')}
        </div>
        
        <div class="page-break"></div>
        ${logoHtml}
        
        <h2>Port Scan Results</h2>
        ${report.portScan && report.portScan.length > 0 ? `
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
            ${report.portScan.map((port: any) => `
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
        ${report.securityHeaders && report.securityHeaders.length > 0 ? `
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
            ${report.securityHeaders.map((header: any) => `
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
        ${logoHtml}
        
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
            ${report.vulnerabilities.map((vuln: any) => `
              <tr>
                <td><span class="severity ${vuln.severity}">${vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}</span></td>
                <td>${vuln.name}</td>
                <td>${vuln.location}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${report.successfulPayloads && report.successfulPayloads.length > 0 ? `
        <h2>Successful Injection Payloads</h2>
        <div class="detail-section">
          <p>The following payloads were confirmed to be successful during testing:</p>
          ${report.successfulPayloads.map((payload: string) => `
            <code class="successful-payload">${payload}</code>
          `).join('')}
          <p>These payloads should be fixed as a priority.</p>
        </div>
        ` : ''}
        
        <h2>Detailed Findings</h2>
        ${report.vulnerabilities.map((vuln: any) => `
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
          ${logoHtml}
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  const generateCsvData = (report: Report) => {
    let csv = 'ID,Severity,Name,Location,Payload,Description,Remediation\n';
    
    report.vulnerabilities.forEach(vuln => {
      const escapedDescription = `"${vuln.description.replace(/"/g, '""')}"`;
      const escapedRemediation = `"${vuln.remediation.replace(/"/g, '""')}"`;
      const escapedName = `"${vuln.name.replace(/"/g, '""')}"`;
      const escapedLocation = `"${vuln.location.replace(/"/g, '""')}"`;
      
      csv += `${vuln.id},${vuln.severity},${escapedName},${escapedLocation},${escapedDescription},${escapedRemediation}\n`;
    });
    
    if (report.portScan && report.portScan.length > 0) {
      csv += '\n\nPort Scan Results\n';
      csv += 'Port,Service,State,Version\n';
      report.portScan.forEach((port: any) => {
        csv += `${port.port},"${port.service}","${port.state}","${port.version}"\n`;
      });
    }
    
    if (report.securityHeaders && report.securityHeaders.length > 0) {
      csv += '\n\nSecurity Headers Analysis\n';
      csv += 'Header Name,Present,Value,Recommendation\n';
      report.securityHeaders.forEach((header: any) => {
        const escapedValue = header.value ? `"${header.value.replace(/"/g, '""')}"` : '""';
        const escapedRecommendation = `"${header.recommendation.replace(/"/g, '""')}"`;
        csv += `"${header.name}","${header.present ? 'Yes' : 'No'}",${escapedValue},${escapedRecommendation}\n`;
      });
    }
    
    if (report.successfulPayloads && report.successfulPayloads.length > 0) {
      csv += '\n\nSuccessful Injection Payloads\n';
      csv += 'Payload\n';
      report.successfulPayloads.forEach((payload: string) => {
        const escapedPayload = `"${payload.replace(/"/g, '""')}"`;
        csv += `${escapedPayload}\n`;
      });
    }
    
    return csv;
  };

  const handleDownload = (report: Report, format: 'html' | 'pdf' | 'csv') => {
    if (format === 'html') {
      const htmlContent = generateHtmlReport(report);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${report.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "HTML Report downloaded",
        description: "Your HTML report has been downloaded to your device",
      });
    } else if (format === 'csv') {
      const csv = generateCsvData(report);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${report.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "CSV Report downloaded",
        description: "Your CSV report has been downloaded to your device",
      });
    } else if (format === 'pdf') {
      const htmlContent = generateHtmlReport(report);
      
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
      
      printWindow.onload = () => {
        printWindow.print();
        
        toast({
          title: "PDF Report ready",
          description: "Your report has been processed for PDF download",
        });
      };
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === "Draft") {
      return <Badge variant="outline">Draft</Badge>;
    } else if (status === "Finalized") {
      return <Badge className="bg-green-500">Finalized</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Security Reports</h1>
              <p className="text-gray-600 mt-1">View and download your security assessment reports</p>
            </div>
            <div className="flex mt-4 md:mt-0 gap-3">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Existing Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Existing Report</DialogTitle>
                    <DialogDescription>
                      Import an existing security report for editing and customization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <LogoUpload 
                      onLogoUploaded={handleLogoUploaded} 
                      initialLogo={reportLogo}
                      buttonText="Upload Company Logo"
                    />
                    <FileUpload onFileUploaded={handleFileUploaded} />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Supported formats: PDF, HTML. After upload, you'll be able to edit the report content.
                  </p>
                </DialogContent>
              </Dialog>
              
              <Button 
                className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/80"
                onClick={() => navigate("/scan")}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Scan
              </Button>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Report Library</CardTitle>
              <CardDescription>Access all your saved security reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by URL or report ID"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Scan Type</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="quick">Quick Scan</SelectItem>
                      <SelectItem value="standard">Standard Scan</SelectItem>
                      <SelectItem value="full">Full Scan</SelectItem>
                      <SelectItem value="imported">Imported Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Status</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="finalized">Finalized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Target URL</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Vulnerabilities</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.id}</TableCell>
                          <TableCell>{formatDate(report.scanDate)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{report.targetUrl}</TableCell>
                          <TableCell>{report.scanType}</TableCell>
                          <TableCell>{getStatusBadge(report.reportStatus)}</TableCell>
                          <TableCell>{formatTime(report.scanTime)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {report.summary.critical > 0 && (
                                <Badge className="bg-red-500">{report.summary.critical} Critical</Badge>
                              )}
                              {report.summary.high > 0 && (
                                <Badge className="bg-orange-500">{report.summary.high} High</Badge>
                              )}
                              {report.summary.medium > 0 && (
                                <Badge className="bg-yellow-500">{report.summary.medium} Medium</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewReport(report)}
                                title="View Report"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(report, 'pdf')}
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(report, 'html')}
                                title="Download HTML"
                              >
                                <File className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditReport(report)}
                                title="Edit Report"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">No reports found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
