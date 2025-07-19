// components/admin/booking-management.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, User, Bed, Loader2, Trash2, Info } from "lucide-react" // Added Info
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Added DialogFooter
} from "@/components/ui/dialog" // Import Dialog components
import type { Booking } from "@/types"

interface BookingManagementProps {
  onStatsUpdate: () => void
}

export function BookingManagement({ onStatsUpdate }: BookingManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingBooking, setUpdatingBooking] = useState<number | null>(null)
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // New state for confirmation dialog visibility
  const [bookingToConfirm, setBookingToConfirm] = useState<Booking | null>(null); // New state for the booking being confirmed


  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookingList || [])
      } else {
        setActionError("Failed to fetch bookings.");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setActionError("Error fetching bookings. Please try again.");
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    setActionError(null);
    setActionSuccess(null);
    setUpdatingBooking(bookingId)
    try {
      const token = localStorage.getItem("token")
      const booking = bookings.find((b) => b.id === bookingId)
      if (!booking) {
        setActionError("Booking not found for update.");
        return;
      }

      const updatedBooking = { ...booking, status: newStatus };

      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBooking),
      })

      if (response.ok) {
        setActionSuccess(`Booking #${bookingId} status updated to ${newStatus}.`);
        await fetchBookings()
        onStatsUpdate()
      } else {
        const errorData = await response.json();
        setActionError(errorData.message || "Failed to update booking status.");
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      setActionError("An error occurred while updating booking status.");
    } finally {
      setUpdatingBooking(null)
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    setActionError(null);
    setActionSuccess(null);
    setDeletingBookingId(bookingId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setActionSuccess(`Booking #${bookingId} deleted successfully.`);
        await fetchBookings();
        onStatsUpdate();
      } else {
        const errorData = await response.json();
        setActionError(errorData.message || "Failed to delete booking record. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setActionError("An error occurred while trying to delete the booking record.");
    } finally {
      setDeletingBookingId(null);
      setShowConfirmDialog(false); // Close dialog after action
      setBookingToConfirm(null);
    }
  };

  const openConfirmDialog = (booking: Booking) => {
    setActionError(null);
    setActionSuccess(null);
    setBookingToConfirm(booking);
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setBookingToConfirm(null);
  };

  const performConfirmedDelete = () => {
    if (bookingToConfirm) {
      handleDeleteBooking(bookingToConfirm.id);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
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
      <div>
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <p className="text-gray-600">Manage all hotel bookings</p>
      </div>

      {actionSuccess && (
        <Alert className="bg-green-100 border-green-400 text-green-700">
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Booking #{booking.id}</span>
                    <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {booking.hotelName || "Hotel Name"}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${booking.totalAmount?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Guest</p>
                    <p className="text-sm text-gray-600">{booking.userId?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Check-in</p>
                    <p className="text-sm text-gray-600">{booking.checkInDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Check-out</p>
                    <p className="text-sm text-gray-600">{booking.checkOutDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Bed className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Room</p>
                    <p className="text-sm text-gray-600">
                      {booking.roomNumber || "N/A"} ({booking.roomType || "N/A"})
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>Guest Email: {booking.userId?.email || "N/A"}</p>
                  <p>Hotel Contact: {booking.hotelId?.contact || "N/A"}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => updateBookingStatus(booking.id, value)}
                    disabled={updatingBooking === booking.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {updatingBooking === booking.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  
                  {/* Delete Button for Admin */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => booking.id && openConfirmDialog(booking)} // Open dialog
                    disabled={deletingBookingId === booking.id}
                    className="ml-2"
                  >
                    {deletingBookingId === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">Bookings will appear here as customers make reservations</p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Admin Delete */}
      <Dialog open={showConfirmDialog} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Confirm Deletion</span>
            </DialogTitle>
            // Inside components/admin/booking-management.tsx, in the DialogDescription section
            <DialogDescription>
              Are you sure you want to permanently delete booking #<strong>{bookingToConfirm?.id}</strong>?
              {/* Change <div> to <span> */}
              <span className="mt-2 font-medium text-red-600 block"> {/* Added block to apply mt-2 */}
                This action will permanently remove the booking record and cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={closeConfirmDialog} disabled={deletingBookingId !== null}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={performConfirmedDelete}
              disabled={deletingBookingId !== null}
            >
              {deletingBookingId === bookingToConfirm?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}