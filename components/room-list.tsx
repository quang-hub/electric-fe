"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Calendar } from "lucide-react"

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
}

interface RoomListProps {
  rooms: Room[]
  electricRecords: ElectricRecord[]
}

export function RoomList({ rooms, electricRecords }: RoomListProps) {
  // Ensure we always work with an array to avoid runtime errors
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return <div className="text-center text-gray-500">Không có dữ liệu phòng để hiển thị.</div>
  }

  const getRoomElectricData = (roomId: number) => {
    return electricRecords.filter((record) => record.roomId === roomId)
  }

  const getLatestRecord = (roomId: number) => {
    const records = getRoomElectricData(roomId)
    return records.length > 0 ? records[records.length - 1] : null
  }

  const calculateUsage = (record: ElectricRecord | null) => {
    if (!record) return 0
    return record.endElectric - record.startElectric
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => {
        const latestRecord = getLatestRecord(room.id)
        const usage = calculateUsage(latestRecord)
        const records = getRoomElectricData(room.id)

        return (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{room.roomName}</CardTitle>
                <Badge variant={latestRecord ? "default" : "secondary"}>
                  {latestRecord ? "Có dữ liệu" : "Chưa có dữ liệu"}
                </Badge>
              </div>
              <CardDescription>Phòng ID: {room.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestRecord ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Số điện đầu</p>
                      <p className="text-xl font-bold text-blue-600">{latestRecord.startElectric}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Số điện cuối</p>
                      <p className="text-xl font-bold text-green-600">{latestRecord.endElectric}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Tiêu thụ</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{usage} kWh</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Tháng {latestRecord.month}/2025</span>
                  </div>

                  <div className="text-xs text-gray-400">Tổng {records.length} bản ghi</div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có dữ liệu điện</p>
                  <p className="text-xs">Vui lòng nhập số điện</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
