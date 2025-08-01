# 构建问题修复说明

## 问题描述

在 Cloudflare Pages 部署过程中遇到以下错误：

```
Error: Output directory ".output/public" not found.
Failed: build output directory not found
```

## 问题原因

`wrangler.toml` 文件中配置的输出目录与 Nuxt 实际构建输出目录不匹配：

- 配置的输出目录：`.output/public`
- 实际构建输出目录：`dist`

## 解决方案

### 1. 修复 wrangler.toml 配置

将 `wrangler.toml` 文件中的输出目录配置从：

```toml
pages_build_output_dir = ".output/public"
```

修改为：

```toml
pages_build_output_dir = "dist"
```

### 2. 更新部署文档

更新了 `DEPLOYMENT.md` 文件中的构建输出目录说明。

### 3. 创建部署脚本

创建了 `deploy.sh` 脚本，提供一键构建和部署功能。

## 验证修复

修复后的构建过程：

1. ✅ 依赖安装成功
2. ✅ Nuxt 构建成功
3. ✅ 输出目录 `dist` 正确生成
4. ✅ 所有必要文件都在正确位置

## 使用方法

### 快速部署

```bash
./deploy.sh
```

### 手动部署

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist
```

### 本地预览

```bash
npx wrangler pages dev dist
```

## 文件变更

- `wrangler.toml` - 修复输出目录配置
- `DEPLOYMENT.md` - 更新部署说明
- `deploy.sh` - 新增部署脚本
- `BUILD_FIX.md` - 本文档

## 注意事项

1. 确保 Cloudflare Pages 项目设置中的构建输出目录也设置为 `dist`
2. 如果使用自动部署，推送代码到 GitHub 后会自动触发构建
3. 构建过程大约需要 1-2 分钟完成
