// MiniMax TTS API Types

export interface TTSConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface VoiceSetting {
  voice_id: string;
  speed?: number;
  vol?: number;
  pitch?: number;
  emotion?: 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'calm' | 'fluent' | 'whisper';
}

export interface AudioSetting {
  sample_rate?: 8000 | 16000 | 22050 | 24000 | 32000 | 44100;
  bitrate?: 32000 | 64000 | 128000 | 256000;
  format?: 'mp3' | 'pcm' | 'flac' | 'wav';
  channel?: 1 | 2;
}

export interface TTSRequest {
  model: string;
  text: string;
  stream?: boolean;
  voice_setting?: VoiceSetting;
  audio_setting?: AudioSetting;
  output_format?: 'url' | 'hex';
}

export interface TTSResponse {
  data?: {
    audio?: string;
    subtitle_file?: string;
    status?: number;
  };
  extra_info?: {
    audio_length?: number;
    audio_sample_rate?: number;
    audio_size?: number;
    bitrate?: number;
    audio_format?: string;
    audio_channel?: number;
    usage_characters?: number;
    word_count?: number;
  };
  trace_id?: string;
  base_resp?: {
    status_code: number;
    status_msg?: string;
  };
}

// Available voice IDs (verified working)
export const VOICE_IDS = {
  // Verified working voice IDs
  'male-qn-qingse': '中文男声-青年',
  'female-tianmei': '中文女声-甜美',
  // Other available voice IDs
  'male-qn-qingse_v2': '中文男声-青年v2',
  'male-qn-qianxian': '中文男声-青年先',
  'female-yunyang': '中文女声-云扬',
  'male-zhangwei': '中文男声-张伟',
  'female-tianmei_v2': '中文女声-甜美v2',
  'male-shawn': '英文男声',
  'female-alice': '英文女声',
} as const;

export type VoiceId = keyof typeof VOICE_IDS;
