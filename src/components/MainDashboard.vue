<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SensorTable from '@/components/SensorTable.vue'
import { useSensorsStore } from '@/stores/SensorsStore.ts'
import { useMeasurementsStore } from '@/stores/MeasurementsStore.ts'

const selectedSensorId = ref<string | null>(null)
const SensorsStore = useSensorsStore()
const MeasurementsStore = useMeasurementsStore()

const setSelectedSensor = (sensorId: string) => {
  selectedSensorId.value = sensorId
}

onMounted(async () => {
  await SensorsStore.loadSensors()
  await MeasurementsStore.loadMultipleSensorsMeasurements(SensorsStore.sensorIds)
  setSelectedSensor(SensorsStore.sensorIds[0])
})
</script>

<template>
  <span>Selected sensor: {{ selectedSensorId }}</span>
  <SensorTable
    :sensors="SensorsStore.sensorsData"
    :latest-measurements="MeasurementsStore.latestMeasurementBySensor"
    @change-graph-sensor="setSelectedSensor"
  />
</template>

<style scoped></style>
