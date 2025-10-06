import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, FileText, Link2, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface HistoryItem {
  id: string;
  input_type: string;
  sentiment: string;
  created_at: string;
  input_text: string;
}

export function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("id, input_type, sentiment, created_at, input_text")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "url":
        return <Link2 className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-positive text-positive-foreground";
      case "neutral":
        return "bg-neutral text-neutral-foreground";
      case "negative":
        return "bg-negative text-negative-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No analysis history yet. Start by analyzing some text!
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.input_type)}
                      <span className="text-sm font-medium capitalize">
                        {item.input_type}
                      </span>
                    </div>
                    <Badge className={getSentimentColor(item.sentiment)}>
                      {item.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    {item.input_text.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}