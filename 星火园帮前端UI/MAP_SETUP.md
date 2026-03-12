# 地图功能配置说明

## 免费地图服务（推荐）

### 🎉 无需 API Key！

系统默认使用免费的 OpenStreetMap 服务，无需任何 API Key 配置，开箱即用！

### 功能特点

- **✅ 完全免费**: 无需注册、无需 API Key
- **✅ 全球覆盖**: 支持全球范围的地图显示
- **✅ 点击选择**: 点击地图任意位置获取经纬度坐标
- **✅ 地址搜索**: 使用 Nominatim 免费搜索服务
- **✅ 逆地理编码**: 根据坐标自动获取详细地址信息
- **✅ 位置标记**: 在地图上显示选择的位置标记

### 技术实现

- **地图服务**: OpenStreetMap + Leaflet
- **搜索服务**: Nominatim（OpenStreetMap 的搜索服务）
- **逆地理编码**: Nominatim（免费服务）

## 可选：高德地图配置

如果您需要使用高德地图（需要 API Key），可以修改 `src/config/map.js`：

```javascript
export const mapConfig = {
  defaultMap: "amap", // 改为使用高德地图
  amap: {
    key: "YOUR_AMAP_KEY", // 需要申请高德地图API Key
    version: "2.0",
    plugins: ["AMap.PlaceSearch", "AMap.Geocoder", "AMap.AutoComplete"],
  },
};
```

### 获取高德地图 API Key

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册并登录账号
3. 进入控制台，创建应用
4. 获取 Web 服务 API Key

## 使用说明

### 默认配置（推荐）

无需任何配置，直接使用免费地图服务：

```javascript
export const mapConfig = {
  defaultMap: "openstreetmap", // 免费，无需API Key
};
```

### 功能对比

| 功能       | 免费服务  | 高德地图 |
| ---------- | --------- | -------- |
| API Key    | ❌ 不需要 | ✅ 需要  |
| 地图显示   | ✅ 支持   | ✅ 支持  |
| 点击选择   | ✅ 支持   | ✅ 支持  |
| 地址搜索   | ✅ 支持   | ✅ 支持  |
| 逆地理编码 | ✅ 支持   | ✅ 支持  |
| 中文支持   | ✅ 支持   | ✅ 更好  |

### 注意事项

- **免费服务**: 无需任何配置，开箱即用
- **网络要求**: 需要能访问 OpenStreetMap 服务
- **搜索限制**: Nominatim 有请求频率限制（合理使用）
- **备用方案**: 搜索失败时自动使用模拟数据
