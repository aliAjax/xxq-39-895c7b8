# 角色服装设定拆解工具

面向 COSER 和画手的服装资料整理工具，帮助系统地记录和管理角色服装元素。

## 技术栈

- **框架**：React 18 + TypeScript
- **构建**：Vite 5
- **状态管理**：Zustand
- **样式**：Tailwind CSS
- **测试**：Vitest
- **代码检查**：ESLint + @typescript-eslint

## 环境要求

- Node.js >= 18
- npm >= 9

## 本地启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问终端输出的本地地址（默认 `http://localhost:5173`）。

## 质量检查

项目提供统一的质量检查入口，提交代码前建议执行：

```bash
npm run check
```

该命令依次执行以下检查，任一环节失败即终止：

| 步骤 | 命令 | 说明 | 耗时 |
|------|------|------|------|
| 1 | `npm run typecheck` | TypeScript 类型检查 | 快 |
| 2 | `npm run lint` | ESLint 代码风格检查 | 快 |
| 3 | `npm test` | Vitest 单元测试 | 中 |
| 4 | `npm run build` | 生产环境构建 | 慢 |

也可以单独运行某项检查：

```bash
# 仅类型检查
npm run typecheck

# 仅代码风格检查
npm run lint

# 仅运行测试
npm test

# 监听模式运行测试
npm run test:watch

# 仅构建
npm run build
```

## 常见失败原因

### 类型检查失败 (typecheck)

- **报错**：`Property 'xxx' does not exist on type 'xxx'`
- **原因**：使用了未定义的属性或类型不匹配
- **解决**：检查类型定义，补充缺失的属性或修正类型

- **报错**：`'xxx' is declared but its value is never read`
- **原因**：声明了未使用的变量/参数
- **解决**：删除未使用的声明，或加下划线前缀（如 `_unused`）

### Lint 检查失败 (lint)

- **报错**：`no-trailing-spaces` / `no-multiple-empty-lines` / `eol-last`
- **原因**：代码格式问题（行尾空格、多余空行、文件末尾缺换行）
- **解决**：手动修正，或配置编辑器保存时自动格式化

- **报错**：`React Hook "useXXX" is called conditionally`
- **原因**：Hook 在条件语句或循环中调用
- **解决**：将 Hook 移到组件顶层

### 测试失败 (test)

- **报错**：`TestFilesNotFoundError`
- **原因**：测试文件路径或命名不符合规范
- **解决**：测试文件需放在 `__tests__` 目录下，以 `.test.ts` 或 `.spec.ts` 结尾

- **报错**：单个测试用例失败
- **解决**：运行 `npm run test:watch` 进入监听模式，定位失败用例并修复

### 构建失败 (build)

- **报错**：`Failed to resolve import "xxx"`
- **原因**：导入路径错误或文件不存在
- **解决**：检查相对路径是否正确，确认文件已存在

- **报错**：`Chunk larger than 500 kB`（警告，不阻塞）
- **原因**：打包产物体积过大
- **解决**：可通过动态导入、代码分割优化，非阻塞问题可暂时忽略

### 依赖安装失败

- **报错**：`npm install` 报错或速度慢
- **原因**：网络问题或镜像源不稳定
- **解决**：
  ```bash
  # 切换国内镜像
  npm config set registry https://registry.npmmirror.com

  # 删除锁文件和 node_modules 后重装
  rm -rf node_modules package-lock.json
  npm install
  ```

### 开发服务器启动失败

- **报错**：`Port 5173 is already in use`
- **原因**：端口被占用
- **解决**：
  ```bash
  # 查找占用进程
  lsof -i :5173

  # 或修改 vite.config.ts 中的端口配置
  ```

## 项目结构

```
src/
├── components/     # React 组件
├── store/          # Zustand 状态管理
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数（含测试）
├── data/           # 示例数据
├── App.tsx         # 根组件
└── main.tsx        # 入口文件
```

## 其他命令

```bash
# 预览生产构建产物
npm run preview

# 可视化测试界面
npm run test:ui
```
