"use client";

import { useEffect, useRef, useState } from "react";

type TimePayload = {
  ok: boolean;
  iso: string;
  epochMs: number;
  timezone: string;
  server: string;
};

type PingPayload = {
  ok: boolean;
  message: string;
  receivedAt: string;
  latencyHintMs: number;
  method: string;
};

function formatChinaTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function HomePage() {
  const [serverIso, setServerIso] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [timeLatency, setTimeLatency] = useState<number | null>(null);
  const [clockTick, setClockTick] = useState(0);

  const [feResult, setFeResult] = useState("点击上方按钮，验证页面脚本与交互是否正常。");
  const [feStatus, setFeStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [feActive, setFeActive] = useState(false);
  const [feCount, setFeCount] = useState(0);

  const [apiResult, setApiResult] = useState("点击上方按钮，请求本站 /api/ping 接口。");
  const [apiStatus, setApiStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [apiBusy, setApiBusy] = useState(false);

  const offsetRef = useRef(0);

  async function refreshServerTime() {
    const started = performance.now();
    try {
      const res = await fetch("/api/time", { cache: "no-store" });
      const latency = Math.round(performance.now() - started);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as TimePayload;
      offsetRef.current = data.epochMs + latency / 2 - Date.now();
      setServerIso(data.iso);
      setTimeLatency(latency);
      setTimeError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setTimeError(message);
    }
  }

  useEffect(() => {
    void refreshServerTime();
    const refreshId = window.setInterval(() => {
      void refreshServerTime();
    }, 30000);
    const tickId = window.setInterval(() => {
      setClockTick((n) => n + 1);
    }, 1000);
    return () => {
      window.clearInterval(refreshId);
      window.clearInterval(tickId);
    };
  }, []);

  const liveServerMs = Date.now() + offsetRef.current;
  const liveIso = new Date(liveServerMs).toISOString();
  void clockTick;

  function runFrontendTest() {
    const started = performance.now();
    try {
      const next = feCount + 1;
      setFeCount(next);
      setFeActive(true);
      window.setTimeout(() => setFeActive(false), 700);
      const elapsed = Math.round(performance.now() - started);
      const nowLocal = new Date().toLocaleString("zh-CN", {
        hour12: false,
        timeZone: "Asia/Shanghai",
      });
      setFeStatus("ok");
      setFeResult(
        [
          `前端交互正常（第 ${next} 次）`,
          `本地耗时：${elapsed} ms`,
          `浏览器时间（Asia/Shanghai）：${nowLocal}`,
          `DOM 状态切换与计时器均可用`,
        ].join("\n"),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFeStatus("fail");
      setFeResult(`前端交互失败：${message}`);
    }
  }

  async function runApiTest() {
    setApiBusy(true);
    setApiStatus("idle");
    setApiResult("正在请求 /api/ping …");
    const started = performance.now();
    try {
      const res = await fetch("/api/ping", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          client: "cn-access-check",
          sentAt: new Date().toISOString(),
        }),
      });
      const roundTrip = Math.round(performance.now() - started);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as PingPayload;
      setApiStatus("ok");
      setApiResult(
        [
          `后端接口连通正常`,
          `往返耗时：${roundTrip} ms`,
          `服务端响应：${data.message}`,
          `服务端收到时间：${formatChinaTime(data.receivedAt)}（Asia/Shanghai）`,
          `方法：${data.method}`,
        ].join("\n"),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const roundTrip = Math.round(performance.now() - started);
      setApiStatus("fail");
      setApiResult(`后端接口失败（约 ${roundTrip} ms）\n${message}`);
    } finally {
      setApiBusy(false);
    }
  }

  return (
    <main>
      <header className="brand">
        <div className="brand-mark">
          <span className="dot" aria-hidden="true" />
          大陆网络通达测试
        </div>
        <p>
          无需登录。本页不加载任何第三方 CDN、字体或图片，用于确认中国大陆网络能否打开本站并访问后端接口。
        </p>
      </header>

      <section className="panel" aria-labelledby="time-title">
        <h2 id="time-title">当前服务器时间</h2>
        <p className="hint">由本站 /api/time 提供，并在本地按偏移量每秒刷新显示。</p>
        <div className="time-display">
          {timeError ? (
            <div className="time-value" style={{ color: "var(--fail)" }}>
              获取失败：{timeError}
            </div>
          ) : (
            <div className="time-value">
              {formatChinaTime(serverIso ? liveIso : new Date().toISOString())}
              <span style={{ fontSize: "0.75em", marginLeft: "0.45rem", color: "var(--muted)" }}>
                Asia/Shanghai
              </span>
            </div>
          )}
          <div className="meta-row">
            <span>UTC：{serverIso ? liveIso.replace("T", " ").replace("Z", " Z") : "—"}</span>
            {timeLatency !== null ? <span>最近同步延迟：{timeLatency} ms</span> : null}
          </div>
        </div>
        <div className="actions" style={{ marginTop: "1rem", marginBottom: 0 }}>
          <button type="button" className="ghost" onClick={() => void refreshServerTime()}>
            立即同步服务器时间
          </button>
        </div>
      </section>

      <section className="panel" aria-labelledby="fe-title">
        <h2 id="fe-title">前端交互测试</h2>
        <p className="hint">在浏览器内执行脚本，验证页面渲染与事件响应是否可用。</p>
        <div className="actions">
          <button type="button" className="primary" onClick={runFrontendTest}>
            运行前端测试
          </button>
        </div>
        <div className={`result ${feStatus}`}>{feResult}</div>
        <div className={`fe-box${feActive ? " active" : ""}`} aria-live="polite">
          {feActive ? "交互反馈已触发" : "等待交互"}
        </div>
      </section>

      <section className="panel" aria-labelledby="api-title">
        <h2 id="api-title">后端 API 连通性测试</h2>
        <p className="hint">向本站后端发送请求，确认接口可达并返回 JSON。</p>
        <div className="actions">
          <button
            type="button"
            className="primary"
            onClick={() => void runApiTest()}
            disabled={apiBusy}
          >
            {apiBusy ? "测试中…" : "运行 API 测试"}
          </button>
        </div>
        <div className={`result ${apiStatus}`}>{apiResult}</div>
      </section>

      <p className="footer">公开访问 · 无注册 · 资源全部同源托管</p>
    </main>
  );
}
