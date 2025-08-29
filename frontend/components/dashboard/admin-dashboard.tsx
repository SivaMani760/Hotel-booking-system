"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Hotel, Users, Calendar, Settings } from "lucide-react"
import { HotelManagement } from "@/components/admin/hotel-management"
import { UserManagement } from "@/components/admin/user-management"
import { BookingManagement } from "@/components/admin/booking-management"
import type { Booking } from "@/types"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch hotels
      const hotelsResponse = await fetch(`${API_URL}/hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch users
      const usersResponse = await fetch(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch bookings
      const bookingsResponse = await fetch(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (hotelsResponse.ok && usersResponse.ok && bookingsResponse.ok) {
        const hotelsData = await hotelsResponse.json()
        const usersData = await usersResponse.json()
        const bookingsData = await bookingsResponse.json()

        const totalRevenue =
          bookingsData.bookingList?.reduce((sum: number, booking: Booking) => sum + (booking.totalAmount || 0), 0) || 0

        setStats({
          totalHotels: hotelsData.hotelList?.length || 0,
          totalUsers: usersData.userList?.length || 0,
          totalBookings: bookingsData.bookingList?.length || 0,
          totalRevenue,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hotel className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <Badge variant="default">{user.role}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHotels}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="hotels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hotels" className="flex items-center space-x-2">
              <Hotel className="h-4 w-4" />
              <span>Hotels</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Bookings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hotels">
            <HotelManagement onStatsUpdate={fetchDashboardStats} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement onStatsUpdate={fetchDashboardStats} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement onStatsUpdate={fetchDashboardStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
