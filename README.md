# 通道雷达 Dashboard

锐浩 Arcane Brilliance Limited 海外支付通道全景看板。

## 在线访问

🔗 **https://ruihao-pay.github.io/tongdao-radar/**

## 本地文件位置

```
/Users/mac/通道雷达/
├── index.html   # 主页面（UI + 逻辑）
├── data.js      # 通道数据（136 条）
└── README.md    # 本文件
```

## 功能视图

| Tab | 用途 |
|---|---|
| 📊 总览 | 136 条通道按推荐度排序，卡片/表格双视图。卡片视图按「主力 / Antom 子方式 / 已淘汰」分层折叠，主力不被稀释 |
| 🎯 业务专题 | 4-gate 筛业务适配候选，T1/T2/T3 分档，可切换业务 |
| 🗂️ 角色 × Gate | 角色 × Gate 状态 二维矩阵 |
| 📈 统计 | Gate/建议/AI/角色/地区 占比分布 |

## 筛选维度

- 关键词搜索（通道名 / HQ / 市场 / 差异化）
- 地区
- 角色（本地 PSP / 全球聚合商 / MoR / Antom 子方式 / 钱包 / BNPL / 加密 PSP ...）
- Gate 状态（PASS / 条件PASS / 部分FAIL / FAIL / 待评）
- 建议（强推 / 已锁接入 / P2 补位 / 观察 / 备选 / 不接入 / 搁置）
- AI 陪聊接受度（可接 / 不接 / 待问 / 未知）
- 风险等级（🔴 可接高风险/擦边 / 🟢 仅正规 / ⚪ 待定，默认从 AI 陪聊列派生，可手动覆盖）

## 协同与更新

### 给团队看
直接发链接 `https://ruihao-pay.github.io/tongdao-radar/`，对方点开即可，永远是最新。

### 更新数据
Claude 跑了新通道后：
1. 改 `/Users/mac/通道雷达/data.js`
2. `git push`（本地已配 SSH key，自动部署，无需手动上传）
3. GitHub Pages 1-2 分钟自动重新部署
4. 链接刷新即看到新数据 —— index.html 已内置 cache busting（data.js 带时间戳加载），**无需再手动硬刷新**

### 飞书表格同源
表格原始数据：[飞书 Bitable](https://gcn9eq0plpq9.feishu.cn/base/QLySbEoyVae0pZsDjqucUGHKnGe)

三端（本地 data.js / GitHub Pages / 飞书 Bitable）保持一致。

## 数据 schema

每条通道含 20+ 字段：
- 基础：通道名 / 角色 / HQ / 最大市场 / 覆盖地区
- 评估：Gate 状态 / HK 直签 / 建议 / 驱动级 / AI 陪聊 / 风险等级
- 评分（0-10）：订阅功能 / 费率竞争力 / 市场覆盖 / 拒付管控 / 多商户能力 / 账期
- 综合：业务一综合 / 业务二综合 / 战略窗口 / 接入成本
- 文本：核心差异化

最后更新：2026-05-22 · 136 条通道
