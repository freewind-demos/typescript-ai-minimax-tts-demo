/**
 * 预生成 public/voice-previews/<voice_id>.mp3，与 src/voicePresets.ts 中 VOICES 保持一致。
 * 用法：MINIMAX_API_KEY=sk-xxx node scripts/generate-voice-previews.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'voice-previews')
const BASE_URL = 'https://api-bj.minimaxi.com/v1/t2a_v2'
const PREVIEW_TEXT = '欢迎你，很高兴见到你，My friend'

const voiceIds = [
  'male-qn-qingse',
  'female-tianmei',
  'male-qn-jingying',
  'female-yujie',
  'female-shaonv',
  'male-qn-badao',
  'female-chengshu',
  'English_Trustworthy_Man',
  'English_Graceful_Lady',
]

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return Buffer.from(bytes)
}

async function synth(apiKey, voiceId) {
  const body = {
    model: 'speech-2.8-hd',
    text: PREVIEW_TEXT,
    voice_setting: {
      voice_id: voiceId,
      speed: 1,
      vol: 1,
      pitch: 0,
    },
    audio_setting: {
      format: 'mp3',
      sample_rate: 32000,
      bitrate: 128000,
      channel: 1,
    },
  }
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  const raw = await res.text()
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${raw.slice(0, 500)}`)
  }
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(`Invalid JSON: ${raw.slice(0, 200)}`)
  }
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`API ${data.base_resp?.status_code}: ${data.base_resp?.status_msg}`)
  }
  const hex = data.data?.audio
  if (!hex || typeof hex !== 'string') {
    throw new Error('No audio hex in response')
  }
  return hexToBuffer(hex)
}

async function main() {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey?.trim()) {
    console.error('请设置环境变量 MINIMAX_API_KEY')
    process.exit(1)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const id of voiceIds) {
    const file = path.join(OUT_DIR, `${id}.mp3`)
    process.stdout.write(`生成 ${id} ... `)
    try {
      const buf = await synth(apiKey.trim(), id)
      fs.writeFileSync(file, buf)
      console.log(`ok (${buf.length} bytes)`)
    } catch (e) {
      console.log('失败')
      console.error(e.message || e)
    }
  }
  console.log('完成。输出目录:', OUT_DIR)
}

main()
