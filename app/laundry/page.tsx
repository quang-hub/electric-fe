"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { LaundryStats } from "@/components/laundry-stats"
import { roomApi } from "@/lib/api"

interface Room {
  id: number
  roomName: string
}

export default function LaundryPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const data = await roomApi.list()
      setRooms(data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thống kê giặt đồ</h1>
                <p className="text-sm sm:text-base text-gray-600">Theo dõi và quản lý hoạt động giặt đồ của các phòng</p>
              </div>
            </div>
          </div>

        </div>

        {/* Main Content */}
        <LaundryStats rooms={rooms} />
      </div>
    </div>
  )
}
