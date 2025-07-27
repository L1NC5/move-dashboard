import { defineStore } from 'pinia'
import { type Sensor, SensorService } from '@/services/SensorService.ts'
import { computed, type ComputedRef, type Ref, ref } from 'vue'

export const useSensorsStore = defineStore('sensors', () => {
  const sensorsData: Ref<Array<Sensor>> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<null | Error | string> = ref(null)

  const sensorIds: ComputedRef<Array<string>> = computed(() => {
    const ids: Array<string> = []

    sensorsData.value.map((sensor) => {
      ids.push(sensor.id)
    })

    return ids
  })

  /** Retrieves sensors data */
  const loadSensors = async () => {
    if (loading.value) return

    try {
      loading.value = true
      error.value = null
      sensorsData.value = await SensorService.getAllSensors()
    } catch (err) {
      error.value = (err as Error).message || 'Error while loading sensors'
    } finally {
      loading.value = false
    }
  }

  return {
    sensorsData,
    loadSensors,
    sensorIds,
    loading,
    error,
  }
})
