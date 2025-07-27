export interface MeasurementGroup {
  id: string
  measurements: Array<Measurement>
}

export interface Measurement {
  timestamp: string
  disp_mm: number
}

export class MeasurementsService {
  private static BASE_URL = '/api'

  /** Generic function handling the Json fetching and errors */
  private static async fetchJson<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP Error while fetching ${endpoint}. Status: ${response.status}`)
    }

    return response.json()
  }

  /** Retrieves all measurements from the API */
  static async getAllMeasurements(): Promise<Array<MeasurementGroup>> {
    return await this.fetchJson<Array<MeasurementGroup>>('/measurements')
  }

  /** Retrieves a specific sensor's measurements from the API */
  static async getMeasurements(sensorId: string): Promise<MeasurementGroup> {
    return await this.fetchJson<MeasurementGroup>(`/measurements/${sensorId}`)
  }
}
