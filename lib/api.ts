// API utility functions
const API_BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL || ""
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }

    // Check if response has content
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    }

    // For responses that just return "ok" or empty body
    return "ok" as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// API functions
export const roomApi = {
  list: () => apiRequest<Array<{ id: number; roomName: string }>>("/api/room/list"),
}

export const electricApi = {
  list: () =>
    apiRequest<
      Array<{
        id: number
        startElectric: number
        endElectric: number
        month: string
        roomId: number
        createdAt: string
        updatedAt: string
        deleted: boolean
      }>
    >("/api/electric/list"),

  save: (data: Array<{ roomId: number; electric: number }>) =>
    apiRequest<string>("/api/electric/save", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  calculate: (data: {
    totalMoney: number
    totalElectric: number
    month: string
    electrics: Array<{
      roomId: number
      startElectric: number
      endElectric: number
    }>
  }) =>
    apiRequest<{
      pricePerUnit: number
      shareElectric: number
      shareMoney: number
      electricDetails: Array<{
        roomId: number
        roomName: string
        elctricityUsedInLaundry: number
        totalElectricUsed: number
        totalMoney: number
      }>
    }>("/api/electric/calculate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  upload: () =>
    apiRequest<string>("/auth/google", {
      method: "GET",
    }),
}

export const laundryApi = {
  stats: (month: string) =>
    apiRequest<
      Array<{
        roomId: number
        roomName: string
        count: number
        detailTime: Array<{
          id: number
          roomId: number
          createdAt: string
        }>
      }>
    >(`/api/laundry/stats?month=${month}`),

  save: (roomId: number) => apiRequest<string>(`/api/laundry/save?roomId=${roomId}`),
}
