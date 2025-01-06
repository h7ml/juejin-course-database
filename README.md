# juejin-course-database

一个用于管理掘金小册数据的工具，支持将小册数据保存到 Supabase 数据库中。

## 功能特点

- ✨ 自动下载已购买的掘金小册
- 📚 支持批量下载多本小册
- 💾 数据存储到 Supabase 数据库
- 📝 保存章节内容和阅读进度
- 🔄 支持增量更新
- 📊 完整的日志记录

## 环境要求

- Node.js >= 16
- [Bun](https://bun.sh/docs/installation) >= 1.0 (推荐)
- Supabase 相关的配置
- 掘金 Cookie

## 快速开始

#### 0. 安装Bun

```bash
brew install bun
```

> 更多安装方式请参考 [Bun 官网](https://bun.sh/docs/installation)

### 1. 克隆并安装

```bash
# 克隆项目
git clone https://github.com/h7ml/juejin-course-database.git

# 进入项目目录
cd juejin-course-database

# 安装依赖
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 掘金 Cookie
JUEJIN_COOKIE=your-juejin-cookie

# 日志配置
NEXT_PUBLIC_WRITE_LOG=true
NEXT_PUBLIC_WRITE_FILE=true
```

### 3. 初始化数据库

在 Supabase SQL 编辑器中依次运行：

- `sql/init.sql` - 创建数据表
- `sql/clear.sql` (可选) - 清空数据

### 4. 运行程序

```bash
# 使用 bun 运行
pnpm run start
```

## 项目结构

```
.
├── src/
│   ├── api/              # API 相关代码
│   │   ├── juejin.ts     # 掘金 API 实现
│   │   └── juejin.d.ts   # 类型定义
│   ├── db/               # 数据库操作
│   │   ├── client.ts     # Supabase 客户端
│   │   ├── course.ts     # 课程相关操作
│   │   ├── section.ts    # 章节相关操作
│   │   └── api.ts        # 数据库 API
│   ├── utils/            # 工具函数
│   │   ├── logger.ts     # 日志工具
│   │   └── init.ts       # 初始化工具
│   └── index.ts          # 入口文件
├── sql/                  # SQL 文件
│   ├── init.sql         # 数据库初始化
│   ├── clear.sql        # 清空数据
│   ├── migrate.sql      # 数据库迁移
│   └── update.sql       # 更新脚本
└── .env                 # 环境变量
```

## API 模块说明

### juejin.ts

提供了以下掘金 API 的封装：

```typescript
// 获取已购买的小册列表
getBookletShelfList(): Promise<BookletResponse>

// 获取章节内容
getSectionContent(sectionId: string): Promise<SectionResponse>

// 获取小册详情
getBookletDetail(bookletId: string): Promise<BookletDetailResponse>
```

### 类型定义 (juejin.d.ts)

主要类型：

- `BookletInfo`: 小册基本信息
- `UserInfo`: 用户信息
- `Section`: 章节信息
- `ReadingProgress`: 阅读进度
- `SectionReadingProgress`: 章节阅读进度

响应类型：

- `BookletResponse`: 小册列表响应
- `SectionResponse`: 章节内容响应
- `BookletDetailResponse`: 小册详情响应

## 数据库表结构

### users

- 用户基本信息
- 主键：`user_id`

### user_growth

- 用户成长数据（掘力值、掘分等）
- 主键：`user_id`
- 外键：关联 users 表

### booklets

- 小册基本信息
- 主键：`booklet_id`
- 外键：关联 users 表（作者）

### sections

- 章节信息
- 主键：`section_id`
- 外键：关联 booklets 和 users 表

### section_contents

- 章节具体内容
- 主键：`section_id`
- 外键：关联 sections 和 booklets 表

### reading_progress

- 小册阅读进度
- 复合主键：`(booklet_id, user_id)`
- 外键：关联 booklets 和 users 表

### section_reading_progress

- 章节阅读进度
- 复合主键：`(booklet_id, user_id, section_id)`
- 外键：关联 sections 表

## 注意事项

1. **Cookie 安全**

   - 不要泄露你的掘金 Cookie
   - 定期更新 Cookie

2. **数据库操作**

   - 首次运行前确保运行 init.sql
   - 需要重置数据时使用 clear.sql

3. **日志管理**
   - 日志文件存储在 .log 目录
   - 可通过环境变量控制日志输出

## 常见问题

1. **Cookie 失效**

   - 症状：API 请求失败
   - 解决：更新 .env 中的 JUEJIN_COOKIE

2. **数据库连接失败**

   - 症状：Supabase 操作报错
   - 解决：检查 Supabase 配置是否正确

3. **目录权限问题**
   - 症状：无法创建日志文件
   - 解决：检查目录权限

## License

[MIT](./LICENSE)
