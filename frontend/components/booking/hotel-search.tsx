"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Bed, Calendar } from "lucide-react"
import { BookingModal } from "./booking-modal"
import type { Hotel } from "@/types"

interface HotelSearchProps {
  onBookingSuccess?: () => void
}

export function HotelSearch({ onBookingSuccess }: HotelSearchProps) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHotels()
  }, [])

  useEffect(() => {
    filterHotels()
  }, [searchTerm, hotels])

  const fetchHotels = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/hotels")
      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotelList || [])
        setFilteredHotels(data.hotelList || [])
      }
    } catch (error) {
      console.error("Error fetching hotels:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHotels = () => {
    if (!searchTerm) {
      setFilteredHotels(hotels)
      return
    }

    const filtered = hotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.state.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredHotels(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Find Your Perfect Stay</span>
          </CardTitle>
          <CardDescription>Search hotels by name, city, or state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Hotels</Label>
              <Input
                id="search"
                placeholder="Enter hotel name, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={filterHotels}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotels Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHotels.map((hotel) => (
          <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{hotel.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.city}, {hotel.state}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  4.5
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>{hotel.adress}</p>
                <p>Contact: {hotel.contact}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Bed className="h-4 w-4 mr-1" />
                  {hotel.rooms?.length || 0} rooms available
                </div>
                <Button onClick={() => setSelectedHotel(hotel)} size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHotels.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Booking Modal */}
      {selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          isOpen={!!selectedHotel}
          onClose={() => setSelectedHotel(null)}
          onBookingSuccess={onBookingSuccess}
        />
      )}
    </div>
  )
}
