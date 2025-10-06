import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Link2, Type, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface InputSectionProps {
  onAnalyze: (text: string, type: "text" | "pdf" | "url") => void;
  isLoading: boolean;
}

export function InputSection({ onAnalyze, isLoading }: InputSectionProps) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleTextAnalyze = () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }
    onAnalyze(text, "text");
  };

  const handleUrlAnalyze = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    // For demo, we'll just use the URL as text
    onAnalyze(`URL: ${url}`, "url");
  };

  const handleFileAnalyze = () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }
    // For demo, we'll use file info as text
    onAnalyze(`PDF File: ${file.name} (${file.size} bytes)`, "pdf");
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-lg border-border/50">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="text" className="gap-2">
            <Type className="h-4 w-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link2 className="h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Enter your text</Label>
            <Textarea
              id="text-input"
              placeholder="Paste your text here for analysis..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
          <Button
            onClick={handleTextAnalyze}
            disabled={isLoading || !text.trim()}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isLoading ? (
              <>Analyzing...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Text
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Upload PDF</Label>
            <Input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          <Button
            onClick={handleFileAnalyze}
            disabled={isLoading || !file}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isLoading ? (
              <>Analyzing...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze PDF
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-input">Enter URL</Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button
            onClick={handleUrlAnalyze}
            disabled={isLoading || !url.trim()}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isLoading ? (
              <>Analyzing...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze URL
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
}