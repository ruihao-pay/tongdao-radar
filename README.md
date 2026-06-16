# 通道雷达

海外支付通道内部决策看板。

## 访问地址

当前恢复使用公开 GitHub Pages 承载业务看板：

```text
https://ruihao-pay.github.io/tongdao-radar/
```

`index.html` 和 `data.js` 为公开看板入口。`private-app/` 保留一份真实看板镜像，后续如果重新启用 Cloudflare Worker + 飞书 OAuth，可以继续作为 Worker assets 源。

## 目录结构

```text
/Users/mac/通道雷达/
├── index.html        # 公开 GitHub Pages 看板
├── data.js           # 公开看板数据
├── private-app/      # Worker assets 镜像，本地保留，禁止提交
│   ├── index.html
│   └── data.js
├── src/worker.js     # Cloudflare Worker 飞书登录网关
├── wrangler.toml     # Worker 配置
└── README.md
```

`private-app/`、`.dev.vars`、`.wrangler/` 已加入 `.gitignore`。

## Worker 保护访问（暂停）

如需重新启用受保护访问，在飞书开放平台创建或复用内部应用，并把回调地址配置为：

```text
https://<worker-domain>/auth/callback
```

Cloudflare 登录后，Worker 需要配置以下变量或 secrets：

```bash
wrangler secret put FEISHU_APP_ID
wrangler secret put FEISHU_APP_SECRET
wrangler secret put FEISHU_REDIRECT_URI
wrangler secret put SESSION_SECRET
```

如需在飞书用户信息里读取邮箱，按飞书应用权限实际开通情况配置 OAuth scope：

```bash
wrangler secret put FEISHU_SCOPE
```

至少配置一种公司用户校验规则，否则 Worker 会拒绝所有登录：

```bash
wrangler secret put FEISHU_TENANT_KEY
```

或使用邮箱白名单 / 域名白名单：

```bash
wrangler secret put ALLOWED_EMAILS
wrangler secret put ALLOWED_EMAIL_DOMAINS
```

## Worker 部署（暂停）

本地确认 `private-app/index.html` 和 `private-app/data.js` 是最新真实看板后执行：

```bash
npm run check
npm run login
npm run deploy
```

部署完成后，实际业务访问链接应使用 Worker 域名或绑定的自定义域名。

## 安全边界

- GitHub Pages 是公开访问，静态 `data.js` 可以被直接下载。
- 如需恢复访问控制，必须通过服务端网关发放，即 Worker 先验登录，再返回静态资源。
- 已公开提交过的历史版本仍可能存在于 Git 历史和缓存中；如需彻底收口，应将仓库转私有或重写公开历史，并视情况更换公开访问地址。
- 不要把飞书应用密钥、租户 key、白名单或真实业务数据提交到仓库。
