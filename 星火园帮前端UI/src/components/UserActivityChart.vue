<template>
  <div class="chart-container">
    <v-chart
      class="chart"
      :option="chartOption"
      :loading="loading"
      autoresize
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  chartType: {
    type: String,
    default: "line", // 'line' 或 'bar'
  },
});

const chartOption = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      title: {
        text: "暂无数据",
        left: "center",
        top: "middle",
        textStyle: {
          color: "#999",
          fontSize: 16,
        },
      },
    };
  }

  const dates = props.data.map((item) => item.date);
  const activeUsers = props.data.map((item) => item.activeUsers);
  const newUsers = props.data.map((item) => item.newUsers);

  return {
    title: {
      text: "用户活跃度",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = `${params[0].name}<br/>`;
        params.forEach((param) => {
          result += `${param.seriesName}: ${param.value}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["活跃用户", "新增用户"],
      bottom: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
      name: "用户数量",
    },
    series: [
      {
        name: "活跃用户",
        type: props.chartType,
        data: activeUsers,
        smooth: true,
        itemStyle: {
          color: "#67C23A",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(103, 194, 58, 0.3)" },
              { offset: 1, color: "rgba(103, 194, 58, 0.1)" },
            ],
          },
        },
      },
      {
        name: "新增用户",
        type: props.chartType,
        data: newUsers,
        smooth: true,
        itemStyle: {
          color: "#E6A23C",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(230, 162, 60, 0.3)" },
              { offset: 1, color: "rgba(230, 162, 60, 0.1)" },
            ],
          },
        },
      },
    ],
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        show: true,
        type: "slider",
        bottom: 5,
      },
    ],
  };
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 300px;
}
</style>
