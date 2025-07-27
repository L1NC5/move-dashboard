import { defineStore } from 'pinia'
import { computed, type ComputedRef, ref, type Ref } from 'vue'
import { type Measurement, MeasurementsService } from '@/services/MeasurementsService.ts'

type MeasurementsMap = Record<string, Array<Measurement>>
type LatestMeasurementMap = Record<string, Measurement>
type LoadingMap = Record<string, boolean>

export const useMeasurementsStore = defineStore('measurements', () => {
  const measurementsData: Ref<MeasurementsMap> = ref({})
  const loadingBySensorId: Ref<LoadingMap> = ref({})
  const error: Ref<null | Error | string> = ref(null)

  /** Load measurements data for a single sensor */
  const loadSensorMeasurements = async (sensorId: string) => {
    if (loadingBySensorId.value[sensorId]) return

    try {
      loadingBySensorId.value[sensorId] = true
      error.value = null

      const measurementsGroup = await MeasurementsService.getMeasurements(sensorId)
      measurementsData.value[sensorId] = measurementsGroup.measurements
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading measurements'
    } finally {
      loadingBySensorId.value[sensorId] = false
    }
  }

  /** Load multiple sensors' measurements in parallel */
  const loadMultipleSensorsMeasurements = async (sensorIds: Array<string>) => {
    const promises = sensorIds.map((sensorId) => loadSensorMeasurements(sensorId))
    await Promise.all(promises)
  }

  /** Get the latest measurement per sensor */
  const latestMeasurementBySensor: ComputedRef<LatestMeasurementMap> = computed(() => {
    const latest: LatestMeasurementMap = {}

    for (const [sensorId, measurements] of Object.entries(measurementsData.value)) {
      let latestMeasurement: Measurement | null = null

      for (const measurement of measurements) {
        if (
          !latestMeasurement ||
          new Date(measurement.timestamp) > new Date(latestMeasurement.timestamp)
        ) {
          latestMeasurement = measurement
        }
      }

      if (latestMeasurement) {
        latest[sensorId] = latestMeasurement
      }
    }

    return latest
  })

  return {
    measurementsData,
    loadingBySensorId,
    error,
    loadSensorMeasurements,
    loadMultipleSensorsMeasurements,
    latestMeasurementBySensor,
  }
})
