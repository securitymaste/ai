
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileType, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileUploadProps {
  onFileUploaded: (fileData: { data: string, type: string, name: string }) => void;
}

const FileUpload = ({ onFileUploaded }: FileUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<{ name: string, type: string } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'text/html'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or HTML file",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file less than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target?.result as string;
      setUploadedFile({ name: file.name, type: file.type });
      onFileUploaded({ 
        data: fileData, 
        type: file.type,
        name: file.name
      });
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemoveFile = () => {
    setUploadedFile(null);
    toast({
      title: "File removed",
    });
  };

  const getFileTypeLabel = (type: string) => {
    if (type === 'application/pdf') return 'PDF';
    if (type === 'text/html') return 'HTML';
    return 'Document';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="file-upload">Upload Existing Report</Label>
        <div className="flex items-center gap-4">
          <Input 
            id="file-upload"
            type="file" 
            accept=".pdf,.html"
            onChange={handleFileChange}
            className="w-full"
          />
          <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
            <FileType className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          You can upload an existing report in PDF or HTML format to include in your scan
        </p>
      </div>
      
      {uploadedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
          <div className="flex items-center gap-2">
            <FileType className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{uploadedFile.name}</p>
              <Badge variant="outline" className="mt-1">
                {getFileTypeLabel(uploadedFile.type)}
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveFile}
            className="h-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
