
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  Heading3,
  Type
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WysiwygEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const WysiwygEditor = ({ 
  initialContent, 
  onContentChange, 
  placeholder = "Start typing...",
  minHeight = "200px"
}: WysiwygEditorProps) => {
  const [editorContent, setEditorContent] = useState(initialContent);
  const { toast } = useToast();
  const editorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialContent && editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    
    // Get the updated content and pass it to the parent
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onContentChange(newContent);
    }
    
    // Force focus back to the editor
    editorRef.current?.focus();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onContentChange(newContent);
    }
  };

  // Function to handle pasting plain text only
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    
    // Insert at cursor position
    document.execCommand('insertText', false, text);
  };

  return (
    <Card className="w-full">
      <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('bold')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('italic')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('underline')}>
          <Underline className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('formatBlock', '<h1>')}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('formatBlock', '<h2>')}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('formatBlock', '<h3>')}>
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('formatBlock', '<p>')}>
          <Type className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('insertUnorderedList')}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('insertOrderedList')}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('justifyLeft')}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('justifyCenter')}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand('justifyRight')}>
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-0">
        <div
          ref={editorRef}
          contentEditable="true"
          className="p-4 focus:outline-none overflow-auto"
          style={{ minHeight }}
          onInput={handleContentChange}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: initialContent || placeholder }}
        />
      </CardContent>
    </Card>
  );
};

export default WysiwygEditor;
