const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const clients = new Set();

const state = {
  timestamp: new Date().toISOString(),
  kpis: {
    goodDays: 86,
    carbonDownRate: 23,
    waterQualityRate: 97,
  },
  pollutionTop: [
    { name: "化工园区A", metric: "PM2.5", value: 72 },
    { name: "火电厂B", metric: "SO2", value: 61 },
    { name: "港口物流C", metric: "NOx", value: 55 },
    { name: "建材基地D", metric: "粉尘", value: 49 },
    { name: "交通枢纽E", metric: "CO", value: 43 },
  ],
  alerts: {
    high: 12,
    medium: 28,
    resolved: 41,
  },
  map: {
    title: "生态热力分布（示意）",
    stations: 128,
  },
  airTrend: [120, 160, 140, 210, 180, 150, 110],
  energyMix: [
    { name: "清洁能源", value: 46, color: "#36b9ff" },
    { name: "天然气", value: 29, color: "#43efd0" },
    { name: "煤电", value: 18, color: "#f2c94c" },
    { name: "其他", value: 7, color: "#a890ff" },
  ],
  waterQuality: [
    { name: "上游", score: 92 },
    { name: "中游", score: 84 },
    { name: "下游", score: 78 },
  ],
  yearlyProgress: [
    { name: "工业减排目标", value: 68, color: "#36b9ff" },
    { name: "交通减排目标", value: 54, color: "#43efd0" },
    { name: "居民绿色出行率", value: 73, color: "#34d399" },
  ],
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function jitter(value, range, min, max) {
  const delta = Math.floor((Math.random() * (range * 2 + 1)) - range);
  return clamp(value + delta, min, max);
}

function updateState() {
  state.timestamp = new Date().toISOString();

  state.kpis.goodDays = jitter(state.kpis.goodDays, 1, 75, 100);
  state.kpis.carbonDownRate = jitter(state.kpis.carbonDownRate, 1, 10, 40);
  state.kpis.waterQualityRate = jitter(state.kpis.waterQualityRate, 1, 85, 100);

  state.alerts.high = jitter(state.alerts.high, 1, 5, 30);
  state.alerts.medium = jitter(state.alerts.medium, 2, 10, 60);
  state.alerts.resolved = jitter(state.alerts.resolved, 2, 20, 100);
  if (state.alerts.resolved < state.alerts.high) {
    state.alerts.resolved = state.alerts.high + 5;
  }

  state.pollutionTop = state.pollutionTop
    .map((item) => ({
      ...item,
      value: jitter(item.value, 2, 20, 95),
    }))
    .sort((a, b) => b.value - a.value);

  const nextAir = jitter(state.airTrend[state.airTrend.length - 1], 15, 80, 260);
  state.airTrend = [...state.airTrend.slice(1), nextAir];

  const firstEnergy = jitter(state.energyMix[0].value, 2, 35, 60);
  const secondEnergy = jitter(state.energyMix[1].value, 2, 20, 35);
  const thirdEnergy = jitter(state.energyMix[2].value, 2, 10, 30);
  let fourthEnergy = 100 - firstEnergy - secondEnergy - thirdEnergy;
  if (fourthEnergy < 3) {
    fourthEnergy = 3;
  }
  const totalEnergy = firstEnergy + secondEnergy + thirdEnergy + fourthEnergy;
  state.energyMix[0].value = Math.round((firstEnergy / totalEnergy) * 100);
  state.energyMix[1].value = Math.round((secondEnergy / totalEnergy) * 100);
  state.energyMix[2].value = Math.round((thirdEnergy / totalEnergy) * 100);
  state.energyMix[3].value =
    100 - state.energyMix[0].value - state.energyMix[1].value - state.energyMix[2].value;

  state.waterQuality = state.waterQuality.map((item) => ({
    ...item,
    score: jitter(item.score, 2, 60, 100),
  }));

  state.yearlyProgress = state.yearlyProgress.map((item) => ({
    ...item,
    value: jitter(item.value, 1, 30, 95),
  }));
}

function sendSSE(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastSnapshot() {
  const payload = { type: "snapshot", data: state };
  for (const client of clients) {
    sendSSE(client, payload);
  }
}

function formatFileType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname === "/" ? "/index.html" : parsed.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": formatFileType(filePath) });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  if (req.url === "/api/dashboard/snapshot") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(state));
    return;
  }

  if (req.url === "/api/dashboard/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");
    clients.add(res);
    sendSSE(res, { type: "snapshot", data: state });

    req.on("close", () => {
      clients.delete(res);
    });
    return;
  }

  serveStatic(req, res);
});

setInterval(() => {
  updateState();
  broadcastSnapshot();
}, 2000);

server.listen(PORT, () => {
  console.log(`Realtime dashboard server running at http://localhost:${PORT}`);
});
