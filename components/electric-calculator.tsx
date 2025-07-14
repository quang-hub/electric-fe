"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calculator, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { electricApi } from "@/lib/api" // Import electricApi

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

interface ElectricCalculatorProps {
  rooms: Room[]
  historicalElectricRecords: ElectricRecord[] // New prop for historical data
}

interface ElectricDetailForCalculation {
  roomId: number
  startElectric: number
  endElectric: number
}

interface CalculationResult {
  pricePerUnit: number
  shareElectric: number
  shareMoney: number
  electricDetails: {
    roomId: number
    roomName: string
    elctricityUsedInLaundry: number
    totalElectricUsed: number
    totalMoney: number
  }[]
}

export function ElectricCalculator({ rooms, historicalElectricRecords }: ElectricCalculatorProps) {
  const [totalMoney, setTotalMoney] = useState<number>(0)
  const [totalElectric, setTotalElectric] = useState<number>(0)
  const [month, setMonth] = useState<string>("") // Initialize with empty string
  const [electrics, setElectrics] = useState<ElectricDetailForCalculation[]>([])
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Initialize month to current month (YYYY-MM) and electrics from historical data
  useEffect(() => {
    const today = new Date()
    const currentMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`
    setMonth(currentMonth)

    if (Array.isArray(rooms) && Array.isArray(historicalElectricRecords)) {
      const latestElectrics = rooms.map((room) => {
        const latestRecord = historicalElectricRecords
          .filter((record) => record.roomId === room.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

        return {
          roomId: room.id,
          startElectric: latestRecord ? latestRecord.startElectric : 0,
          endElectric: latestRecord ? latestRecord.endElectric : 0,
        }
      })
      setElectrics(latestElectrics)
    }
  }, [rooms, historicalElectricRecords])

  const handleCalculate = async () => {
    if (!totalMoney || !totalElectric || electrics.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin tổng quan và đảm bảo có dữ liệu điện phòng.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const requestData = {
        totalMoney,
        totalElectric,
        month,
        electrics,
      }

      const data = await electricApi.calculate(requestData) // Using the API helper
      setResult(data)
      toast({
        title: "Thành công",
        description: "Đã tính toán xong tiền điện",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tính toán",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoomName = (roomId: number) => {
    return rooms.find((room) => room.id === roomId)?.roomName || `Phòng ${roomId}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Ensure rooms and electrics are arrays before rendering
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Không có dữ liệu phòng để tính toán.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tính toán tiền điện</CardTitle>
          <CardDescription>Nhập thông tin tổng quan và xem chi tiết số điện từng phòng để tính toán.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="totalMoney">Tổng tiền điện (VNĐ)</Label>
              <Input
                id="totalMoney"
                type="number"
                value={totalMoney}
                onChange={(e) => setTotalMoney(Number.parseInt(e.target.value) || 0)}
                placeholder="1600000"
              />
            </div>
            <div>
              <Label htmlFor="totalElectric">Tổng số điện (kWh)</Label>
              <Input
                id="totalElectric"
                type="number"
                value={totalElectric}
                onChange={(e) => setTotalElectric(Number.parseInt(e.target.value) || 0)}
                placeholder="550"
              />
            </div>
            <div>
              <Label htmlFor="month">Tháng</Label>
              <Input id="month" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2025-07" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Chi tiết số điện các phòng</h3>
              {/* Removed "Thêm phòng" button */}
            </div>

            {electrics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Không có dữ liệu số điện lịch sử cho các phòng.</p>
                <p className="text-sm">Vui lòng nhập số điện ở tab "Nhập số điện" trước.</p>
              </div>
            ) : (
              electrics.map((electric) => (
                <Card key={electric.roomId} className="p-4 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <Label>Phòng</Label>
                      <Input value={getRoomName(electric.roomId)} readOnly className="mt-1 bg-gray-100" />
                    </div>
                    <div>
                      <Label>Số điện đầu</Label>
                      <Input type="number" value={electric.startElectric} readOnly className="mt-1 bg-gray-100" />
                    </div>
                    <div>
                      <Label>Số điện cuối</Label>
                      <Input type="number" value={electric.endElectric} readOnly className="mt-1 bg-gray-100" />
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Badge variant="secondary" className="w-full justify-center">
                        Sử dụng: {electric.endElectric - electric.startElectric} kWh
                      </Badge>
                      {/* Removed "Xóa" button */}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Button
            onClick={handleCalculate}
            disabled={loading || !totalMoney || !totalElectric || electrics.length === 0}
            className="w-full"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {loading ? "Đang tính toán..." : "Tính toán tiền điện"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Kết quả tính toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-50">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Giá mỗi kWh</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(result.pricePerUnit)}</p>
                </div>
              </Card>
              <Card className="p-4 bg-green-50">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Điện chung</p>
                  <p className="text-xl font-bold text-green-600">{result.shareElectric.toFixed(1)} kWh</p>
                </div>
              </Card>
              <Card className="p-4 bg-orange-50">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tiền chung</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(result.shareMoney)}</p>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chi tiết từng phòng</h3>
              {result.electricDetails.map((detail) => (
                <Card key={detail.roomId} className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                    <h4 className="font-semibold">{detail.roomName}</h4>
                    <Badge className="bg-green-600 mt-2 sm:mt-0">{formatCurrency(detail.totalMoney)}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Điện giặt</p>
                      <p className="font-medium">{detail.elctricityUsedInLaundry.toFixed(1)} kWh</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tổng điện</p>
                      <p className="font-medium">{detail.totalElectricUsed.toFixed(1)} kWh</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tiền điện</p>
                      <p className="font-medium text-green-600">{formatCurrency(detail.totalMoney)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
