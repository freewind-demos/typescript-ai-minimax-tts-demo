/** 与 scripts/generate-voice-previews.mjs 中的 voiceIds 保持同步（须为当前账号下存在的 system voice_id） */
export const VOICE_PREVIEW_TEXT = '欢迎你，很高兴见到你，My friend'

export const VOICES: { value: string; label: string }[] = [
  { value: 'male-qn-qingse', label: '中文男声 · 青涩青年' },
  { value: 'female-tianmei', label: '中文女声 · 甜美' },
  { value: 'male-qn-jingying', label: '中文男声 · 精英青年' },
  { value: 'female-yujie', label: '中文女声 · 御姐' },
  { value: 'female-shaonv', label: '中文女声 · 少女' },
  { value: 'male-qn-badao', label: '中文男声 · 霸道青年' },
  { value: 'female-chengshu', label: '中文女声 · 成熟' },
  { value: 'English_Trustworthy_Man', label: 'English · Trustworthy Man' },
  { value: 'English_Graceful_Lady', label: 'English · Graceful Lady' },
]

export function voicePreviewSrc(voiceId: string): string {
  const safe = encodeURIComponent(voiceId)
  return `${import.meta.env.BASE_URL}voice-previews/${safe}.mp3`
}
