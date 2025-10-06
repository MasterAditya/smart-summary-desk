import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InputSection } from "@/components/TextAnalyzer/InputSection";
import { ResultsSection } from "@/components/TextAnalyzer/ResultsSection";
import { HistoryPanel } from "@/components/TextAnalyzer/HistoryPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface AnalysisResult {
  summary_short: string;
  summary_medium: string;
  summary_detailed: string;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  keywords: Array<{ word: string; importance: number }>;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (text: string, inputType: "text" | "pdf" | "url") => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-text", {
        body: { text, inputType },
      });

      if (error) {
        console.error("Analysis error:", error);
        toast.error(error.message || "Failed to analyze text");
        return;
      }

      setResult(data);
      toast.success("Analysis complete!");
      
      // Refresh history panel by forcing a re-render
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Text Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered text analysis & insights
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Input & Results */}
          <div className="lg:col-span-2 space-y-8">
            <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
            <ResultsSection result={result} />
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <HistoryPanel key={result?.sentiment} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by Lovable AI • Free Gemini models until Oct 13, 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;