# R3F 2D 游戏项目运行指南

> 本文档提供项目的环境配置、运行命令和常见问题解决方案。

---

## 📋 环境要求

### 必需软件

| 软件 | 最低版本 | 推荐版本 | 当前版本 |
|------|----------|----------|----------|
| **Node.js** | 12.x | 14.x - 16.x | v24.12.0 ✅ |
| **npm** | 6.x | 7.x+ | 11.6.2 ✅ |
| **yarn** | 1.x | 1.22.x | 1.22.22 ✅ |

### 系统要求

- **操作系统**: Windows / macOS / Linux
- **浏览器**: Chrome, Firefox, Edge (支持 WebGL)
- **内存**: 至少 2GB 可用 RAM

---

## 🚀 快速开始

### 1. 安装依赖（首次运行）

如果 `node_modules` 文件夹不存在，需要先安装依赖：

```bash
# 使用 yarn（推荐）
yarn install

# 或使用 npm
npm install
```

### 2. 启动开发服务器

#### Windows 系统

```bash
# 方式 1：使用 yarn
cmd /c "set NODE_OPTIONS=--openssl-legacy-provider && yarn start"

# 方式 2：使用 npm
cmd /c "set NODE_OPTIONS=--openssl-legacy-provider && npm start"
```

#### macOS / Linux 系统

```bash
# 使用 yarn
NODE_OPTIONS=--openssl-legacy-provider yarn start

# 或使用 npm
NODE_OPTIONS=--openssl-legacy-provider npm start
```

### 3. 访问应用

开发服务器启动后，在浏览器中打开：

- **本地访问**: http://localhost:3002
- **局域网访问**: http://[你的IP]:3002

---

## 📦 可用脚本命令

项目的 `package.json` 中定义了以下命令：

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `yarn start` | 启动开发服务器 | 日常开发 |
| `yarn build` | 构建生产版本 | 部署前构建 |
| `yarn test` | 运行测试 | 测试代码 |
| `yarn init` | 初始化配置 | 首次设置 |
| `yarn config` | 查看配置 | 调试配置问题 |

### 完整命令示例

```bash
# 开发模式（需要添加 NODE_OPTIONS）
cmd /c "set NODE_OPTIONS=--openssl-legacy-provider && yarn start"

# 生产构建
cmd /c "set NODE_OPTIONS=--openssl-legacy-provider && yarn build"

# 查看配置
yarn config
```

---

## 🔧 常见问题与解决方案

### 问题 1: `error:0308010C:digital envelope routines::unsupported`

**原因**: Node.js 17+ 版本与 Webpack 4 的加密算法不兼容。

**解决方案**:

添加环境变量 `NODE_OPTIONS=--openssl-legacy-provider`：

```bash
# Windows
cmd /c "set NODE_OPTIONS=--openssl-legacy-provider && yarn start"

# macOS/Linux
NODE_OPTIONS=--openssl-legacy-provider yarn start
```

---

### 问题 2: `yarn: 无法加载文件...因为在此系统上禁止运行脚本`

**原因**: Windows PowerShell 脚本执行策略限制。

**解决方案 A（推荐）**: 使用 `cmd` 而不是 PowerShell

```bash
cmd /c yarn start
```

**解决方案 B**: 修改 PowerShell 执行策略（需要管理员权限）

```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 问题 3: 端口 3002 被占用

**错误信息**: `Port 3002 is already in use`

**解决方案**:

1. **找出并终止占用端口的进程**:
   ```bash
   # Windows
   netstat -ano | findstr :3002
   taskkill /PID [进程ID] /F
   
   # macOS/Linux
   lsof -ti:3002 | xargs kill -9
   ```

2. **或使用其他端口**（需要修改配置）

---

### 问题 4: 依赖安装失败

**错误信息**: `npm ERR!` 或 `yarn error`

**解决方案**:

1. **清除缓存**:
   ```bash
   # yarn
   yarn cache clean
   
   # npm
   npm cache clean --force
   ```

2. **删除 node_modules 并重新安装**:
   ```bash
   # Windows
   rmdir /s /q node_modules
   
   # macOS/Linux
   rm -rf node_modules
   
   # 重新安装
   yarn install
   ```

3. **检查网络连接**，考虑使用镜像源:
   ```bash
   # 设置淘宝镜像
   yarn config set registry https://registry.npmmirror.com
   ```

---

### 问题 5: TypeScript 类型检查错误

**解决方案**:

类型检查是非阻塞的，不影响运行。如需修复：

1. 查看具体错误信息
2. 根据提示修复类型定义
3. 或临时禁用类型检查（不推荐）

---

### 问题 6: 浏览器显示空白页

**排查步骤**:

1. **检查控制台错误**（F12 → Console）
2. **检查资源是否加载成功**（Network 选项卡）
3. **尝试硬刷新**: `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (macOS)
4. **检查浏览器支持**: 确保浏览器支持 WebGL

---

## 🌐 开发服务器配置

### 默认配置

- **主机**: `localhost`
- **端口**: `3002`
- **热重载**: ✅ 已启用
- **类型检查**: ✅ 已启用（非阻塞）
- **Source Maps**: ✅ 开发模式启用

### 访问方式

```
本地:      http://localhost:3002
局域网:    http://192.168.x.x:3002
```

### 自动打开浏览器

服务器启动后会显示访问地址，复制到浏览器即可访问。

---

## 📂 项目资源

### 游戏资源文件位置

```
src/assets/
├── player.png          # 玩家精灵图 (1.74 KB)
├── objects.png         # 场景物体精灵图 (2.66 KB)
├── footstep.png        # 脚步特效 (987 bytes)
├── ui.png              # UI 元素 (14.9 KB)
└── sfx/                # 音效文件夹
    ├── drinking.wav    # 喝咖啡音效 (126 KB)
    ├── eating.wav      # 吃披萨音效 (119 KB)
    └── footstep.wav    # 脚步音效 (43 KB)
```

### 资源配置文件

- `src/spriteData.ts` - 精灵图配置
- `src/soundData.ts` - 音效配置

---

## 🏗️ 构建与部署

### 生产构建

```bash
# 构建生产版本
cmd /c "set NODE_OPTIONS=--openssl-legacy-provider && yarn build"
```

构建产物位于 `dist/` 或 `build/` 目录（取决于配置）。

### 部署步骤

1. 执行生产构建命令
2. 将构建产物上传到静态服务器
3. 配置服务器支持 SPA 路由（如使用 React Router）

### 推荐部署平台

- **Vercel** - 零配置部署
- **Netlify** - 简单易用
- **GitHub Pages** - 免费托管
- **Nginx** - 自托管方案

---

## 🔍 开发工具推荐

### 浏览器扩展

- **React Developer Tools** - 调试 React 组件
- **Redux DevTools** - 状态管理调试（如果使用）

### VS Code 扩展

- **ESLint** - 代码规范检查
- **Prettier** - 代码格式化
- **TypeScript** - TS 支持
- **GitLens** - Git 增强

---

## 📊 性能优化建议

### 开发环境性能

1. **增加 Node 内存限制**（如遇到内存不足）:
   ```bash
   cmd /c "set NODE_OPTIONS=--max-old-space-size=4096 --openssl-legacy-provider && yarn start"
   ```

2. **禁用不必要的 Source Maps**（编辑 webpack 配置）

3. **使用 SSD** 存储项目文件

### 生产环境性能

1. **启用代码压缩**（已默认开启）
2. **使用 CDN** 加载静态资源
3. **启用 Gzip** 压缩

---

## 🆘 获取帮助

### 项目相关

- 查看 `contexts/development-paradigm.md` - 开发范式文档
- 查看 `README.md` - 项目说明

### 技术文档

- [React Three Fiber 文档](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js 文档](https://threejs.org/docs/)
- [React 文档](https://react.dev/)

### 社区资源

- [原作者 Twitter](https://twitter.com/coldi)
- [深度教程](https://dev.to/flagrede/making-a-2d-rpg-game-with-react-tree-fiber-4af1)

---

## 📝 开发日志

### 2026-01-07
- ✅ 环境检查完成
- ✅ 解决 Node.js 17+ 兼容性问题
- ✅ 成功启动开发服务器（端口 3002）
- ✅ 所有资源加载成功

---

## 🎯 快速参考

### 最常用命令

```bash
# 启动开发服务器（Windows）
cmd /c "set NODE_OPTIONS=--openssl-legacy-provider && yarn start"

# 安装新依赖
yarn add [package-name]

# 安装开发依赖
yarn add -D [package-name]

# 查看所有可用命令
yarn run
```

### 关键快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + C` | 停止开发服务器 |
| `Ctrl + Shift + R` | 浏览器硬刷新 |
| `F12` | 打开浏览器开发者工具 |

---

**最后更新**: 2026-01-07  
**维护者**: 开发团队
