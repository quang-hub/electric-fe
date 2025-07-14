"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Zap, Home, Calculator, Upload, Shirt } from "lucide-react"
import { RoomList } from "@/components/room-list"
import { ElectricInput } from "@/components/electric-input"
import { ElectricCalculator } from "@/components/electric-calculator"
import { roomApi, electricApi } from "@/lib/api"

interface Room {
  id: number
  roomName: string
}

interface ElectricRecord {
  id: number
  startElectric: number
  endElectric: number
  month: string
  roomId: number
  createdAt: string
  updatedAt: string
}

export default function Component() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [electricRecords, setElectricRecords] = useState<ElectricRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchRooms()
    fetchElectricRecords()
  }, [])

  const fetchRooms = async () => {
    try {
      const data = await roomApi.list()
      setRooms(data)
    } catch (err) {
      console.error("Error fetching rooms:", err)
    }
  }

  const fetchElectricRecords = async () => {
    try {
      const data = await electricApi.list()
      setElectricRecords(data)
    } catch (err) {
      console.error("Error fetching electric records:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadToGoogleDrive = async () => {
    try {
      setLoading(true)
      // const response = await electricApi.upload();

      window.open("http://crossover.proxy.rlwy.net:27204/auth/google", "_blank")
    } catch (error) {
      console.error("Error uploading to Google Drive:", error)
      alert("Có lỗi xảy ra khi upload!")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Zap className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý tiền điện</h1>
              <p className="text-gray-600">Hệ thống tính toán và quản lý tiền điện phòng trọ</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tổng số phòng</p>
                      <p className="text-2xl font-bold">{rooms.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Bản ghi điện</p>
                      <p className="text-2xl font-bold">{electricRecords.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => (window.location.href = "/laundry")}
                variant="outline"
                className="bg-purple-50 hover:bg-purple-100 border-purple-200"
              >
                <Shirt className="h-4 w-4 mr-2" />
                Thống kê giặt
              </Button>

              <Button onClick={() => {
                const confirmView = window.confirm("Bạn có muốn xem chi tiết folder Google Drive không?")
                if (confirmView) {
                  window.open(`https://drive.google.com/drive/folders/1y4LxH1-JEvZ9szaZ9Uj4aWHHv4rSgc3r`, "_blank")
                }
                // Tiếp tục gọi API upload sau đó
                handleUploadToGoogleDrive()
              }} className="bg-green-600 hover:bg-green-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Google Drive
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Danh sách phòng
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Nhập số điện
            </TabsTrigger>
            <TabsTrigger value="calculate" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Tính toán
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            <RoomList rooms={rooms} electricRecords={electricRecords} />
          </TabsContent>

          <TabsContent value="input">
            <ElectricInput rooms={rooms} onSave={fetchElectricRecords} historicalElectricRecords={electricRecords} />
          </TabsContent>

          <TabsContent value="calculate">
            <ElectricCalculator rooms={rooms} historicalElectricRecords={electricRecords} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
