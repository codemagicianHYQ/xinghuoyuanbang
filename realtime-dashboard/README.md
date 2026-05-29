# Realtime Environment Dashboard

一个可直接运行的环保数字大屏示例项目：

- 保持深色科技风大屏样式
- 后端提供首屏快照接口
- 后端通过 SSE 持续推送模拟实时数据
- 前端在不改版式的前提下只更新数据内容

## 目录结构

```text
realtime-dashboard/
  server.js
  public/
    index.html
    style.css
    app.js
```

## 运行方式

1. 进入项目目录：

```bash
cd realtime-dashboard
```

2. 启动服务：

```bash
node server.js
```

3. 浏览器打开：

```text
http://localhost:3000
```

## 接口说明

- `GET /api/dashboard/snapshot`：返回当前全量数据
- `GET /api/dashboard/stream`：SSE 实时推送全量数据（每 2 秒）

## 说明

- 这是模拟后端数据流，可替换为真实业务服务。
- 前端样式和布局可保持不变，只替换数据源即可接入真实场景。
