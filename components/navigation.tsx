"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Shirt, Upload } from "lucide-react"
import { usePathname } from "next/navigation"

interface NavigationProps {
  onUploadToGoogleDrive?: () => void
}

export function Navigation({ onUploadToGoogleDrive }: NavigationProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Trang chủ",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/laundry",
      label: "Thống kê giặt",
      icon: Shirt,
      active: pathname === "/laundry",
    },
  ]

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant={item.active ? "default" : "outline"}
                  onClick={() => (window.location.href = item.href)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>

          {onUploadToGoogleDrive && (
            <Button onClick={onUploadToGoogleDrive} className="bg-green-600 hover:bg-green-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Google Drive
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
