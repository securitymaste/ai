
import { useState, useEffect } from "react";
import WysiwygEditor from "./WysiwygEditor";
import LogoUpload from "./LogoUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  id: string;
  title: string;
  executiveSummary: string;
  methodology: string;
  findings: string;
  conclusion: string;
  recommendations: string;
  logo: string | null;
}

interface ReportEditorProps {
  initialData: ReportData;
  onSave: (data: ReportData) => void;
}

const ReportEditor = ({ initialData, onSave }: ReportEditorProps) => {
  const [reportData, setReportData] = useState<ReportData>(initialData);
  const [activeTab, setActiveTab] = useState("executive-summary");
  const { toast } = useToast();
  
  // Update form fields
  const handleTextChange = (field: keyof ReportData, value: string) => {
    setReportData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle logo upload
  const handleLogoUpload = (logoData: string) => {
    setReportData((prev) => ({
      ...prev,
      logo: logoData
    }));
  };
  
  // Save changes
  const handleSave = () => {
    onSave(reportData);
    toast({
      title: "Report saved",
      description: "All changes have been saved"
    });
  };
  
  // Generate HTML for download
  const generateHtmlReport = () => {
    const logoHtml = reportData.logo ? 
      `<div class="report-logo-corner">
        <img src="${reportData.logo}" alt="Company Logo" style="max-height: 60px; max-width: 150px;">
      </div>
      <div class="report-logo-header">
        <img src="${reportData.logo}" alt="Company Logo" style="max-height: 100px; max-width: 200px;">
      </div>` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title} - Security Report</title>
        <style>
          @media print {
            .page-break {
              page-break-before: always;
            }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 2rem; 
            line-height: 1.6; 
            color: #333;
            counter-reset: page;
          }
          h1, h2, h3 { color: #0F172A; }
          .header { 
            margin-bottom: 2rem; 
            position: relative; 
            text-align: center;
          }
          .report-logo-corner { 
            position: absolute; 
            top: 0; 
            right: 0; 
          }
          .report-logo-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .section { margin-bottom: 2rem; }
          .footer { 
            margin-top: 3rem; 
            font-size: 0.875rem; 
            color: #6B7280; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 1rem; 
            position: relative;
          }
          .footer::after {
            content: "Page " counter(page);
            counter-increment: page;
            position: absolute;
            bottom: 10px;
            right: 10px;
          }
          .page {
            position: relative;
          }
          .page:not(:first-child) .report-logo-corner {
            position: absolute;
            top: 0;
            right: 0;
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${logoHtml}
          <div class="header">
            <h1>${reportData.title}</h1>
            <p>Security Assessment Report</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Executive Summary</h2>
            ${reportData.executiveSummary}
          </div>
        </div>
        
        <div class="page-break"></div>
        <div class="page">
          <div class="report-logo-corner">
            ${reportData.logo ? `<img src="${reportData.logo}" alt="Company Logo" style="max-height: 60px; max-width: 150px;">` : ''}
          </div>
          <div class="section">
            <h2>Methodology</h2>
            ${reportData.methodology}
          </div>
        </div>
        
        <div class="page-break"></div>
        <div class="page">
          <div class="report-logo-corner">
            ${reportData.logo ? `<img src="${reportData.logo}" alt="Company Logo" style="max-height: 60px; max-width: 150px;">` : ''}
          </div>
          <div class="section">
            <h2>Findings</h2>
            ${reportData.findings}
          </div>
        </div>
        
        <div class="page-break"></div>
        <div class="page">
          <div class="report-logo-corner">
            ${reportData.logo ? `<img src="${reportData.logo}" alt="Company Logo" style="max-height: 60px; max-width: 150px;">` : ''}
          </div>
          <div class="section">
            <h2>Conclusion</h2>
            ${reportData.conclusion}
          </div>
          
          <div class="section">
            <h2>Recommendations</h2>
            ${reportData.recommendations}
          </div>
        </div>
        
        <div class="footer">
          <p>Security Assessment Report - Confidential</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${reportData.logo ? `<img src="${reportData.logo}" alt="Company Logo" style="max-height: 40px; max-width: 100px;">` : ''}
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  };
  
  // Download as HTML
  const downloadHtmlReport = () => {
    const htmlContent = generateHtmlReport();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.title.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Report downloaded",
      description: "Your HTML report has been downloaded to your device",
    });
  };
  
  // Download as PDF 
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="report-title">Report Title</Label>
          <Input
            id="report-title"
            value={reportData.title}
            onChange={(e) => handleTextChange('title', e.target.value)}
            className="mt-1"
            placeholder="Enter report title"
          />
        </div>
        <LogoUpload 
          onLogoUploaded={handleLogoUpload}
          initialLogo={reportData.logo}
          buttonText="Upload Company Logo"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
          <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="conclusion">Conclusion</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="executive-summary" className="pt-4">
          <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
          <p className="text-sm text-gray-500 mb-4">
            Provide a high-level summary of the security assessment, key findings, and overall risk posture.
          </p>
          <WysiwygEditor 
            initialContent={reportData.executiveSummary}
            onContentChange={(content) => handleTextChange('executiveSummary', content)}
            minHeight="300px"
          />
        </TabsContent>
        
        <TabsContent value="methodology" className="pt-4">
          <h3 className="text-lg font-medium mb-2">Methodology</h3>
          <p className="text-sm text-gray-500 mb-4">
            Explain the testing approach, tools used, and scope of the security assessment.
          </p>
          <WysiwygEditor 
            initialContent={reportData.methodology}
            onContentChange={(content) => handleTextChange('methodology', content)}
            minHeight="300px"
          />
        </TabsContent>
        
        <TabsContent value="findings" className="pt-4">
          <h3 className="text-lg font-medium mb-2">Findings</h3>
          <p className="text-sm text-gray-500 mb-4">
            Detail all vulnerabilities discovered, their severity, impact, and evidence.
          </p>
          <WysiwygEditor 
            initialContent={reportData.findings}
            onContentChange={(content) => handleTextChange('findings', content)}
            minHeight="400px"
          />
        </TabsContent>
        
        <TabsContent value="conclusion" className="pt-4">
          <h3 className="text-lg font-medium mb-2">Conclusion</h3>
          <p className="text-sm text-gray-500 mb-4">
            Summarize the overall security posture and risk assessment.
          </p>
          <WysiwygEditor 
            initialContent={reportData.conclusion}
            onContentChange={(content) => handleTextChange('conclusion', content)}
            minHeight="250px"
          />
        </TabsContent>
        
        <TabsContent value="recommendations" className="pt-4">
          <h3 className="text-lg font-medium mb-2">Recommendations</h3>
          <p className="text-sm text-gray-500 mb-4">
            Provide actionable steps to remediate the discovered vulnerabilities.
          </p>
          <WysiwygEditor 
            initialContent={reportData.recommendations}
            onContentChange={(content) => handleTextChange('recommendations', content)}
            minHeight="300px"
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between pt-4">
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          Save Report
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={downloadHtmlReport}
          >
            <File className="h-4 w-4" />
            HTML Report
          </Button>
          <Button 
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/80 flex items-center gap-1"
            onClick={downloadPdfReport}
          >
            <Download className="h-4 w-4" />
            PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;
