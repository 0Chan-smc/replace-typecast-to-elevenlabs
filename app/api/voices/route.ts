import { NextRequest } from 'next/server'
import { ELEVENLABS_CONFIG } from '@/lib/constants'
import type { VoicesResponse } from '@/types/voice'

export const GET = async (request: NextRequest) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return Response.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const pageToken = searchParams.get('page_token')

    let url = `${ELEVENLABS_CONFIG.BASE_URL}/voices`
    if (pageToken) {
      url += `?page_token=${pageToken}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // 5분 캐싱
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs Voices API Error Status:', response.status)
      console.error('ElevenLabs Voices API Error Data:', errorData)

      if (response.status === 429) {
        return Response.json({ error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
      }

      if (response.status === 401) {
        return Response.json({ error: 'API 인증에 실패했습니다.' }, { status: 401 })
      }

      let errorMessage = '음성 목록을 가져오는데 실패했습니다.'
      try {
        const errorJson = JSON.parse(errorData)
        errorMessage = errorJson.detail || errorJson.message || errorMessage
      } catch {
        if (errorData) {
          errorMessage = errorData
        }
      }

      return Response.json(
        {
          error: errorMessage,
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      )
    }

    const data: VoicesResponse = await response.json()

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Voices API Route Error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}