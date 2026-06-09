import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import worker from "../src/worker.js";

const BASE_ENV = {
  FEISHU_APP_ID: "cli_test",
  FEISHU_APP_SECRET: "secret_test",
  FEISHU_REDIRECT_URI: "https://radar.example.com/auth/callback",
  FEISHU_AUTH_BASE: "https://accounts.feishu.cn/open-apis/authen/v1/authorize",
  FEISHU_TOKEN_ENDPOINT: "https://open.feishu.cn/open-apis/authen/v2/oauth/token",
  FEISHU_USERINFO_ENDPOINT: "https://open.feishu.cn/open-apis/authen/v1/user_info",
  SESSION_SECRET: "test-session-secret",
  SESSION_TTL_SECONDS: "28800",
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function env(extra = {}) {
  return {
    ...BASE_ENV,
    ...extra,
    ASSETS: {
      fetch: async () => new Response("private app", { status: 200 }),
    },
  };
}

function request(path, init = {}) {
  return new Request(`https://radar.example.com${path}`, init);
}

function setCookie(response) {
  return response.headers.get("set-cookie") || "";
}

function extractCookie(header, name) {
  const match = header.match(new RegExp(`${name}=[^;,]+`));
  return match ? match[0] : "";
}

test("anonymous users cannot read protected assets", async () => {
  const response = await worker.fetch(request("/"), env());

  assert.equal(response.status, 401);
  assert.match(await response.text(), /需要飞书登录/);
});

test("login redirects to Feishu OAuth with state cookie", async () => {
  const response = await worker.fetch(request("/auth/login"), env());
  const location = new URL(response.headers.get("location"));

  assert.equal(response.status, 302);
  assert.equal(location.origin, "https://accounts.feishu.cn");
  assert.equal(location.searchParams.get("client_id"), "cli_test");
  assert.equal(location.searchParams.get("redirect_uri"), BASE_ENV.FEISHU_REDIRECT_URI);
  assert.equal(location.searchParams.get("response_type"), "code");
  assert.ok(location.searchParams.get("state"));
  assert.match(setCookie(response), /tdr_oauth_state=/);
});

test("callback rejects mismatched oauth state", async () => {
  const response = await worker.fetch(
    request("/auth/callback?code=abc&state=actual", {
      headers: { Cookie: "tdr_oauth_state=expected" },
    }),
    env(),
  );

  assert.equal(response.status, 403);
  assert.match(await response.text(), /登录状态校验失败/);
});

test("callback rejects when no company gate is configured", async () => {
  globalThis.fetch = async (url) => {
    if (String(url).includes("/oauth/token")) {
      return Response.json({ code: 0, data: { access_token: "uat_test" } });
    }
    return Response.json({
      code: 0,
      data: { open_id: "ou_test", tenant_key: "tenant_a", email: "user@example.com" },
    });
  };

  const response = await worker.fetch(
    request("/auth/callback?code=abc&state=ok", {
      headers: { Cookie: "tdr_oauth_state=ok" },
    }),
    env({ FEISHU_TENANT_KEY: "", ALLOWED_EMAILS: "", ALLOWED_EMAIL_DOMAINS: "" }),
  );

  assert.equal(response.status, 403);
  assert.match(await response.text(), /尚未配置公司租户校验规则/);
});

test("company tenant users receive a session and can read assets", async () => {
  globalThis.fetch = async (url) => {
    if (String(url).includes("/oauth/token")) {
      return Response.json({ code: 0, data: { access_token: "uat_test" } });
    }
    return Response.json({
      code: 0,
      data: { open_id: "ou_test", tenant_key: "tenant_a", enterprise_email: "user@example.com" },
    });
  };

  const loginResponse = await worker.fetch(
    request("/auth/callback?code=abc&state=ok", {
      headers: { Cookie: "tdr_oauth_state=ok" },
    }),
    env({ FEISHU_TENANT_KEY: "tenant_a" }),
  );
  const sessionCookie = extractCookie(setCookie(loginResponse), "tdr_session");

  assert.equal(loginResponse.status, 302);
  assert.ok(sessionCookie);

  const assetResponse = await worker.fetch(
    request("/", { headers: { Cookie: sessionCookie } }),
    env({ FEISHU_TENANT_KEY: "tenant_a" }),
  );

  assert.equal(assetResponse.status, 200);
  assert.equal(await assetResponse.text(), "private app");
});
