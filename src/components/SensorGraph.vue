<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive'

import type { Measurement } from '@/services/MeasurementsService.ts'

const props = defineProps<{
  measurements: Measurement[] | undefined
  threshold: number | undefined
}>()

let root: am5.Root | null = null

const createChart = (data: Measurement[], threshold: number) => {
  if (root) root.dispose()
  root = am5.Root.new('chartContainer')
  root.setThemes([am5themes_Animated.new(root), am5themes_Responsive.new(root)])

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: 'panX',
      wheelY: 'zoomX',
      pinchZoomX: true,
      paddingLeft: 0,
    }),
  )

  const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}))
  cursor.lineX.set('forceHidden', true)
  cursor.lineY.set('forceHidden', true)

  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: 'minute', count: 30 },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true,
        minGridDistance: 80,
      }),
    }),
  )

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }),
  )

  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: 'Series',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'disp_mm',
      valueXField: 'timestamp',
      tooltip: am5.Tooltip.new(root, {
        getFillFromSprite: false,
        labelText: '{valueY}',
      }),
    }),
  )

  const seriesRangeDataItem = yAxis.makeDataItem({ value: threshold, endValue: 1000 })
  const seriesRange = series.createAxisRange(seriesRangeDataItem)
  seriesRange.fills?.template.setAll({
    visible: true,
    opacity: 0.3,
  })

  series.fills.template.setAll({
    fillOpacity: 0.2,
    visible: true,
  })

  series
    .getTooltip()
    ?.get('background')
    ?.setAll({
      fill: am5.color('#fff'),
      fillOpacity: 1,
      stroke: am5.color('#fff'),
      shadowColor: am5.color('#000'),
      shadowOpacity: 0.2,
      shadowBlur: 1,
      shadowOffsetX: 1,
      shadowOffsetY: 2,
    })

  seriesRange.fills?.template.set('fill', am5.color('#f00'))
  seriesRange.strokes?.template.set('stroke', am5.color('#f00'))

  seriesRangeDataItem.get('grid')?.setAll({
    strokeOpacity: 1,
    visible: true,
    stroke: am5.color(0x000000),
    strokeDasharray: [2, 2],
  })

  seriesRangeDataItem.get('label')?.setAll({
    location: 0,
    visible: true,
    text: 'Threshold',
    inside: true,
    centerX: 0,
    centerY: am5.p100,
    fontWeight: '500',
    fill: am5.color('#f00'),
  })

  series.data.setAll(
    data.map((m) => ({
      timestamp: new Date(m.timestamp).getTime(),
      disp_mm: m.disp_mm,
    })),
  )

  series.appear(1000)
  chart.appear(1000, 100)
}

watch(
  () => [props.measurements, props.threshold],
  () => {
    if (props.measurements && props.measurements.length && props.threshold) {
      createChart(props.measurements, props.threshold)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  root?.dispose()
})
</script>

<template>
  <div id="chartContainer" class="select-none" style="width: 100%; height: 400px" />
</template>
