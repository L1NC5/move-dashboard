export interface Sensor {
  id: string
  name: string
  location: string
  threshold: number
}

export class SensorService {
  private static BASE_URL = '/api'

  /** Generic function handling the Json fetching and errors */
  private static async fetchJson<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP Error while fetching ${endpoint}. Status: ${response.status}`)
    }

    return response.json()
  }

  /** Retrieves all sensors from the API */
  static async getAllSensors(): Promise<Array<Sensor>> {
    return this.fetchJson<Array<Sensor>>('/sensors')
  }

  /** Retrieves a specific sensor's info from the API */
  static async getSensor(sensorID: string): Promise<Sensor> {
    return this.fetchJson<Sensor>(`/sensors/${sensorID}`)
  }
}
