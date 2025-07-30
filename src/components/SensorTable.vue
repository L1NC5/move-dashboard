<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Sensor } from '@/services/SensorService.ts'
import type { LatestMeasurementMap } from '@/stores/MeasurementsStore.ts'
import type { Measurement } from '@/services/MeasurementsService.ts'
import CaretDown from '@/components/icons/CaretDown.vue'
import ChartIcon from '@/components/icons/ChartIcon.vue'

interface EnrichedSensor extends Sensor {
  latest: Measurement | undefined
  isAlert: boolean | undefined
}

type SensorTableColumnKey = keyof EnrichedSensor | 'button'

interface SensorTableColumn {
  key: SensorTableColumnKey
  label: string
}

type SensorTableCellValue = string | number | boolean | undefined

const props = defineProps<{
  sensors: Array<Sensor>
  selectedSensor: Sensor | undefined
  latestMeasurements: LatestMeasurementMap
}>()

const emit = defineEmits<{
  (e: 'changeGraphSensor', id: string): void
}>()

const sortKey = ref<SensorTableColumnKey>('id')
const sortAsc = ref<boolean>(true)

const enrichedSensors = computed<Array<EnrichedSensor>>(() => {
  const sensorsWithLatest: Array<EnrichedSensor> = props.sensors.map((sensor) => {
    const latest = props.latestMeasurements[sensor.id]
    return {
      ...sensor,
      latest,
      isAlert: latest ? latest.disp_mm > sensor.threshold : undefined,
    }
  })

  sensorsWithLatest.sort((a, b) => {
    const aVal = getCellValue(a, sortKey.value)
    const bVal = getCellValue(b, sortKey.value)

    if (aVal === 'N/A' && bVal !== 'N/A') return 1
    if (bVal === 'N/A' && aVal !== 'N/A') return -1
    if (aVal === 'N/A' && bVal === 'N/A') return 0

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc.value ? aVal - bVal : bVal - aVal
    }

    return sortAsc.value
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  return sensorsWithLatest
})

const toggleSort = (key: SensorTableColumnKey): void => {
  if (sortKey.value == key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const columns: Array<SensorTableColumn> = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'location', label: 'Location' },
  { key: 'latest', label: 'Last value' },
  { key: 'isAlert', label: 'Status' },
  { key: 'button', label: '' },
]

const getCellValue = (sensor: EnrichedSensor, key: SensorTableColumnKey): SensorTableCellValue => {
  if (key in sensor && key !== 'latest') {
    return sensor[key as keyof Sensor]
  }

  switch (key) {
    case 'latest':
      return sensor.latest ? sensor.latest.disp_mm : 'N/A'
    default:
      return undefined
  }
}
</script>

<template>
  <div class="min-w-0 overflow-x-auto overscroll-x-none rounded-lg shadow-sm">
    <table class="w-full">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" class="bg-blue-100">
            <template v-if="column.key !== 'button'">
              <button
                class="size-full inline-flex justify-between items-center gap-x-4 p-4 text-nowrap"
                @click="toggleSort(column.key)"
              >
                {{ column.label }}
                <CaretDown
                  class="transition-transform duration-100"
                  :class="{
                    'rotate-180': !sortAsc,
                    'opacity-15': sortKey !== column.key,
                  }"
                />
              </button>
            </template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="sensor in enrichedSensors"
          :key="sensor.id"
          class="group/row"
          :class="sensor.id === selectedSensor?.id && 'bg-blue-50'"
        >
          <td v-for="column in columns" :key="column.key" class="p-4">
            <template v-if="column.key === 'button'">
              <button
                class="w-full px-4 py-2 inline-flex justify-center items-center gap-x-2 whitespace-nowrap bg-blue-200 text-blue-950 rounded-sm hover:bg-blue-300 active:bg-blue-400 transition-colors"
                @click="emit('changeGraphSensor', sensor.id)"
              >
                <ChartIcon />
                Show data
              </button>
            </template>

            <span
              v-else-if="column.key === 'isAlert'"
              class="inline-flex items-center gap-x-1.5 text-nowrap"
            >
              <span
                class="size-2 rounded-full"
                :class="
                  sensor.latest ? (sensor.isAlert ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-400'
                "
              />
              <span>
                {{ sensor.latest ? (sensor.isAlert ? 'Alert' : 'Ok') : 'N/A' }}
              </span>
            </span>

            <template v-else>
              {{ getCellValue(sensor, column.key) }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped></style>
