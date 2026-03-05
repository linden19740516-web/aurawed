# 数据库相关文件

此文件夹包含 AuraWed AI婚礼策划平台 的数据库结构和配置。

## 文件说明

- `schema.sql` - Supabase 数据库表结构
- `seed.sql` - 初始测试数据
- `config.example.js` - 数据库配置示例

## 使用方法

1. 在 Supabase 创建一个新项目
2. 运行 `schema.sql` 创建表结构
3. 可选运行 `seed.sql` 添加测试数据
4. 复制 `env.local.example` 为 `.env.local` 并填入配置
