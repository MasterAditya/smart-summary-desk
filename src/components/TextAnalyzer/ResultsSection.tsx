import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Download, Smile, Meh, Frown, Tag } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  summary_short: string;
  summary_medium: string;
  summary_detailed: string;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  keywords: Array<{ word: string; importance: number }>;
}

interface ResultsSectionProps {
  result: AnalysisResult | null;
}

export function ResultsSection({ result }: ResultsSectionProps) {
  if (!result) return null;

  const sentimentConfig = {
    positive: {
      icon: Smile,
      color: "bg-positive text-positive-foreground",
      label: "Positive",
    },
    neutral: {
      icon: Meh,
      color: "bg-neutral text-neutral-foreground",
      label: "Neutral",
    },
    negative: {
      icon: Frown,
      color: "bg-negative text-negative-foreground",
      label: "Negative",
    },
  };

  const config = sentimentConfig[result.sentiment];
  const SentimentIcon = config.icon;

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      ...result,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analysis exported successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sentiment Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SentimentIcon className="h-5 w-5" />
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className={`${config.color} text-lg px-4 py-2`}>
                {config.label}
              </Badge>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">
                    {(result.sentiment_score * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={result.sentiment_score * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Top Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.keywords
                .sort((a, b) => b.importance - a.importance)
                .slice(0, 10)
                .map((kw, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-sm hover:scale-105 transition-transform"
                  >
                    {kw.word}
                    <span className="ml-1 text-xs opacity-70">
                      {kw.importance}
                    </span>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="short" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="short">Short</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="detailed">Detailed</TabsTrigger>
            </TabsList>
            <TabsContent value="short" className="mt-4">
              <p className="text-foreground leading-relaxed">
                {result.summary_short}
              </p>
            </TabsContent>
            <TabsContent value="medium" className="mt-4">
              <p className="text-foreground leading-relaxed">
                {result.summary_medium}
              </p>
            </TabsContent>
            <TabsContent value="detailed" className="mt-4">
              <p className="text-foreground leading-relaxed">
                {result.summary_detailed}
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}