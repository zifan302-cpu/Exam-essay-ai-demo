# Exam Essay AI Demo

面向考研英语大作文场景的作文辅助 AI 初版项目。

项目当前包含三部分：

- `demo/`：可直接打开的静态网页 demo。
- `docs/`：项目目标、MVP 边界、老板版商业计划和 PDF。
- `scripts/`：本地预览与 Vercel 静态构建脚本。

## 初版定位

初版 demo 已经接入阿里云百炼 Qwen。没有配置 API Key 时会使用本地规则和模板模拟生成结果；配置 `DASHSCOPE_API_KEY` 后，会优先调用 Qwen 生成考研英语大作文。

- 考生是否愿意输入题目和自己的思路。
- 输出是否比通用 AI 更贴合考研英语大作文审美。
- “提纲 + 高分稿 + 句型 + 词汇 + 阅卷诊断”是否能形成学习价值。

## 本地体验

直接打开：

```text
demo/index.html
```

或启动本地服务：

```bash
npm run dev
```

默认地址：

```text
http://localhost:4173
```

## 构建

```bash
npm run build
```

构建后会生成：

```text
dist/
```

线上首页来自 `demo/`。默认构建只发布 demo，不发布 `docs/` 里的商业计划和 PDF。

如果确实需要把文档也放进本地构建产物，可以运行：

```bash
npm run build:with-docs
```

## 部署到 Vercel

这个项目已经加入 `vercel.json`，Vercel 配置如下：

- Framework Preset：Other
- Build Command：`npm run build`
- Output Directory：`dist`
- Install Command：默认即可

项目也加入了 `.vercelignore`，默认排除 `docs/`、`dist/`、`node_modules/` 和临时文件，避免把商业计划等本地材料上传到 Vercel。

## Qwen API 配置

当前真实大模型调用只接入“考研英语大作文”场景。雅思和四六级入口已从页面移除。

推荐主模型：

```text
qwen3.7-plus
```

理由：它在千问文本生成模型中处于质量与成本的平衡位，适合作为考研英语作文主生成模型。需要更低成本压测时可改为 `qwen3.6-flash`；需要更高质量精修时可改为 `qwen3.7-max`。

生成链路当前采用质量优先策略：

```text
题目与用户想法 -> 内部提纲 -> 高分稿 -> 阅卷评分 -> 修订后输出
```

输出包含：

```text
高分稿 / 成文提纲 / 可迁移句型 / 词汇表达 / 阅卷评分与修改建议
```

在 Vercel 项目的 Environment Variables 中配置：

```text
DASHSCOPE_API_KEY=你的阿里云百炼 API Key
DASHSCOPE_MODEL=qwen3.7-plus
```

前端不会直接保存 API Key。真实调用会经过 Vercel Serverless Function：

```text
api/generate-postgraduate.js
```

该接口使用阿里云百炼 OpenAI 兼容模式调用：

```text
https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

### 方式一：Vercel 网页导入

1. 把本项目推到 GitHub。
2. 在 Vercel 中选择 `Add New Project`。
3. 导入 GitHub 仓库。
4. 确认 Build Command 为 `npm run build`。
5. 确认 Output Directory 为 `dist`。
6. 点击 Deploy。

### 方式二：Vercel CLI

如果本机已安装并登录 Vercel CLI：

```bash
vercel
vercel --prod
```

## 手机使用

部署成功后，用手机浏览器打开 Vercel 链接即可。页面已加入基础 PWA 配置，支持在移动浏览器中添加到主屏幕。

## 建议下一步

1. 接入真实大模型 API，把本地模板替换为可控 prompt 流程。
2. 增加评分规则库，例如 IELTS Task Response、Coherence and Cohesion、Lexical Resource、Grammar Range and Accuracy。
3. 引入用户作品库，沉淀个人常用句型、薄弱项和复用表达。
4. 做 20-50 名真实考生测试，验证付费意愿和学习留存。
