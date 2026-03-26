# MiniMax TTS Demo

基于 MiniMax API 的文本转语音演示项目。

## 功能

- 调用 MiniMax Speech-02 模型进行文本转语音
- 支持多种中文/英文音色
- 可调节语速和情感
- 直接在浏览器中播放生成的音频

## 使用方法

### 1. 安装依赖

```bash
pnpm install
```

### 2. 获取 API Key

访问 [MiniMax Platform](https://platform.minimaxi.com) 注册并获取 API Key。

### 3. 启动开发服务器

```bash
pnpm dev
```

### 4. 使用

1. 打开浏览器访问 `http://localhost:5173`
2. 输入您的 MiniMax API Key
3. 选择模型、音色、语速和情感
4. 输入要转换的文本
5. 点击"生成语音"按钮
6. 等待生成完成后，点击播放按钮试听

## API 文档

MiniMax TTS API 文档: https://platform.minimaxi.com/docs/api-reference/speech-t2a-http

### 主要参数

- **model**: `speech-02-hd` (高质量) / `speech-02-turbo` (快速)
- **voice_id**: 音色 ID
- **speed**: 语速 0.5-2.0
- **emotion**: 情感 (happy, sad, angry, calm, whisper)
- **text**: 要转换的文本（最多 10,000 字符）

### 特殊语法

- 停顿控制: `<#3#>` (3 秒停顿)
- 情感标签: `(laughs)`, (sighs)`, `(coughs)`
