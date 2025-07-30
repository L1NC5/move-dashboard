<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SensorTable from '@/components/SensorTable.vue'
import { useSensorsStore } from '@/stores/SensorsStore.ts'
import { useMeasurementsStore } from '@/stores/MeasurementsStore.ts'
import type { Sensor } from '@/services/SensorService.ts'
import SensorGraph from '@/components/SensorGraph.vue'

const SensorsStore = useSensorsStore()
const MeasurementsStore = useMeasurementsStore()
const SelectedSensorId = ref<string>('')
const SelectedSensor = computed<Sensor | undefined>(() =>
  SensorsStore.sensorsData.find((s) => s.id === SelectedSensorId.value),
)

const setSelectedSensor = (sensorId: string): void => {
  SelectedSensorId.value = sensorId
}

onMounted(async () => {
  await SensorsStore.loadSensors()
  await MeasurementsStore.loadMultipleSensorsMeasurements(SensorsStore.sensorIds)
  setSelectedSensor(SensorsStore.sensorIds[0])
})
</script>

<template>
  <section class="px-base flex flex-col gap-y-8">
    <SensorGraph
      :measurements="MeasurementsStore.measurementsData[SelectedSensorId]"
      :threshold="SelectedSensor?.threshold"
    />
    <SensorTable
      :sensors="SensorsStore.sensorsData"
      :selected-sensor="SelectedSensor"
      :latest-measurements="MeasurementsStore.latestMeasurementBySensor"
      @change-graph-sensor="setSelectedSensor"
    />
  </section>
</template>
