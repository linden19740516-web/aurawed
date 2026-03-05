# AI 服务模块

此文件夹包含 AI 相关的服务代码：

- `openai.ts` - OpenAI GPT 接口
- `anthropic.ts` - Anthropic Claude 接口
- `image.ts` - 图片生成服务
- `prompts.ts` - AI 提示词模板

## 使用前配置

在 `.env.local` 中配置以下环境变量：

```
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```
