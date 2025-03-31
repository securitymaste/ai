
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white py-8 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-[#0EA5E9]" />
            <span className="text-lg font-bold">AI-Shield Scan</span>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>Powered by ProtectAI's open-source tools</p>
            <p className="mt-1">© {new Date().getFullYear()} AI-Shield Scan. All rights reserved.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
