
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isLoggedIn = false, onLogout = () => {} }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#0F172A] text-white py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-[#0EA5E9]" />
          <span className="text-xl font-bold">AI-Shield Scan</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="hover:text-[#0EA5E9] transition-colors">
            Dashboard
          </Link>
          <Link to="/scan" className="hover:text-[#0EA5E9] transition-colors">
            New Scan
          </Link>
          <Link to="/reports" className="hover:text-[#0EA5E9] transition-colors">
            Reports
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" className="text-white" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-6 py-4 bg-[#0F172A] border-t border-[#1E293B]">
          <div className="flex flex-col space-y-4">
            <Link to="/dashboard" className="hover:text-[#0EA5E9] transition-colors" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/scan" className="hover:text-[#0EA5E9] transition-colors" onClick={() => setIsMenuOpen(false)}>
              New Scan
            </Link>
            <Link to="/reports" className="hover:text-[#0EA5E9] transition-colors" onClick={() => setIsMenuOpen(false)}>
              Reports
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
