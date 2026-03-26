import type { TTSConfig, TTSRequest, TTSResponse } from './types';

const DEFAULT_BASE_URL = 'https://api-bj.minimaxi.com/v1/t2a_v2';

export async function textToSpeech(
  config: TTSConfig,
  request: TTSRequest
): Promise<ArrayBuffer> {
  const url = `${config.baseUrl || DEFAULT_BASE_URL}`;

  console.log('Sending TTS request to:', url);
  console.log('Request:', JSON.stringify(request, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', [...response.headers.entries()]);

  const responseText = await response.text();
  console.log('Response body:', responseText);

  if (!response.ok) {
    throw new Error(`TTS API Error: ${response.status} - ${responseText}`);
  }

  let data: TTSResponse;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Failed to parse response: ${responseText}`);
  }

  if (data.base_resp?.status_code !== 0) {
    throw new Error(`TTS Error: ${data.base_resp?.status_code} - ${data.base_resp?.status_msg || 'Unknown error'}`);
  }

  if (!data.data?.audio) {
    throw new Error('No audio data in response');
  }

  // Decode hex string to ArrayBuffer
  const hex = data.data.audio;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }

  return bytes.buffer;
}

// Convert ArrayBuffer to Blob URL for audio playback
export function createAudioUrl(arrayBuffer: ArrayBuffer, mimeType: string = 'audio/mp3'): string {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
}

// Hex to ArrayBuffer conversion utility
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}
