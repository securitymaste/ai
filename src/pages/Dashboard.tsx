
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ScanReport {
  id: string;
  scanDate: string;
  targetUrl: string;
  scanType: string;
  vulnerabilities: any[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  status?: string;
  reportStatus?: string;
  toolsUsed: string[];
}

const Dashboard = () => {
  const [recentScans, setRecentScans] = useState<ScanReport[]>([]);
  const [vulnerabilityData, setVulnerabilityData] = useState([
    { name: "Critical", value: 0, color: "#DC2626" },
    { name: "High", value: 0, color: "#F97316" },
    { name: "Medium", value: 0, color: "#FBBF24" },
    { name: "Low", value: 0, color: "#2DD4BF" },
  ]);
  
  const [toolsData, setToolsData] = useState([
    { name: "ModelScan", value: 0, color: "#8B5CF6" },
    { name: "VulnHuntr", value: 0, color: "#0EA5E9" },
    { name: "OWASP ZAP", value: 0, color: "#10B981" },
    { name: "Nikto", value: 0, color: "#6B7280" },
  ]);

  useEffect(() => {
    // Load reports from local storage
    const storedReports = localStorage.getItem('scanReports');
    let reports: ScanReport[] = [];
    
    if (storedReports) {
      reports = JSON.parse(storedReports);
      // Sort by date (newest first)
      reports.sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime());
      // Take only the most recent ones
      setRecentScans(reports.slice(0, 5));
    }

    // Calculate vulnerability data from all scans
    if (reports.length > 0) {
      const criticalCount = reports.reduce((total, report) => total + report.summary.critical, 0);
      const highCount = reports.reduce((total, report) => total + report.summary.high, 0);
      const mediumCount = reports.reduce((total, report) => total + report.summary.medium, 0);
      const lowCount = reports.reduce((total, report) => total + report.summary.low, 0);
      
      setVulnerabilityData([
        { name: "Critical", value: criticalCount, color: "#DC2626" },
        { name: "High", value: highCount, color: "#F97316" },
        { name: "Medium", value: mediumCount, color: "#FBBF24" },
        { name: "Low", value: lowCount, color: "#2DD4BF" },
      ]);
      
      // Count tools usage
      const toolsCount: Record<string, number> = {
        "ModelScan": 0,
        "VulnHuntr": 0,
        "OWASP ZAP": 0,
        "Nikto": 0
      };
      
      reports.forEach(report => {
        report.toolsUsed.forEach(tool => {
          if (toolsCount.hasOwnProperty(tool)) {
            toolsCount[tool]++;
          }
        });
      });
      
      setToolsData([
        { name: "ModelScan", value: toolsCount["ModelScan"], color: "#8B5CF6" },
        { name: "VulnHuntr", value: toolsCount["VulnHuntr"], color: "#0EA5E9" },
        { name: "OWASP ZAP", value: toolsCount["OWASP ZAP"], color: "#10B981" },
        { name: "Nikto", value: toolsCount["Nikto"], color: "#6B7280" },
      ]);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Security Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your security scans and vulnerabilities</p>
            </div>
            <Link to="/scan">
              <Button className="mt-4 md:mt-0 bg-[#0EA5E9] hover:bg-[#0EA5E9]/80">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Scan
              </Button>
            </Link>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard 
              title="Total Scans"
              value={recentScans.length.toString()}
              icon={<Shield className="h-5 w-5 text-[#0EA5E9]" />}
              description="All scans"
            />
            <SummaryCard 
              title="Open Vulnerabilities"
              value={vulnerabilityData.reduce((total, item) => total + item.value, 0).toString()}
              icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
              description="Across all scans"
            />
            <SummaryCard 
              title="Critical Issues"
              value={vulnerabilityData[0].value.toString()}
              icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
              description="Require immediate action"
            />
            <SummaryCard 
              title="Last Scan"
              value={recentScans.length > 0 ? formatDate(recentScans[0].scanDate) : "No scans yet"}
              icon={<Clock className="h-5 w-5 text-gray-500" />}
              description={recentScans.length > 0 ? recentScans[0].targetUrl : ""}
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Breakdown</CardTitle>
                <CardDescription>Distribution by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vulnerabilityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {vulnerabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detection Tools</CardTitle>
                <CardDescription>Vulnerabilities found by each tool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={toolsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {toolsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Scans Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest security assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vulnerabilities</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScans.length > 0 ? (
                    recentScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-medium">{scan.id}</TableCell>
                        <TableCell>{formatDate(scan.scanDate)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{scan.targetUrl}</TableCell>
                        <TableCell>
                          <Badge className={scan.reportStatus === "Finalized" ? "bg-green-500" : "bg-blue-500"}>
                            {scan.reportStatus || "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {scan.summary.critical > 0 && (
                              <Badge className="bg-red-500">{scan.summary.critical} Critical</Badge>
                            )}
                            {scan.summary.high > 0 && (
                              <Badge className="bg-orange-500">{scan.summary.high} High</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link to="/scan" state={{ results: scan }}>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">No scan history found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-2 bg-gray-100 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
