<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

import type { Measurement } from '@/services/MeasurementsService.ts'

const props = defineProps<{
  measurements: Measurement[] | undefined
  threshold: number | undefined
}>()

let root: am5.Root | null = null

const createChart = (data: Measurement[], threshold: number) => {
  if (root) root.dispose()
  root = am5.Root.new('chartContainer')
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: 'panX',
      wheelY: 'zoomX',
      layout: root.verticalLayout,
    }),
  )

  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: 'minute', count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {}),
    }),
  )

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }),
  )

  const thresholdRange = yAxis.makeDataItem({ value: threshold })
  yAxis
    .createAxisRange(thresholdRange)
    .get('grid')
    ?.setAll({
      stroke: am5.color('#f00'),
      strokeWidth: 2,
      strokeDasharray: [4, 4],
    })

  yAxis
    .createAxisRange(thresholdRange)
    .get('label')
    ?.setAll({
      text: `Threshold: ${threshold}`,
      fill: am5.color('#fff'),
      fontWeight: 'bold',
      background: am5.RoundedRectangle.new(root, {
        fill: am5.color('#f00'),
        shadowColor: am5.color('#000000'),
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowOpacity: 0.3,
      }),
      dx: -5,
    })

  const cursor = chart.set(
    'cursor',
    am5xy.XYCursor.new(root, {
      behavior: 'none',
    }),
  )
  cursor.lineY.set('visible', false)
  cursor.lineX.set('visible', false)

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: 'Displacement',
      xAxis,
      yAxis,
      valueYField: 'disp_mm',
      valueXField: 'timestamp',
      tooltip: am5.Tooltip.new(root, {
        labelText: '{valueY} mm',
      }),
    }),
  )

  series.data.setAll(
    data.map((m) => ({
      timestamp: new Date(m.timestamp).getTime(),
      disp_mm: m.disp_mm,
    })),
  )

  series.bullets.push((root, _series, dataItem) => {
    const value = dataItem.get('valueY') as number
    const bulletColor = value > threshold ? am5.color(0xff0000) : am5.color(0x00b300)

    return am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 4,
        fill: bulletColor,
      }),
    })
  })

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
