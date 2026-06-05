import { processMessage } from '@/lib/chat/chat-engine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json(
        { error: 'Pesan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // Limit message length to prevent abuse
    const trimmedMessage = message.trim().slice(0, 500);

    // Process through the chat engine
    const response = processMessage(trimmedMessage, context || {});

    return Response.json({
      success: true,
      data: {
        text: response.text,
        suggestions: response.suggestions || [],
        mealCards: response.mealCards || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan pada server chat.' },
      { status: 500 }
    );
  }
}
