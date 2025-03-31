
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScanForm from "@/components/ScanForm";
import ScanResults from "@/components/ScanResults";
import LogoUpload from "@/components/LogoUpload";
import FileUpload from "@/components/FileUpload";
import ReportEditor from "@/components/ReportEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileText, Edit } from "lucide-react";

const Scan = () => {
  const [scanResults, setScanResults] = useState<any>(null);
  const [reportLogo, setReportLogo] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    data: string;
    type: string;
    name: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("newScan");
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [editableReport, setEditableReport] = useState({
    id: `report-${Date.now()}`,
    title: "Security Assessment Report",
    executiveSummary: "<p>This security assessment was conducted to identify vulnerabilities in the target system.</p>",
    methodology: "<p>The assessment utilized a combination of automated tools and manual testing techniques.</p>",
    findings: "<p>Several vulnerabilities were identified during the assessment. Details are provided below.</p>",
    conclusion: "<p>Based on the findings, the overall security posture of the target system requires attention.</p>",
    recommendations: "<p>It is recommended to address the identified vulnerabilities according to their severity levels.</p>",
    logo: null
  });
  
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're coming from another page with a results object
    if (location.state?.results) {
      setScanResults(location.state.results);
      
      // If editMode is true, automatically open the editor
      if (location.state?.editMode) {
        setShowReportEditor(true);
      }
    }
    
    // Load logo from localStorage if available
    const savedLogo = localStorage.getItem('reportLogo');
    if (savedLogo) {
      setReportLogo(savedLogo);
      setEditableReport(prev => ({
        ...prev,
        logo: savedLogo
      }));
    }
    
    // Load saved report from localStorage if available
    const savedReport = localStorage.getItem('editableReport');
    if (savedReport) {
      setEditableReport(JSON.parse(savedReport));
    }
  }, [location]);

  const handleScanComplete = (results: any) => {
    setScanResults(results);
    
    // Save to localStorage
    const scanReports = JSON.parse(localStorage.getItem('scanReports') || '[]');
    const existingReportIndex = scanReports.findIndex((report: any) => report.id === results.id);
    
    if (existingReportIndex >= 0) {
      // Update existing report
      scanReports[existingReportIndex] = results;
    } else {
      // Add new report
      scanReports.push(results);
    }
    
    localStorage.setItem('scanReports', JSON.stringify(scanReports));
  };

  const handleNewScan = () => {
    setScanResults(null);
    setActiveTab("newScan");
    setShowReportEditor(false);
  };
  
  const handleLogoUploaded = (logoData: string) => {
    setReportLogo(logoData);
    localStorage.setItem('reportLogo', logoData);
    
    // Also update the editable report logo
    setEditableReport(prev => ({
      ...prev,
      logo: logoData
    }));
  };
  
  const handleFileUploaded = (fileData: { data: string, type: string, name: string }) => {
    setUploadedFile(fileData);
    
    // If it's a file upload, switch to results view with a placeholder
    if (!scanResults) {
      // Create a placeholder scan result based on file name
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
      
      setScanResults(mockResults);
      
      // Automatically open the editor for imported reports
      setTimeout(() => {
        handleOpenEditor();
      }, 100);
    } else {
      // Update existing results with imported file
      setScanResults({
        ...scanResults,
        importedFile: fileData
      });
    }
  };
  
  const handleOpenEditor = () => {
    setShowReportEditor(true);
    
    // If we have scan results, use them to pre-populate the editor
    if (scanResults) {
      // Generate a title based on the scan target or imported file
      const title = scanResults.targetUrl 
        ? `Security Assessment Report - ${scanResults.targetUrl}`
        : scanResults.importedFile?.name
          ? `Imported Report - ${scanResults.importedFile.name.replace(/\.(html|pdf)$/, '')}`
          : "Security Assessment Report";
          
      // Generate findings section from vulnerabilities if they exist
      let findingsHtml = "<p>Key findings from the security assessment:</p>";
      if (scanResults.vulnerabilities && scanResults.vulnerabilities.length > 0) {
        findingsHtml = "<ul>";
        scanResults.vulnerabilities.forEach((vuln: any) => {
          findingsHtml += `<li>
            <strong>${vuln.name} (${vuln.severity})</strong>
            <p>${vuln.description}</p>
            <p>Location: ${vuln.location}</p>
            <p>Remediation: ${vuln.remediation}</p>
          </li>`;
        });
        findingsHtml += "</ul>";
      }
      
      setEditableReport(prev => ({
        ...prev,
        id: scanResults.id || `report-${Date.now()}`,
        title: title,
        findings: findingsHtml,
        logo: reportLogo
      }));
    }
  };
  
  const handleSaveReport = (reportData: any) => {
    setEditableReport(reportData);
    localStorage.setItem('editableReport', JSON.stringify(reportData));
    
    // Also update the scan results report status to reflect changes
    if (scanResults) {
      const updatedResults = {
        ...scanResults,
        reportStatus: "Draft",
        reportData: reportData
      };
      
      setScanResults(updatedResults);
      
      // Update in localStorage
      const scanReports = JSON.parse(localStorage.getItem('scanReports') || '[]');
      const existingReportIndex = scanReports.findIndex((report: any) => report.id === updatedResults.id);
      
      if (existingReportIndex >= 0) {
        // Update existing report
        scanReports[existingReportIndex] = updatedResults;
      } else {
        // Add new report
        scanReports.push(updatedResults);
      }
      
      localStorage.setItem('scanReports', JSON.stringify(scanReports));
    }
    
    toast({
      title: "Report saved",
      description: "Your customized report has been saved"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          {showReportEditor ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-[#0F172A]">
                    Report Editor
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Customize your security report with complete control over content
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowReportEditor(false)}>
                  Back to Results
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <ReportEditor 
                    initialData={editableReport}
                    onSave={handleSaveReport}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0F172A]">
                  {scanResults ? "Scan Results" : "New Security Scan"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {scanResults 
                    ? "Review the vulnerabilities detected in your application" 
                    : "Begin a new security assessment of your application"}
                </p>
              </div>
              
              {scanResults ? (
                <>
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LogoUpload 
                      onLogoUploaded={handleLogoUploaded} 
                      initialLogo={reportLogo}
                    />
                    <FileUpload onFileUploaded={handleFileUploaded} />
                    <div className="flex items-center justify-center">
                      <Button
                        className="w-full h-full flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0EA5E9]/80"
                        onClick={handleOpenEditor}
                      >
                        <Edit className="h-4 w-4" />
                        Open Full Report Editor
                      </Button>
                    </div>
                  </div>
                  <ScanResults 
                    results={scanResults} 
                    onNewScan={handleNewScan}
                    reportLogo={reportLogo}
                    uploadedFile={uploadedFile} 
                  />
                </>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="newScan">New Scan</TabsTrigger>
                        <TabsTrigger value="uploadReport">Upload Report</TabsTrigger>
                      </TabsList>
                      <TabsContent value="newScan" className="p-6">
                        <ScanForm onScanComplete={handleScanComplete} />
                      </TabsContent>
                      <TabsContent value="uploadReport" className="p-6">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium">Upload Existing Report</h3>
                            <p className="text-sm text-gray-500">
                              Import an existing security report in PDF or HTML format to customize and share
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <LogoUpload 
                              onLogoUploaded={handleLogoUploaded} 
                              initialLogo={reportLogo}
                            />
                            <FileUpload onFileUploaded={handleFileUploaded} />
                          </div>
                          
                          <div className="border-t pt-4">
                            <Button
                              className="w-full flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0EA5E9]/80"
                              onClick={handleOpenEditor}
                            >
                              <FileText className="h-4 w-4" />
                              Create Custom Report from Scratch
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Scan;
