# Exam Essay AI Demo

面向雅思、考研英语、四六级等二语考试写作场景的作文辅助 AI 初版项目。

项目当前包含三部分：

- `demo/`：可直接打开的静态网页 demo。
- `docs/`：项目目标、MVP 边界、老板版商业计划和 PDF。
- `scripts/`：本地预览与 Vercel 静态构建脚本。

## 初版定位

初版 demo 不是一个真实 AI 后端产品，而是一个可演示的产品原型。它用本地规则和模板模拟生成结果，用来验证：

- 考生是否愿意输入题目和自己的思路。
- 输出是否比通用 AI 更贴合考试审美与个人水平。
- “作文 + 结构 + 可迁移句型 + 词汇包 + 诊断建议”是否能形成学习价值。

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
