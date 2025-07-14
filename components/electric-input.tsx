"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, Trash2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { electricApi } from "@/lib/api"

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
  updatedAt: string // Assuming updatedAt is available
}

interface ElectricInputProps {
  rooms: Room[]
  onSave: () => void
  historicalElectricRecords: ElectricRecord[] // Pass historical data from parent
}

interface ElectricDataInput {
  roomId: number
  startElectric: number // For display, read-only
  endElectric: number // Editable by user
  updatedAt?: string // For display
}

export function ElectricInput({ rooms, onSave, historicalElectricRecords }: ElectricInputProps) {
  const [electricData, setElectricData] = useState<ElectricDataInput[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Initialize electricData when rooms or historicalElectricRecords change
  useEffect(() => {
    // Clear existing data if rooms or historical records change significantly
    // This prevents stale data if the underlying room list changes
    setElectricData(historicalElectricRecords)
  }, [rooms, historicalElectricRecords])

  const addElectricInput = () => {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không có phòng nào để thêm.",
        variant: "destructive",
      })
      return
    }

    if (electricData.length >= rooms.length) {
      toast({
        title: "Thông báo",
        description: "Đã thêm tất cả các phòng.",
        variant: "default",
      })
      return
    }

    const usedRoomIds = electricData.map((data) => data.roomId)
    const availableRoom = rooms.find((room) => !usedRoomIds.includes(room.id))

    if (availableRoom) {
      // Find the latest record for this room
      const latestRecord = historicalElectricRecords
        .filter((record) => record.roomId === availableRoom.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

      const initialStartElectric = latestRecord ? latestRecord.endElectric : 0
      const initialEndElectric = latestRecord ? latestRecord.endElectric : 0 // User will update this
      const lastUpdatedAt = latestRecord ? latestRecord.updatedAt : undefined

      setElectricData([
        ...electricData,
        {
          roomId: availableRoom.id,
          startElectric: initialStartElectric,
          endElectric: initialEndElectric,
          updatedAt: lastUpdatedAt,
        },
      ])
    }
  }

  const removeElectricInput = (index: number) => {
    setElectricData(electricData.filter((_, i) => i !== index))
  }

  const updateElectricData = (index: number, value: number) => {
    const updated = [...electricData]
    updated[index] = { ...updated[index], endElectric: value }
    setElectricData(updated)
  }

  const handleSave = async () => {
    if (electricData.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một bản ghi",
        variant: "destructive",
      })
      return
    }
    
    // Tạo map cho historicalElectricRecords để tra nhanh
  const latestElectricMap = new Map<number, number>()
  historicalElectricRecords.forEach((record) => {
    const prev = latestElectricMap.get(record.roomId)
    if (!prev || new Date(record.createdAt).getTime() > new Date(prev).getTime()) {
      latestElectricMap.set(record.roomId, record.endElectric)
    }
  })

  // Lọc ra bản ghi có endElectric khác với bản ghi cũ
  const changedData = electricData.filter((data) => {
    const oldEndElectric = latestElectricMap.get(data.roomId) ?? 0
    return data.endElectric !== oldEndElectric
  })

  if (changedData.length === 0) {
    toast({
      title: "Thông báo",
      description: "Chưa có thay đổi nào để lưu",
      variant: "default",
    })
    return
  }

    setLoading(true)
    try {
      // Map to the format expected by /api/electric/save
      const payload = changedData.map((data) => ({
        roomId: data.roomId,
        electric: data.endElectric, // 'electric' in API means 'endElectric'
      }))

      const response = await electricApi.save(payload)

      if (response === "ok") {
        // Assuming "ok" string response for success
        toast({
          title: "Thành công",
          description: `Đã lưu ${electricData.length} bản ghi số điện`,
        })

        setElectricData([]) // Clear form after successful save
        onSave() // Trigger parent to refetch electric records
      } else {
        throw new Error("Save failed")
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu dữ liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoomName = (roomId: number) => {
    return rooms.find((room) => room.id === roomId)?.roomName || `Phòng ${roomId}`
  }

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Invalid Date"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nhập số điện mới</CardTitle>
          <CardDescription>Nhập số điện hiện tại cho các phòng. Dữ liệu sẽ được lưu vào hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {electricData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có dữ liệu nào</p>
              <p className="text-sm">Nhấn "Thêm phòng" để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {electricData.map((data, index) => (
                <Card key={data.roomId} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label htmlFor={`room-${data.roomId}`}>Phòng</Label>
                      <Input
                        id={`room-${data.roomId}`}
                        value={getRoomName(data.roomId)}
                        readOnly
                        className="mt-1 bg-gray-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`start-electric-${data.roomId}`}>Số điện đầu (kWh)</Label>
                      <Input
                        id={`start-electric-${data.roomId}`}
                        type="number"
                        value={data.startElectric}
                        readOnly
                        className="mt-1 bg-gray-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`end-electric-${data.roomId}`}>Số điện cuối (kWh)</Label>
                      <Input
                        id={`end-electric-${data.roomId}`}
                        type="number"
                        value={data.endElectric}
                        onChange={(e) => updateElectricData(index, Number.parseInt(e.target.value) || 0)}
                        placeholder="Nhập số điện cuối"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDateTime(data.updatedAt)}
                      </Badge>
                      <Button variant="outline" size="icon" onClick={() => removeElectricInput(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={addElectricInput}
              disabled={electricData.length >= rooms.length || !Array.isArray(rooms) || rooms.length === 0}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm phòng ({electricData.length}/{rooms.length})
            </Button>

            {electricData.length > 0 && (
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu dữ liệu"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {electricData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Xem trước dữ liệu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {electricData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{getRoomName(data.roomId)}</span>
                  <Badge variant="secondary">
                    {data.startElectric} kWh {"->"} {data.endElectric} kWh
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
