// 地图配置文件
export const mapConfig = {
  // 使用免费地图服务，无需API Key
  defaultMap: "openstreetmap", // openstreetmap, leaflet

  // OpenStreetMap配置（免费，无需API Key）
  openstreetmap: {
    type: "openstreetmap",
    // 无需API Key
  },

  // Leaflet地图配置（免费，无需API Key）
  leaflet: {
    type: "leaflet",
    // 无需API Key
  },

  // 高德地图配置（需要API Key）
  amap: {
    key: "YOUR_AMAP_KEY", // 可选：如果需要使用高德地图
    version: "2.0",
    plugins: ["AMap.PlaceSearch", "AMap.Geocoder", "AMap.AutoComplete"],
  },
};

// 默认地图配置
export const defaultMapConfig = {
  center: [120.1551, 30.2741], // 杭州西湖（默认中心点）
  zoom: 12, // 合适的缩放级别，显示杭州市区
  mapStyle: "amap://styles/normal",
};
