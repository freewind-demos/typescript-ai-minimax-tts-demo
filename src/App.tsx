import { useRef, useState } from 'react'
import {
  ConfigProvider,
  Card,
  Form,
  Input,
  Select,
  Slider,
  Button,
  Alert,
  Space,
  Tag,
  Tooltip,
  Collapse,
  Switch,
  Typography,
} from 'antd'
import { AudioOutlined, PlayCircleOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons'
import type { TTSConfig, TTSRequest } from './types'
import { textToSpeech, createAudioUrl } from './api'
import { VOICES, VOICE_PREVIEW_TEXT, voicePreviewSrc } from './voicePresets'

const { TextArea } = Input
const { Paragraph, Text } = Typography

const MODELS = [
  { value: 'speech-2.8-hd', label: 'speech-2.8-hd' },
  { value: 'speech-2.8-turbo', label: 'speech-2.8-turbo' },
  { value: 'speech-2.6-hd', label: 'speech-2.6-hd' },
  { value: 'speech-2.6-turbo', label: 'speech-2.6-turbo' },
  { value: 'speech-02-hd', label: 'speech-02-hd' },
  { value: 'speech-02-turbo', label: 'speech-02-turbo' },
  { value: 'speech-01-hd', label: 'speech-01-hd' },
  { value: 'speech-01-turbo', label: 'speech-01-turbo' },
]

const EMOTIONS = [
  { value: '', label: '自动（由模型根据文本选择）' },
  { value: 'happy', label: '开心' },
  { value: 'sad', label: '悲伤' },
  { value: 'angry', label: '愤怒' },
  { value: 'calm', label: '平静' },
  { value: 'whisper', label: '低语（2.6 系列；2.8 不支持）' },
  { value: 'fearful', label: '恐惧' },
  { value: 'disgusted', label: '厌恶' },
  { value: 'surprised', label: '惊讶' },
  { value: 'fluent', label: '流畅（2.6 系列）' },
]

const LANGUAGE_BOOST_OPTIONS = [
  { value: '', label: '不设置（默认）' },
  { value: 'auto', label: 'auto 自动检测' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Chinese,Yue', label: 'Chinese,Yue' },
  { value: 'English', label: 'English' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
]

const SAMPLE_RATES = [
  { value: 8000, label: '8000 Hz' },
  { value: 16000, label: '16000 Hz' },
  { value: 22050, label: '22050 Hz' },
  { value: 24000, label: '24000 Hz' },
  { value: 32000, label: '32000 Hz' },
  { value: 44100, label: '44100 Hz' },
]

const BITRATES = [
  { value: 32000, label: '32 kbps' },
  { value: 64000, label: '64 kbps' },
  { value: 128000, label: '128 kbps (推荐)' },
  { value: 256000, label: '256 kbps' },
]

const FORMATS = [
  { value: 'mp3', label: 'MP3 (推荐)' },
  { value: 'pcm', label: 'PCM' },
  { value: 'flac', label: 'FLAC' },
  { value: 'wav', label: 'WAV' },
]

const CHANNEL_OPTIONS = [
  { value: 1, label: '单声道 (1)' },
  { value: 2, label: '立体声 (2)' },
]

const SOUND_EFFECTS = [
  { value: '', label: '无' },
  { value: 'spacious_echo', label: 'spacious_echo' },
  { value: 'auditorium_echo', label: 'auditorium_echo' },
  { value: 'lofi_telephone', label: 'lofi_telephone' },
  { value: 'robotic', label: 'robotic' },
]

const SPEED_PRESETS = [
  { label: '0.5x 慢速', value: 0.5 },
  { label: '0.75x 较慢', value: 0.75 },
  { label: '1.0x 正常', value: 1.0 },
  { label: '1.25x 较快', value: 1.25 },
  { label: '1.5x 快速', value: 1.5 },
  { label: '2.0x 极快', value: 2.0 },
]

const DEFAULT_TEXT =
  '欢迎使用 MiniMax 文本转语音。<#0.5#>这里插入了半秒停顿。speech-2.8 系列可在英文里用 (sighs) 这类插入音。'

const TEXT_MARKER_HELP = `【停顿】在可读片段之间插入 <#x#>，x 为停顿秒数，范围 0.01～99.99（最多两位小数）。标记须夹在可读文字之间，不能连续两个标记相邻。
示例：你好<#0.3#>世界

【插入音】仅 speech-2.8-hd / speech-2.8-turbo 支持，写在英文等正文中，例如：
(laughs) (chuckle) (coughs) (clear-throat) (groans) (breath) (pant) (inhale) (exhale) (gasps) (sniffs) (sighs) (snorts) (burps) (lip-smacking) (humming) (hissing) (emm) (sneezes)

【发音替换】见下方「发音词典」；或在官网文档查阅 pronunciation_dict.tone 格式。`

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('speech-2.8-hd')
  const [voiceId, setVoiceId] = useState('male-qn-qingse')
  const [speed, setSpeed] = useState(1)
  const [vol, setVol] = useState(1)
  const [pitch, setPitch] = useState(0)
  const [emotion, setEmotion] = useState('')
  const [text, setText] = useState(DEFAULT_TEXT)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [languageBoost, setLanguageBoost] = useState('')
  const [textNormalization, setTextNormalization] = useState(false)
  const [latexRead, setLatexRead] = useState(false)
  const [subtitleEnable, setSubtitleEnable] = useState(false)

  const [sampleRate, setSampleRate] = useState(32000)
  const [bitrate, setBitrate] = useState(128000)
  const [format, setFormat] = useState('mp3')
  const [channel, setChannel] = useState<1 | 2>(1)

  const [pronunciationText, setPronunciationText] = useState('')
  const [voiceModifyEnabled, setVoiceModifyEnabled] = useState(false)
  const [vmPitch, setVmPitch] = useState(0)
  const [vmIntensity, setVmIntensity] = useState(0)
  const [vmTimbre, setVmTimbre] = useState(0)
  const [soundEffects, setSoundEffects] = useState('')

  /** 下拉内嵌原生 audio 会被 rc-Select 吃掉事件；改用按钮 + Audio API */
  const dropdownPreviewRef = useRef<HTMLAudioElement | null>(null)
  const playDropdownVoicePreview = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    dropdownPreviewRef.current?.pause()
    const a = new Audio(voicePreviewSrc(id))
    dropdownPreviewRef.current = a
    void a.play().catch(() => {
      /* 用户未交互或资源失败时忽略 */
    })
  }

  const handleSynthesize = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }
    if (!text.trim()) {
      setError('请输入要转换的文本')
      return
    }
    if (text.length > 10000) {
      setError('文本不能超过 10000 字符')
      return
    }

    setLoading(true)
    setAudioUrl(null)
    setError(null)

    const config: TTSConfig = {
      apiKey: apiKey.trim(),
      baseUrl: 'https://api-bj.minimaxi.com/v1/t2a_v2',
    }

    const voiceSetting: TTSRequest['voice_setting'] = {
      voice_id: voiceId,
      speed,
      vol,
      pitch,
    }
    if (emotion) {
      voiceSetting.emotion = emotion as NonNullable<TTSRequest['voice_setting']>['emotion']
    }
    if (textNormalization) {
      voiceSetting.text_normalization = true
    }
    if (latexRead) {
      voiceSetting.latex_read = true
    }

    const toneLines = pronunciationText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)

    const request: TTSRequest = {
      model,
      text: text.trim(),
      voice_setting: voiceSetting,
      audio_setting: {
        format: format as 'mp3' | 'pcm' | 'flac' | 'wav',
        sample_rate: sampleRate as 8000 | 16000 | 22050 | 24000 | 32000 | 44100,
        bitrate: bitrate as 32000 | 64000 | 128000 | 256000,
        channel,
      },
    }

    if (languageBoost) {
      request.language_boost = languageBoost
    }
    if (subtitleEnable) {
      request.subtitle_enable = true
    }
    if (toneLines.length > 0) {
      request.pronunciation_dict = { tone: toneLines }
    }

    const useVm = voiceModifyEnabled || Boolean(soundEffects)
    if (useVm) {
      request.voice_modify = {
        pitch: vmPitch,
        intensity: vmIntensity,
        timbre: vmTimbre,
      }
      if (soundEffects) {
        request.voice_modify.sound_effects = soundEffects as NonNullable<
          TTSRequest['voice_modify']
        >['sound_effects']
      }
    }

    try {
      const buffer = await textToSpeech(config, request)
      const url = createAudioUrl(buffer, `audio/${format}`)
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
          title={
            <>
              <AudioOutlined /> MiniMax TTS Demo
            </>
          }
          style={{ maxWidth: 880, margin: '0 auto' }}
          extra={
            <a href="https://platform.minimaxi.com" target="_blank" rel="noopener noreferrer">
              获取 API Key
            </a>
          }
        >
          <div
            style={{
              background: '#e6f7ff',
              padding: '12px 16px',
              borderRadius: 6,
              marginBottom: 16,
              border: '1px solid #91d5ff',
            }}
          >
            <Space wrap>
              <span style={{ fontWeight: 500 }}>API 文档:</span>
              <a
                href="https://platform.minimaxi.com/docs/api-reference/speech-t2a-http"
                target="_blank"
                rel="noopener noreferrer"
              >
                T2A HTTP
              </a>
              <span style={{ color: '#999' }}>|</span>
              <a href="https://platform.minimaxi.com" target="_blank" rel="noopener noreferrer">
                MiniMax Platform
              </a>
            </Space>
          </div>
          <Form layout="vertical">
            <Form.Item label="API Key" required>
              <Input.Password
                placeholder="输入您的 MiniMax API Key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="模型">
              <Select value={model} onChange={setModel} options={MODELS} showSearch optionFilterProp="label" />
            </Form.Item>

            <Form.Item
              label={
                <>
                  音色
                  <Tooltip title={`下方为预生成试听（无需点「生成语音」）。试听文案：${VOICE_PREVIEW_TEXT}`}>
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Space wrap align="center" style={{ width: '100%' }}>
                  <Select
                    style={{ minWidth: 280, maxWidth: '100%', flex: 1 }}
                    value={voiceId}
                    onChange={setVoiceId}
                    options={VOICES}
                    showSearch
                    optionFilterProp="label"
                    popupMatchSelectWidth={false}
                    styles={{ popup: { root: { minWidth: 360 } } }}
                    optionRender={option => (
                      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
                        <span>{option.label}</span>
                        <Button
                          type="link"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => playDropdownVoicePreview(e, String(option.value))}
                        >
                          试听
                        </Button>
                      </Space>
                    )}
                  />
                  <audio
                    key={voiceId}
                    controls
                    controlsList="nodownload"
                    src={voicePreviewSrc(voiceId)}
                    style={{ width: 280, height: 36, verticalAlign: 'middle' }}
                  />
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  当前选中音色旁为预生成试听。展开下拉后点每项右侧「试听」播放（下拉内嵌原生播放器会被菜单拦截，故改为按钮）。
                </Text>
              </Space>
            </Form.Item>

            <Form.Item
              label={
                <>
                  语速: {speed}
                  <Tooltip title="voice_setting.speed，范围 0.5～2，整段统一语速">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </>
              }
            >
              <Space wrap>
                <Slider style={{ width: 220 }} min={0.5} max={2} step={0.05} value={speed} onChange={setSpeed} />
                {SPEED_PRESETS.map(preset => (
                  <Tag
                    key={preset.value}
                    color={speed === preset.value ? 'blue' : 'default'}
                    onClick={() => setSpeed(preset.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {preset.label}
                  </Tag>
                ))}
              </Space>
            </Form.Item>

            <Form.Item
              label={
                <>
                  音量: {vol}
                  <Tooltip title="voice_setting.vol，范围 (0, 10]，默认 1">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </>
              }
            >
              <Slider min={0.1} max={10} step={0.1} value={vol} onChange={setVol} />
            </Form.Item>

            <Form.Item
              label={
                <>
                  音调（半音）: {pitch}
                  <Tooltip title="voice_setting.pitch，范围 -12～12，0 为原调">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </>
              }
            >
              <Slider min={-12} max={12} step={1} value={pitch} onChange={setPitch} />
            </Form.Item>

            <Form.Item
              label={
                <>
                  情感 emotion
                  <Tooltip title="留空则文档说明为模型按文本自动选情绪；也可手动指定">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </>
              }
            >
              <Select
                value={emotion ?? ''}
                onChange={v => setEmotion(v ?? '')}
                options={EMOTIONS}
                allowClear
                placeholder="选择情感"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="音频格式">
              <Space wrap>
                <Select value={format} onChange={setFormat} options={FORMATS} style={{ width: 150 }} />
                <Select
                  value={sampleRate}
                  onChange={setSampleRate}
                  options={SAMPLE_RATES}
                  style={{ width: 140 }}
                />
                <Select value={bitrate} onChange={setBitrate} options={BITRATES} style={{ width: 150 }} />
                <Select value={channel} onChange={v => setChannel(v as 1 | 2)} options={CHANNEL_OPTIONS} style={{ width: 140 }} />
              </Space>
            </Form.Item>

            <Collapse
              defaultActiveKey={['markers']}
              items={[
                {
                  key: 'markers',
                  label: (
                    <span>
                      <BookOutlined /> 正文内标记说明（须手动写在「输入文本」里）
                    </span>
                  ),
                  children: (
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>
                      {TEXT_MARKER_HELP}
                    </Paragraph>
                  ),
                },
                {
                  key: 'advanced',
                  label: '高级参数（language_boost、字幕、发音词典、音色效果等）',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Form.Item label="language_boost" style={{ marginBottom: 0 }}>
                        <Select
                          value={languageBoost}
                          onChange={setLanguageBoost}
                          options={LANGUAGE_BOOST_OPTIONS}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Space wrap>
                        <Space>
                          <Text>文本规范化 text_normalization</Text>
                          <Switch checked={textNormalization} onChange={setTextNormalization} />
                          <Tooltip title="中英文数字等规范化，略增延迟">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                        <Space>
                          <Text>朗读 LaTeX latex_read</Text>
                          <Switch checked={latexRead} onChange={setLatexRead} />
                          <Tooltip title="仅中文；公式用 $$ 包裹，见官方文档">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                        <Space>
                          <Text>生成字幕 subtitle_enable</Text>
                          <Switch checked={subtitleEnable} onChange={setSubtitleEnable} />
                        </Space>
                      </Space>
                      <Form.Item
                        label={
                          <>
                            发音词典 pronunciation_dict.tone（每行一条）
                            <Tooltip title='例如：omg/oh my god 或中文多音字规则，详见官方文档'>
                              <InfoCircleOutlined style={{ marginLeft: 6 }} />
                            </Tooltip>
                          </>
                        }
                      >
                        <TextArea
                          rows={3}
                          placeholder="每行一条，例如：omg/oh my god"
                          value={pronunciationText}
                          onChange={e => setPronunciationText(e.target.value)}
                        />
                      </Form.Item>
                      <div>
                        <Space align="center" wrap>
                          <Switch checked={voiceModifyEnabled} onChange={setVoiceModifyEnabled} />
                          <Text strong>音色效果 voice_modify</Text>
                          <Tooltip title="与官方控制台「更深亮、强弱、鼻音清脆」等对应；打开开关可调滑块，或仅选下方环境音效">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                        <div style={{ marginTop: 12 }}>
                          <Text type="secondary">sound_effects（可选，选中即会带上 voice_modify）</Text>
                          <Select
                            value={soundEffects}
                            onChange={setSoundEffects}
                            options={SOUND_EFFECTS}
                            style={{ width: 280, marginTop: 8 }}
                            allowClear
                            placeholder="环境音效"
                          />
                        </div>
                        {(voiceModifyEnabled || Boolean(soundEffects)) && (
                          <div style={{ marginTop: 16 }}>
                            <Text type="secondary">pitch / intensity / timbre（-100～100）</Text>
                            <Text>更深亮 pitch: {vmPitch}</Text>
                            <Slider min={-100} max={100} value={vmPitch} onChange={setVmPitch} />
                            <Text>强弱 intensity: {vmIntensity}</Text>
                            <Slider min={-100} max={100} value={vmIntensity} onChange={setVmIntensity} />
                            <Text>鼻音清脆 timbre: {vmTimbre}</Text>
                            <Slider min={-100} max={100} value={vmTimbre} onChange={setVmTimbre} />
                          </div>
                        )}
                      </div>
                    </Space>
                  ),
                },
              ]}
            />

            <Form.Item
              label={
                <>
                  输入文本
                  <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>(最多 10000 字符)</span>
                </>
              }
            >
              <TextArea
                rows={5}
                placeholder="输入要转换的文本；停顿与插入音见上方「正文内标记说明」"
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
