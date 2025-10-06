import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, inputType } = await req.json();
    console.log("Analyzing text:", { textLength: text?.length, inputType });

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze with Lovable AI using tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional text analysis assistant. Analyze text for summarization, sentiment, and keywords."
          },
          {
            role: "user",
            content: `Analyze this text:\n\n${text}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_text",
              description: "Analyze text and return structured analysis",
              parameters: {
                type: "object",
                properties: {
                  summary_short: {
                    type: "string",
                    description: "A brief 1-2 sentence summary"
                  },
                  summary_medium: {
                    type: "string",
                    description: "A moderate 3-4 sentence summary"
                  },
                  summary_detailed: {
                    type: "string",
                    description: "A detailed 5-7 sentence summary with key points"
                  },
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "negative"],
                    description: "Overall sentiment of the text"
                  },
                  sentiment_score: {
                    type: "number",
                    description: "Confidence score between 0 and 1"
                  },
                  keywords: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        word: { type: "string" },
                        importance: { type: "number", description: "Score between 1-10" }
                      },
                      required: ["word", "importance"]
                    },
                    description: "Top 10 keywords with importance scores"
                  }
                },
                required: ["summary_short", "summary_medium", "summary_detailed", "sentiment", "sentiment_score", "keywords"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_text" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to analyze text" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log("Analysis complete:", {
      sentiment: analysis.sentiment,
      keywordsCount: analysis.keywords?.length
    });

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedAnalysis, error: dbError } = await supabase
      .from("analysis_history")
      .insert({
        input_text: text.substring(0, 1000), // Store first 1000 chars
        input_type: inputType || "text",
        summary_short: analysis.summary_short,
        summary_medium: analysis.summary_medium,
        summary_detailed: analysis.summary_detailed,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentiment_score,
        keywords: analysis.keywords,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
    } else {
      console.log("Analysis saved to database:", savedAnalysis.id);
    }

    return new Response(
      JSON.stringify({
        ...analysis,
        id: savedAnalysis?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-text function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});