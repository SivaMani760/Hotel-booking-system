// components/booking/booking-history.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Bed, RefreshCw, XCircle, Trash2, Loader2, Info } from "lucide-react" // Added Info
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Added DialogFooter
} from "@/components/ui/dialog" // Import Dialog components
import type { Booking } from "@/types"

interface BookingHistoryProps {
  bookings: Booking[]
  loading: boolean
  onRefresh: () => void
}

type ConfirmAction = 'cancel' | 'delete' | null;

export function BookingHistory({ bookings, loading, onRefresh }: BookingHistoryProps) {
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // New state for confirmation dialog visibility
  const [bookingToConfirm, setBookingToConfirm] = useState<Booking | null>(null); // New state for the booking being confirmed
  const [currentConfirmAction, setCurrentConfirmAction] = useState<ConfirmAction>(null); // New state for the type of action


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

  const handleCancelBooking = async (bookingId: number) => {
    setActionError(null);
    setActionSuccess(null);
    setCancellingBookingId(bookingId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setActionSuccess("Booking cancelled successfully! A 90% refund has been processed.");
        onRefresh();
      } else {
        const errorData = await response.json();
        setActionError(errorData.message || "Failed to cancel booking. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setActionError("An error occurred while trying to cancel the booking.");
    } finally {
      setCancellingBookingId(null);
      setShowConfirmDialog(false); // Close dialog after action
      setBookingToConfirm(null);
      setCurrentConfirmAction(null);
    }
  };

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
        setActionSuccess("Booking record deleted successfully.");
        onRefresh();
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
      setCurrentConfirmAction(null);
    }
  };

  const openConfirmDialog = (booking: Booking, action: ConfirmAction) => {
    setActionError(null); // Clear previous errors
    setActionSuccess(null); // Clear previous successes
    setBookingToConfirm(booking);
    setCurrentConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setBookingToConfirm(null);
    setCurrentConfirmAction(null);
  };

  const performConfirmedAction = () => {
    if (!bookingToConfirm || !currentConfirmAction) return;

    if (currentConfirmAction === 'cancel') {
      handleCancelBooking(bookingToConfirm.id);
    } else if (currentConfirmAction === 'delete') {
      handleDeleteBooking(bookingToConfirm.id);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-gray-600">View and manage your hotel reservations</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">Your hotel reservations will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "CONFIRMED";
            const isCancelled = booking.status === "CANCELLED";
            const isPending = booking.status === "PENDING";

            const canCancel = isConfirmed; 
            const canDelete = isCancelled || isPending;


            return (
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
                  <div className="grid md:grid-cols-3 gap-4">
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

                  {booking.hotelName && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Hotel Details</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{booking.hotelName}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t space-x-2">
                    {isCancelled ? (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <XCircle className="h-4 w-4" />
                        <span>Cancelled</span>
                      </Badge>
                    ) : (
                      canCancel && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => booking.id && openConfirmDialog(booking, 'cancel')} // Open dialog
                          disabled={cancellingBookingId === booking.id}
                        >
                          {cancellingBookingId === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Cancel Booking
                        </Button>
                      )
                    )}
                    {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => booking.id && openConfirmDialog(booking, 'delete')} // Open dialog
                          disabled={deletingBookingId === booking.id}
                        >
                          {deletingBookingId === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Confirm Action</span>
            </DialogTitle>
            // Inside components/booking/booking-history.tsx, in the DialogDescription section
            // Inside components/booking/booking-history.tsx, in the DialogDescription section
            <DialogDescription>
              {currentConfirmAction === 'cancel' ? (
                <>
                  Are you sure you want to cancel booking #<strong>{bookingToConfirm?.id}</strong>?
                  {/* Change <div> to <span> */}
                  <span className="mt-2 font-medium text-red-600 block"> {/* Added block to apply mt-2 */}
                    This action cannot be undone and is subject to the 2-hour cancellation policy.
                    A 90% refund will be processed if eligible.
                  </span>
                </>
              ) : currentConfirmAction === 'delete' ? (
                <>
                  Are you sure you want to permanently delete booking record #<strong>{bookingToConfirm?.id}</strong>?
                  {/* Change <div> to <span> */}
                  <span className="mt-2 font-medium text-red-600 block"> {/* Added block to apply mt-2 */}
                    This action will remove the booking from your history and cannot be recovered.
                  </span>
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={closeConfirmDialog} disabled={cancellingBookingId !== null || deletingBookingId !== null}>
              Cancel
            </Button>
            <Button
              variant={currentConfirmAction === 'cancel' ? 'destructive' : 'default'}
              onClick={performConfirmedAction}
              disabled={cancellingBookingId !== null || deletingBookingId !== null}
            >
              {(cancellingBookingId === bookingToConfirm?.id || deletingBookingId === bookingToConfirm?.id) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentConfirmAction === 'cancel' ? 'Yes, Cancel' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}