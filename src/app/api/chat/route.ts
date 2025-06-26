import { NextRequest, NextResponse } from 'next/server';
import { chatbotService } from '@/services/chatbot';

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Send message to chatbot service
    const response = await chatbotService.sendMessage(message, chatHistory || []);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return quick responses and welcome message
  try {
    return NextResponse.json({
      success: true,
      welcomeMessage: chatbotService.getWelcomeMessage(),
      quickResponses: chatbotService.getQuickResponses()
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
