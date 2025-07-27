<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SensorTable from '@/components/SensorTable.vue'
import { useSensorsStore } from '@/stores/SensorsStore.ts'
import { useMeasurementsStore } from '@/stores/MeasurementsStore.ts'
import SensorGraph from '@/components/SensorGraph.vue'

const SensorsStore = useSensorsStore()
const MeasurementsStore = useMeasurementsStore()
const SelectedSensorId = ref<string>('')
const SelectedSensor = computed(() =>
  SensorsStore.sensorsData.find((s) => s.id === SelectedSensorId.value),
)

const setSelectedSensor = (sensorId: string) => {
  SelectedSensorId.value = sensorId
}

onMounted(async () => {
  await SensorsStore.loadSensors()
  await MeasurementsStore.loadMultipleSensorsMeasurements(SensorsStore.sensorIds)
  setSelectedSensor(SensorsStore.sensorIds[0])
})
</script>

<template>
  <SensorGraph
    :measurements="MeasurementsStore.measurementsData[SelectedSensorId]"
    :threshold="SelectedSensor?.threshold"
  />
  <SensorTable
    :sensors="SensorsStore.sensorsData"
    :latest-measurements="MeasurementsStore.latestMeasurementBySensor"
    @change-graph-sensor="setSelectedSensor"
  />
</template>

<style scoped></style>
