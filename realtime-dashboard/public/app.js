const $ = (id) => document.getElementById(id);

let latestState = null;
let eventSource = null;

const barPalette = ["#3ca2ff", "#2dd4bf", "#4ade80", "#fbbf24", "#fb7185", "#38bdf8", "#34d399"];

function formatLocalTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "--";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function renderKpis(data) {
  $("kpi-good-days").textContent = data.kpis.goodDays;
  $("kpi-carbon").textContent = `${data.kpis.carbonDownRate}%`;
  $("kpi-water").textContent = data.kpis.waterQualityRate;
}

function renderPollutionList(data) {
  const container = $("pollution-list");
  container.innerHTML = data.pollutionTop
    .map(
      (item, index) => `
      <div class="list-item">
        <span>${index + 1} ${item.name}</span>
        <span class="right-val">${item.metric} ${item.value}</span>
      </div>
    `
    )
    .join("");
}

function renderAlerts(data) {
  $("alert-high").textContent = data.alerts.high;
  $("alert-medium").textContent = data.alerts.medium;
  $("alert-resolved").textContent = data.alerts.resolved;
}

function renderMap(data) {
  $("map-title").textContent = data.map.title;
  $("map-stations").textContent = data.map.stations;
}

function renderAirTrend(data) {
  const maxVal = Math.max(...data.airTrend, 1);
  const chart = $("air-trend-chart");
  chart.innerHTML = data.airTrend
    .map((value, idx) => {
      const height = Math.round((value / maxVal) * 95);
      return `<div class="bar" style="height:${height}%;background:${barPalette[idx % barPalette.length]}"></div>`;
    })
    .join("");
}

function renderEnergy(data) {
  const donut = $("energy-donut");
  let current = 0;
  const stops = data.energyMix
    .map((item) => {
      const start = current;
      current += item.value;
      return `${item.color} ${start}% ${current}%`;
    })
    .join(", ");
  donut.style.background = `conic-gradient(${stops})`;

  const legend = $("energy-legend");
  legend.innerHTML = data.energyMix
    .map(
      (item) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${item.color}"></span>
        <span>${item.name} ${item.value}%</span>
      </div>
    `
    )
    .join("");
}

function renderWaterQuality(data) {
  const maxVal = 100;
  const wrap = $("water-bars");
  wrap.innerHTML = data.waterQuality
    .map((item) => {
      const h = Math.round((item.score / maxVal) * 100);
      return `
        <div class="water-col">
          <div class="water-val" style="height:${h}px"></div>
          <div class="water-label">${item.name} ${item.score}</div>
        </div>
      `;
    })
    .join("");
}

function renderProgress(data) {
  const list = $("progress-list");
  list.innerHTML = data.yearlyProgress
    .map(
      (item) => `
      <div class="progress-item">
        <div class="name">${item.name} ${item.value}%</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${item.value}%;background:${item.color}"></div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderMeta(data) {
  $("current-time").textContent = formatLocalTime(data.timestamp);
}

function renderAll(data) {
  latestState = data;
  renderKpis(data);
  renderPollutionList(data);
  renderAlerts(data);
  renderMap(data);
  renderAirTrend(data);
  renderEnergy(data);
  renderWaterQuality(data);
  renderProgress(data);
  renderMeta(data);
}

function setConnectionState(online) {
  const dot = $("conn-dot");
  const text = $("conn-text");
  dot.classList.toggle("online", online);
  dot.classList.toggle("offline", !online);
  text.textContent = online ? "实时同步中" : "连接中断，显示最近数据";
}

async function loadInitialSnapshot() {
  const res = await fetch("/api/dashboard/snapshot");
  const data = await res.json();
  renderAll(data);
  setConnectionState(true);
}

function connectStream() {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource("/api/dashboard/stream");

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === "snapshot") {
        renderAll(payload.data);
      }
      setConnectionState(true);
    } catch (err) {
      console.error("SSE parse error:", err);
    }
  };

  eventSource.onerror = () => {
    setConnectionState(false);
  };
}

async function init() {
  try {
    await loadInitialSnapshot();
  } catch (err) {
    console.error("Initial snapshot load failed:", err);
    if (latestState) {
      renderMeta(latestState);
    }
    setConnectionState(false);
  }
  connectStream();
}

init();
