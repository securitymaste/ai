
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Image } from "lucide-react";

interface LogoUploadProps {
  onLogoUploaded: (logoData: string) => void;
  initialLogo?: string | null;
  buttonText?: string;
  containerClassName?: string;
}

const LogoUpload = ({ 
  onLogoUploaded, 
  initialLogo, 
  buttonText = "Upload Logo", 
  containerClassName = "" 
}: LogoUploadProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Load initial logo if provided
  useEffect(() => {
    if (initialLogo) {
      setLogoPreview(initialLogo);
    }
  }, [initialLogo]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, etc)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const logoData = event.target?.result as string;
      setLogoPreview(logoData);
      onLogoUploaded(logoData);
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded and will appear in reports",
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    onLogoUploaded("");
    toast({
      title: "Logo removed",
      description: "Your logo has been removed from reports",
    });
  };

  return (
    <div className={`space-y-4 ${containerClassName}`}>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="logo-upload">Report Logo</Label>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('logo-upload')?.click()}
            className="w-full flex justify-center items-center gap-2 h-10"
          >
            <Image className="h-4 w-4" />
            {buttonText}
          </Button>
          <Input 
            id="logo-upload"
            type="file" 
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This logo will appear in the top-right corner of each report page
        </p>
      </div>
      
      {logoPreview && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Logo Preview:</p>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleRemoveLogo}
              className="h-8 px-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
          <div className="border p-3 rounded-md inline-block bg-white">
            <img 
              src={logoPreview} 
              alt="Report Logo" 
              className="max-h-24 max-w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
