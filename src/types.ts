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
  /** 中英文文本规范化，略增延迟 */
  text_normalization?: boolean;
  /** 朗读 LaTeX（仅中文，公式用 $$ 包裹） */
  latex_read?: boolean;
}

export interface AudioSetting {
  sample_rate?: 8000 | 16000 | 22050 | 24000 | 32000 | 44100;
  bitrate?: 32000 | 64000 | 128000 | 256000;
  format?: 'mp3' | 'pcm' | 'flac' | 'wav';
  channel?: 1 | 2;
  force_cbr?: boolean;
}

export interface PronunciationDict {
  tone?: string[];
}

export interface VoiceModify {
  pitch?: number;
  intensity?: number;
  timbre?: number;
  sound_effects?: 'spacious_echo' | 'auditorium_echo' | 'lofi_telephone' | 'robotic';
}

export interface TTSRequest {
  model: string;
  text: string;
  stream?: boolean;
  voice_setting?: VoiceSetting;
  audio_setting?: AudioSetting;
  pronunciation_dict?: PronunciationDict;
  voice_modify?: VoiceModify;
  language_boost?: string | null;
  subtitle_enable?: boolean;
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

/** 与 demo 下拉及 public/voice-previews 预生成试听一致（须与账号 system 音色一致） */
export const VOICE_IDS = {
  'male-qn-qingse': '中文男声 · 青涩青年',
  'female-tianmei': '中文女声 · 甜美',
  'male-qn-jingying': '中文男声 · 精英青年',
  'female-yujie': '中文女声 · 御姐',
  'female-shaonv': '中文女声 · 少女',
  'male-qn-badao': '中文男声 · 霸道青年',
  'female-chengshu': '中文女声 · 成熟',
  English_Trustworthy_Man: 'English · Trustworthy Man',
  English_Graceful_Lady: 'English · Graceful Lady',
} as const;

export type VoiceId = keyof typeof VOICE_IDS;
