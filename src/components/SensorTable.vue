<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Sensor } from '@/services/SensorService.ts'
import type { LatestMeasurementMap } from '@/stores/MeasurementsStore.ts'
import CaretDown from '@/components/icons/CaretDown.vue'

type SensorTableColumnKey = keyof Sensor | 'lastValue' | 'status' | 'button'

interface SensorTableColumn {
  key: SensorTableColumnKey
  label: string
}

const props = defineProps<{
  sensors: Array<Sensor>
  latestMeasurements: LatestMeasurementMap
}>()

const emit = defineEmits<{
  (e: 'changeGraphSensor', id: string): void
}>()

const sortKey = ref<SensorTableColumnKey>('id')
const sortAsc = ref<boolean>(true)

const sortedSensors = computed(() => {
  const sorted = [...props.sensors]

  sorted.sort((a, b) => {
    const aVal = getCellValue(a, sortKey.value)
    const bVal = getCellValue(b, sortKey.value)

    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc.value ? aVal - bVal : bVal - aVal
    }

    return sortAsc.value
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  return sorted
})

const toggleSort = (key: SensorTableColumnKey) => {
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
  { key: 'lastValue', label: 'Last value' },
  { key: 'status', label: 'Status' },
  { key: 'button', label: '' },
]

const getCellValue = (sensor: Sensor, key: SensorTableColumnKey) => {
  if (key in sensor) {
    return sensor[key as keyof Sensor]
  }

  const latest = props.latestMeasurements[sensor.id]

  switch (key) {
    case 'lastValue':
      return latest ? latest.disp_mm : 'N/A'
    case 'status':
      return latest ? latest.disp_mm > sensor.threshold : false
    default:
      return undefined
  }
}
</script>

<template>
  <table class="w-full overflow-x-auto">
    <thead>
      <tr class="bg-neutral-200">
        <th v-for="column in columns" :key="column.key" class="border border-neutral-300">
          <template v-if="column.key !== 'button'">
            <button
              class="size-full inline-flex justify-between items-center gap-x-4 px-4 py-2 bg-neutral-200 text-nowrap"
              @click="toggleSort(column.key)"
            >
              {{ column.label }}
              <CaretDown
                class="transition-transform duration-100"
                :class="{
                  'rotate-180': !sortAsc,
                  'opacity-0': sortKey !== column.key,
                }"
              />
            </button>
          </template>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="sensor in sortedSensors" :key="sensor.id" class="even:bg-white odd:bg-neutral-50">
        <td v-for="column in columns" :key="column.key" class="px-4 py-2 border border-neutral-200">
          <template v-if="column.key === 'button'">
            <button @click="emit('changeGraphSensor', sensor.id)">Show data</button>
          </template>
          <template v-else>
            {{ getCellValue(sensor, column.key) }}
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
