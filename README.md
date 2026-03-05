# AuraWed AI - 沉浸式婚礼美学策划平台

> 将繁琐的婚礼需求采集转化为一场"心理学驱动的浪漫主义冒险"

## 平台预览

### 1. 入口页面 (首页)
![首页](https://raw.githubusercontent.com/your-repo/aurawed-screenshot.png)

### 2. C端 - 新人入口 (故事引擎)
![新人页面](https://raw.githubusercontent.com/your-repo/aurawed-couple.png)

### 3. B端 - 策划师工作台
![策划师页面](https://raw.githubusercontent.com/your-repo/aurawed-planner.png)

---

## 项目结构

```
aurawed-ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── auth/register/       # 用户注册接口
│   │   └── wedding/plan/        # 婚礼方案生成接口
│   ├── couple/                  # C端新人页面
│   │   └── page.tsx             # 故事引擎交互
│   ├── planner/                 # B端策划师页面
│   │   └── page.tsx             # 项目管理/工作台
│   ├── globals.css              # 全局样式 (暗奢金)
│   ├── layout.tsx               # 根布局
│   └── page.tsx                # 首页/入口选择
│
├── lib/                         # 核心服务库
│   ├── auth.ts                  # 用户认证 (邀请码验证)
│   ├── supabase.ts              # Supabase 数据库客户端
│   ├── llm-service.ts           # LLM 服务 (Claude/OpenAI)
│   └── image-service.ts         # 图像生成服务
│
├── public/                      # 静态资源
├── package.json                 # 项目依赖
├── tailwind.config.js          # Tailwind 配置 (暗色主题)
├── tsconfig.json                # TypeScript 配置
├── next.config.js              # Next.js 配置
└── env.local.example           # 环境变量示例
```

---

## 功能说明

### C端 - 新人入口
- ✅ 4步心理故事选择
- ✅ 心理标签收集与映射
- ✅ 美学风格智能推荐
- ✅ 婚礼方案结果展示

### B端 - 策划师入口
- ✅ 邀请码注册限制
- ✅ 项目列表管理
- ✅ AI 助手入口
- ✅ 客户管理（开发中）

### 核心引擎
- ✅ 心理标签 → 美学风格 映射表
- ✅ 黑名单过滤（禁止灯带/极简金属框架）
- ✅ 策划师 Prompt（通感描述 + 高光仪式）
- ✅ 设计师 Prompt（材质肌理 + 自然光影）

---

## 快速开始

### 1. 安装依赖
```bash
cd aurawed-ai
npm install
```

### 2. 配置环境变量
复制 `env.local.example` 为 `.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Anon Key
ANTHROPIC_API_KEY=你的Claude API Key
```

### 3. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000

### 4. 构建生产版本
```bash
npm run build
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 + React 18 |
| 样式 | Tailwind CSS + Framer Motion |
| 后端 | Next.js API Routes |
| 数据库 | Supabase (PostgreSQL) |
| LLM | Claude 3.5 / GPT-4o |
| 图像生成 | Midjourney / Stable Diffusion |

---

## B端限制机制

策划师入驻需要邀请码：
- 邀请码存储在 `invite_codes` 表
- 检查：是否存在、是否已使用、是否过期
- 用户类型存储在 `user_profiles` 表

---

## 黑名单系统 (AuraWed 核心约束)

以下元素在生成方案时**强制禁用**：
- ❌ LED strips / 灯带
- ❌ minimalist metal frame / 极简金属框架
- ❌ linear lighting / 线性灯光

替代方案：
- ✅ 烛光、点状洗墙灯、自然漏光
- ✅ 建筑废墟感、自然生长植物、丝绸垂吊
- ✅ 暖调氛围光、丁达尔效应、胶片感光效

---

## 页面访问

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | B端/C端入口选择 |
| 新人端 | `/couple` | 故事引擎交互 |
| 策划师端 | `/planner` | 工作台 |

---

*Built with ❤️ for extraordinary wedding experiences*
