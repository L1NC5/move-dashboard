import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import {
  type Measurement,
  type MeasurementGroup,
  MeasurementsService,
} from '@/services/MeasurementsService.ts'

export const useMeasurementsStore = defineStore('measurements', () => {
  const measurementsData: Ref<Array<MeasurementGroup>> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<null | Error | string> = ref(null)

  /** Retrieves measurements data */
  const loadMeasurements = async () => {
    try {
      loading.value = true
      error.value = null

      measurementsData.value = await MeasurementsService.getAllMeasurements()
    } catch (err) {
      error.value = (err as Error).message || 'Error loading measurements'
    } finally {
      loading.value = false
    }
  }

  /** Create a record containing all the latest measurements for each sensor */
  const latestMeasurementBySensorId = computed(() => {
    const latest: Record<string, Measurement> = {}

    for (const group of measurementsData.value) {
      const sensorId = group.id
      for (const m of group.measurements) {
        const current = latest[sensorId]
        if (!current || new Date(m.timestamp) > new Date(current.timestamp)) {
          latest[sensorId] = m
        }
      }
    }
    return latest
  })

  return {
    measurementsData,
    loadMeasurements,
    latestMeasurementBySensorId,
    loading,
    error,
  }
})
