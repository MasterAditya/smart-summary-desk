InsightLens
Project Overview

InsightLens is an AI-powered text analysis and summarization dashboard designed for professionals and students. Users can paste text, upload PDFs, or provide URLs to get:

Smart summaries (short, medium, detailed)

Sentiment analysis (positive, neutral, negative with confidence scores)

Keyword extraction (top 10 most relevant keywords)

The app helps users quickly digest large amounts of information and extract actionable insights.

Features

Analyze text from multiple sources: copy-paste, PDF upload, or URL

Summarization at three levels of detail

Sentiment analysis with confidence scores

Keyword extraction and ranking

History of recent analyses (persistent locally)

Dark/Light mode toggle for better UX

Responsive design for desktop and mobile

Tech Stack

Frontend: React, TypeScript, TailwindCSS, shadcn-ui

Backend: Node.js (or FastAPI if you replace backend)

Deployment: Vercel

Other Tools: Local storage / mock database for history

Deployment

The app is deployed on Vercel and can be accessed here:
Live Demo

Installation (for local development)
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd insightlens

# Install dependencies
npm install

# Start development server
npm run dev

Future Improvements

Integrate real LLM API (OpenAI, Mistral, or HuggingFace) for smarter summarization

PDF export of summaries and reports

User authentication and personalized history storage
