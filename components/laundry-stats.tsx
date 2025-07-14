"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shirt, Plus, Calendar, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {laundryApi} from "../lib/api"

interface Room {
  id: number
  roomName: string
}

interface LaundryStatsProps {
  rooms: Room[]
}

interface LaundryRecord {
  id: number
  roomId: number
  createdAt: string
}

interface LaundryStats {
  roomId: number
  roomName: string
  count: number
  detailTime: LaundryRecord[]
}

export function LaundryStats({ rooms }: LaundryStatsProps) {
  // make sure we always work with an array
  const safeRooms = Array.isArray(rooms) ? rooms : []
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-07")
  const [stats, setStats] = useState<LaundryStats[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchLaundryStats()
  }, [selectedMonth])

  const fetchLaundryStats = async () => {
  setLoading(true)
  try {
    const data = await laundryApi.stats(selectedMonth)
    setStats(data)
  } catch (error) {
    console.error("Error fetching laundry stats:", error)
  } finally {
    setLoading(false)
  }
}

  const addLaundryRecord = async (roomId: number) => {
  try {
    await laundryApi.save(roomId)

    toast({
      title: "Thành công",
      description: `Đã ghi nhận lần giặt cho ${safeRooms.find((r) => r.id === roomId)?.roomName}`,
    })

    fetchLaundryStats()
  } catch (error) {
    toast({
      title: "Lỗi",
      description: "Có lỗi xảy ra khi ghi nhận",
      variant: "destructive",
    })
  }
}

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTotalLaundry = () => {
    return stats.reduce((total, stat) => total + stat.count, 0)
  }

  const getMonthOptions = () => {
    const months = []
    for (let i = 1; i <= 12; i++) {
      months.push(`2025-${i.toString().padStart(2, "0")}`)
    }
    return months
  }

  if (safeRooms.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Không có dữ liệu phòng.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5 text-purple-600" />
                Thống kê giặt đồ
              </CardTitle>
              <CardDescription>Theo dõi số lần giặt của từng phòng theo tháng</CardDescription>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map((month) => (
                  <SelectItem key={month} value={month}>
                    Tháng {month.split("-")[1]}/2025
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tổng lần giặt</p>
                <p className="text-2xl font-bold text-purple-600">{getTotalLaundry()}</p>
              </div>
            </Card>
            <Card className="p-4 bg-pink-50 border-pink-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Phòng tham gia</p>
                <p className="text-2xl font-bold text-pink-600">{safeRooms.length}</p>
              </div>
            </Card>
            <Card className="p-4 bg-indigo-50 border-indigo-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Trung bình/phòng</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.length > 0 ? (getTotalLaundry() / stats.length).toFixed(1) : 0}
                </p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.roomId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{stat.roomName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.count} lần
                    </Badge>
                    <Button size="sm" onClick={() => addLaundryRecord(stat.roomId)} className="h-8">
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stat.detailTime.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Lịch sử giặt:</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {stat.detailTime.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            {formatDateTime(record.createdAt)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            #{record.id}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Shirt className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có lần giặt nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add cards for rooms without laundry records */}
          {safeRooms
            .filter((room) => !stats.find((stat) => stat.roomId === room.id))
            .map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{room.roomName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />0 lần
                      </Badge>
                      <Button size="sm" onClick={() => addLaundryRecord(room.id)} className="h-8">
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-gray-500">
                    <Shirt className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có lần giặt nào</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
