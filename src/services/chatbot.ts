import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class ChatbotService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, 
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });
  
  private systemPrompt = `You are CHTR Assistant, an AI chatbot for the CHTR (StockSim India) trading platform. You are knowledgeable about:

CORE EXPERTISE:
- Stock trading and investment strategies
- Indian stock market (NSE, BSE)
- Technical analysis and fundamental analysis  
- Stock price predictions and market trends
- Trading psychology and risk management
- Portfolio management
- The CHTR platform features and functionality

PLATFORM CONTEXT:
- CHTR is a virtual stock trading platform for the Indian market
- Users can practice trading with virtual money
- The platform has AI-powered stock price predictions using ML models
- Features include: trading simulator, portfolio tracking, predictions, market analysis
- Users can buy/sell stocks, view predictions, and track performance

CONVERSATION STYLE:
- Be friendly, helpful, and professional
- Use simple language that both beginners and experienced traders can understand
- Provide actionable insights when discussing stocks or trading
- Always mention that CHTR is a simulation platform for learning
- Include relevant emojis to make conversations engaging
- Keep responses concise but informative

IMPORTANT DISCLAIMERS:
- Always remind users that this is a simulation platform for learning
- Add disclaimers that past performance doesn't guarantee future results
- Mention that users should do their own research before real trading
- For stock recommendations, always add "This is for educational purposes only"

WHAT TO HELP WITH:
✅ Explaining trading concepts and strategies
✅ Discussing stock market trends and analysis
✅ Helping users understand CHTR platform features
✅ Providing educational content about investing
✅ Answering questions about specific stocks (educational context)
✅ Trading tips and best practices
✅ Market news and trends discussion

WHAT TO AVOID:
❌ Providing specific financial advice for real money
❌ Guaranteeing specific returns or outcomes
❌ Discussing topics unrelated to trading/stocks/CHTR platform
❌ Encouraging risky trading behavior

If asked about non-trading topics, politely redirect: "I'm here to help with trading, investing, and CHTR platform questions. How can I assist you with your trading journey? 📈"

Remember: Be encouraging about learning to trade while emphasizing the educational nature of the platform.`;

  async sendMessage(message: string, chatHistory: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      // Build conversation context
      const context = chatHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${this.systemPrompt}

Previous conversation:
${context}

User: ${message}
Assistant: Please provide a helpful, educational response.`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: text.trim()
      };

    } catch (error: any) {
      console.error('Chatbot service error:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble responding right now. Please try again in a moment. 🤖';
      
      // Provide more specific error messages based on error type
      if (error?.message?.includes('404')) {
        errorMessage = 'The AI model is temporarily unavailable. Please try again later. 🔄';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'There\'s an issue with the AI service configuration. Please contact support. ⚙️';
      } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
        errorMessage = 'AI service limit reached. Please try again later. ⏰';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network connection issue. Please check your internet and try again. 🌐';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Quick responses for common queries
  getQuickResponses(): string[] {
    return [
      "How do I start trading on CHTR?",
      "Explain technical analysis basics",
      "What are the best stocks for beginners?",
      "How do stop losses work?",
      "Tell me about portfolio diversification"
    ];
  }

  // Generate a welcome message
  getWelcomeMessage(): string {
    return "👋 Hi! I'm CHTR Assistant, your trading companion. I can help you with:\n\n📈 Trading strategies and market analysis\n💡 Understanding CHTR platform features\n📚 Learning investment concepts\n🎯 Stock market insights\n\nWhat would you like to know about trading or investing?";
  }
}

export const chatbotService = new ChatbotService();
