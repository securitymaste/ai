
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle, Server, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={false} onLogout={() => {}} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <Shield className="h-16 w-16 text-[#0EA5E9]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AI-Powered Security Testing Platform
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Detect vulnerabilities in your applications and AI models using cutting-edge
                VAPT & DAST scanning technology powered by ProtectAI tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/80 text-white px-8 py-6 text-lg">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#0F172A]">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<AlertTriangle className="h-10 w-10 text-[#0EA5E9]" />}
                title="VAPT & DAST Scanning"
                description="Automated security scans using ProtectAI VulnHuntr, OWASP ZAP, and more."
              />
              <FeatureCard 
                icon={<Shield className="h-10 w-10 text-[#0EA5E9]" />}
                title="AI-Powered Risk Analysis"
                description="Use ProtectAI ModelScan to analyze AI model vulnerabilities with intelligent risk classification."
              />
              <FeatureCard 
                icon={<Server className="h-10 w-10 text-[#0EA5E9]" />}
                title="Detailed Reports"
                description="Generate comprehensive security reports in PDF & CSV formats with fix recommendations."
              />
              <FeatureCard 
                icon={<Lock className="h-10 w-10 text-[#0EA5E9]" />}
                title="Secure User Management"
                description="Role-based access control with secure authentication and user management."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#0F172A]">
              How It Works
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-start gap-8 mb-12">
                <div className="bg-[#0EA5E9] rounded-full h-12 w-12 flex items-center justify-center text-white font-bold shrink-0 mx-auto md:mx-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0F172A] text-center md:text-left">Enter Target URL</h3>
                  <p className="text-gray-700">
                    Simply input the URL of the web application or API endpoint you want to scan for vulnerabilities.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start gap-8 mb-12">
                <div className="bg-[#0EA5E9] rounded-full h-12 w-12 flex items-center justify-center text-white font-bold shrink-0 mx-auto md:mx-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0F172A] text-center md:text-left">Run Automated Scan</h3>
                  <p className="text-gray-700">
                    Our platform uses ProtectAI's ModelScan and VulnHuntr along with other tools to perform comprehensive security testing.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start gap-8 mb-12">
                <div className="bg-[#0EA5E9] rounded-full h-12 w-12 flex items-center justify-center text-white font-bold shrink-0 mx-auto md:mx-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0F172A] text-center md:text-left">AI Analysis & Classification</h3>
                  <p className="text-gray-700">
                    Our AI engine analyzes detected vulnerabilities and classifies them by severity (Critical, High, Medium, Low).
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="bg-[#0EA5E9] rounded-full h-12 w-12 flex items-center justify-center text-white font-bold shrink-0 mx-auto md:mx-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0F172A] text-center md:text-left">Get Detailed Report</h3>
                  <p className="text-gray-700">
                    Download a comprehensive security report with vulnerabilities found, risk levels, and recommendations to fix issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#0F172A] text-white py-16 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Applications?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start using our AI-powered security platform today and protect your applications from vulnerabilities.
            </p>
            <Link to="/register">
              <Button className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/80 text-white px-8 py-6 text-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-[#0F172A]">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default Index;
