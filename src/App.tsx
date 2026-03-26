import { useState } from 'react'
import { ConfigProvider, Card, Form, Input, Select, Slider, Button, Alert } from 'antd'
import { AudioOutlined, PlayCircleOutlined } from '@ant-design/icons'
import type { TTSConfig, TTSRequest } from './types'
import { textToSpeech, createAudioUrl } from './api'

const { TextArea } = Input

const MODELS = [
  { value: 'speech-2.8-hd', label: 'Speech-2.8-HD' },
  { value: 'speech-2.6-hd', label: 'Speech-2.6-HD' },
  { value: 'speech-02-hd', label: 'Speech-02-HD' },
]

const VOICES = [
  { value: 'male-qn-qingse', label: '中文男声 - 青年' },
  { value: 'female-tianmei', label: '中文女声 - 甜美' },
  { value: 'female-yunyang', label: '中文女声 - 云扬' },
  { value: 'male-zhangwei', label: '中文男声 - 张伟' },
  { value: 'male-shawn', label: '英文男声' },
  { value: 'female-alice', label: '英文女声' },
]

const EMOTIONS = [
  { value: '', label: '标准' },
  { value: 'happy', label: '开心' },
  { value: 'sad', label: '悲伤' },
  { value: 'angry', label: '愤怒' },
  { value: 'calm', label: '平静' },
  { value: 'whisper', label: '低语' },
]

const DEFAULT_TEXT = '欢迎使用 MiniMax 文本转语音服务！这是一段演示文本，可以根据您的需求转换为自然流畅的语音输出。'

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('speech-02-hd')
  const [voiceId, setVoiceId] = useState('male-qn-qingse')
  const [speed, setSpeed] = useState(1)
  const [emotion, setEmotion] = useState('')
  const [text, setText] = useState(DEFAULT_TEXT)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSynthesize = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }
    if (!text.trim()) {
      setError('请输入要转换的文本')
      return
    }

    setLoading(true)
    setAudioUrl(null)
    setError(null)

    const config: TTSConfig = {
      apiKey: apiKey.trim(),
      baseUrl: 'https://api-bj.minimaxi.com/v1/t2a_v2',
    }

    const request: TTSRequest = {
      model,
      text: text.trim(),
      voice_setting: {
        voice_id: voiceId,
        speed,
        emotion: emotion as any || undefined,
      },
      audio_setting: {
        format: 'mp3',
        sample_rate: 32000,
        bitrate: 128000,
      },
    }

    try {
      const buffer = await textToSpeech(config, request)
      const url = createAudioUrl(buffer, 'audio/mp3')
      setAudioUrl(url)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfigProvider>
      <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
        <Card
          title={<><AudioOutlined /> MiniMax TTS Demo</>}
          style={{ maxWidth: 800, margin: '0 auto' }}
          extra={<a href="https://platform.minimaxi.com" target="_blank" rel="noopener noreferrer">获取 API Key</a>}
        >
          <Form layout="vertical">
            <Form.Item label="API Key" required>
              <Input.Password
                placeholder="输入您的 MiniMax API Key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="模型">
              <Select
                value={model}
                onChange={setModel}
                options={MODELS}
              />
            </Form.Item>

            <Form.Item label="音色">
              <Select
                value={voiceId}
                onChange={setVoiceId}
                options={VOICES}
              />
            </Form.Item>

            <Form.Item label={<span>语速: {speed}</span>}>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={speed}
                onChange={setSpeed}
              />
            </Form.Item>

            <Form.Item label="情感">
              <Select
                value={emotion}
                onChange={setEmotion}
                options={EMOTIONS}
                allowClear
              />
            </Form.Item>

            <Form.Item label="输入文本">
              <TextArea
                rows={4}
                placeholder="输入要转换的文本..."
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={10000}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={loading}
                onClick={handleSynthesize}
                block
                size="large"
              >
                生成语音
              </Button>
            </Form.Item>

            {audioUrl && (
              <Form.Item label="生成的语音">
                <audio src={audioUrl} controls style={{ width: '100%' }} />
              </Form.Item>
            )}

            {error && (
              <Form.Item>
                <Alert type="error" message={error} showIcon closable />
              </Form.Item>
            )}
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  )
}
