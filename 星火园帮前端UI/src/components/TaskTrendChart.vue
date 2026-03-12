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
  const values = props.data.map((item) => item.value);

  return {
    title: {
      text: "任务趋势",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const data = params[0];
        return `${data.name}<br/>${data.seriesName}: ${data.value}`;
      },
    },
    legend: {
      data: ["任务数量"],
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
      name: "任务数量",
    },
    series: [
      {
        name: "任务数量",
        type: props.chartType,
        data: values,
        smooth: true,
        itemStyle: {
          color: "#409EFF",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64, 158, 255, 0.3)" },
              { offset: 1, color: "rgba(64, 158, 255, 0.1)" },
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
