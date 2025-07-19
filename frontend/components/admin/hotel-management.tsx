"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox" // Assuming you have a Checkbox component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Phone, Loader2, BedDouble } from "lucide-react"
import type { Hotel, Room } from "@/types"

interface HotelManagementProps {
  onStatsUpdate: () => void
}

interface RoomFormData {
  roomNumber: string
  type: string
  price: string // Keep as string for input, convert to number for API
  available: boolean
  hotelId: number | null // To link room to hotel
}

export function HotelManagement({ onStatsUpdate }: HotelManagementProps) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [selectedHotelForRoom, setSelectedHotelForRoom] = useState<Hotel | null>(null) // To add room to specific hotel

  const [hotelFormData, setHotelFormData] = useState({
    name: "",
    adress: "",
    city: "",
    state: "",
    zipcode: "",
    contact: "",
  })
  const [roomFormData, setRoomFormData] = useState<RoomFormData>({
    roomNumber: "",
    type: "",
    price: "",
    available: true,
    hotelId: null,
  })

  const [error, setError] = useState("")
  const [submittingHotel, setSubmittingHotel] = useState(false)
  const [submittingRoom, setSubmittingRoom] = useState(false)
  const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/api/hotels", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotelList || [])
      }
    } catch (error) {
      console.error("Error fetching hotels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("");
    setSubmittingHotel(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingHotel
        ? `http://localhost:8080/api/hotels/${editingHotel.id}`
        : "http://localhost:8080/api/hotels"

      const method = editingHotel ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(hotelFormData),
      })

      if (response.ok) {
        await fetchHotels()
        onStatsUpdate()
        setIsHotelDialogOpen(false)
        setSuccessMessage(`Hotel ${editingHotel ? "updated" : "created"} successfully!`);
        resetHotelForm()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Operation failed")
      }
    } catch (error) {
      setError("An error occurred")
    } finally {
      setSubmittingHotel(false)
    }
  }

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("");
    setSubmittingRoom(true)

    if (!roomFormData.hotelId) {
      setError("Hotel not selected for room.")
      setSubmittingRoom(false);
      return;
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNumber: roomFormData.roomNumber,
          type: roomFormData.type,
          price: parseFloat(roomFormData.price),
          available: roomFormData.available,
          hotelId: roomFormData.hotelId,
        }),
      })

      if (response.ok) {
        await fetchHotels() // Re-fetch hotels to update room count
        onStatsUpdate()
        setIsRoomDialogOpen(false)
        setSuccessMessage(`Room ${roomFormData.roomNumber} added to ${selectedHotelForRoom?.name} successfully!`);
        resetRoomForm()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to add room")
      }
    } catch (error) {
      setError("An error occurred while adding the room")
    } finally {
      setSubmittingRoom(false)
    }
  }


  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setHotelFormData({
      name: hotel.name,
      adress: hotel.adress,
      city: hotel.city,
      state: hotel.state,
      zipcode: hotel.zipcode,
      contact: hotel.contact,
    })
    setIsHotelDialogOpen(true)
  }

  const handleDeleteHotel = async (hotelId: number) => {
    if (!confirm("Are you sure you want to delete this hotel? This will also delete all associated rooms and bookings.")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/hotels/${hotelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        await fetchHotels()
        onStatsUpdate()
        setSuccessMessage("Hotel deleted successfully!");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete hotel");
      }
    } catch (error) {
      console.error("Error deleting hotel:", error)
      setError("An error occurred while deleting the hotel.");
    }
  }

  const handleAddRoomClick = (hotel: Hotel) => {
    setSelectedHotelForRoom(hotel);
    setRoomFormData(prev => ({ ...prev, hotelId: hotel.id }));
    setIsRoomDialogOpen(true);
  }

  const resetHotelForm = () => {
    setHotelFormData({
      name: "",
      adress: "",
      city: "",
      state: "",
      zipcode: "",
      contact: "",
    })
    setEditingHotel(null)
    setError("")
  }

  const resetRoomForm = () => {
    setRoomFormData({
      roomNumber: "",
      type: "",
      price: "",
      available: true,
      hotelId: null,
    })
    setSelectedHotelForRoom(null);
    setError("");
  }


  const handleHotelDialogClose = () => {
    setIsHotelDialogOpen(false)
    resetHotelForm()
  }

  const handleRoomDialogClose = () => {
    setIsRoomDialogOpen(false)
    resetRoomForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hotel Management</h2>
          <p className="text-gray-600">Manage your hotel properties</p>
        </div>
        <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsHotelDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHotel ? "Edit Hotel" : "Add New Hotel"}</DialogTitle>
              <DialogDescription>
                {editingHotel ? "Update hotel information" : "Create a new hotel property"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleHotelSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Hotel Name</Label>
                  <Input
                    id="name"
                    value={hotelFormData.name}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={hotelFormData.contact}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, contact: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="adress">Address</Label>
                <Input
                  id="adress"
                  value={hotelFormData.adress}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, adress: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={hotelFormData.city}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={hotelFormData.state}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, state: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipcode">Zip Code</Label>
                  <Input
                    id="zipcode"
                    value={hotelFormData.zipcode}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, zipcode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={handleHotelDialogClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingHotel} className="flex-1">
                  {submittingHotel && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingHotel ? "Update Hotel" : "Create Hotel"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {successMessage && (
        <Alert className="bg-green-100 border-green-400 text-green-700">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{hotel.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.city}, {hotel.state}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{hotel.rooms?.length || 0} rooms</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p>{hotel.adress}</p>
                <p className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {hotel.contact}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditHotel(hotel)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddRoomClick(hotel)} className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Room
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteHotel(hotel.id)} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hotels.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first hotel</p>
            <Button onClick={() => setIsHotelDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Room to {selectedHotelForRoom?.name}</DialogTitle>
            <DialogDescription>
              Enter details for the new room in {selectedHotelForRoom?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRoomSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={roomFormData.roomNumber}
                  onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Input
                  id="roomType"
                  value={roomFormData.type}
                  onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price per Night</Label>
                <Input
                  id="price"
                  type="number"
                  value={roomFormData.price}
                  onChange={(e) => setRoomFormData({ ...roomFormData, price: e.target.value })}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 mt-auto pb-2">
                <Checkbox
                  id="available"
                  checked={roomFormData.available}
                  onCheckedChange={(checked) => setRoomFormData({ ...roomFormData, available: typeof checked === 'boolean' ? checked : true })}
                />
                <Label htmlFor="available">Available</Label>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={handleRoomDialogClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={submittingRoom} className="flex-1">
                {submittingRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Room
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}