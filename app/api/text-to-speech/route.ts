import { NextRequest } from 'next/server';
import { ELEVENLABS_CONFIG } from '@/lib/constants';

export const POST = async (request: NextRequest) => {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: '텍스트가 필요합니다.' }, { status: 400 });
    }

    if (text.length > 5000) {
      return Response.json({ error: '텍스트는 5000자 이하로 입력해주세요.' }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return Response.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const startTime = Date.now();

    const response = await fetch(
      `${ELEVENLABS_CONFIG.BASE_URL}/text-to-speech/${ELEVENLABS_CONFIG.VOICE_ID}/stream?output_format=${ELEVENLABS_CONFIG.OUTPUT_FORMAT}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_CONFIG.MODEL_ID,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API Error:', errorData);
      
      if (response.status === 429) {
        return Response.json({ error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
      }
      
      if (response.status === 401) {
        return Response.json({ error: 'API 인증에 실패했습니다.' }, { status: 401 });
      }
      
      return Response.json({ error: '음성 생성에 실패했습니다.' }, { status: response.status });
    }

    const processingTime = Date.now() - startTime;

    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Processing-Time': processingTime.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
};