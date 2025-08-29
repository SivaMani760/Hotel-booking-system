// components/booking/booking-modal.tsx
"use client"
import API_URL from "@/components/config";
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Bed, DollarSign, CheckCircle, Loader2, CreditCard, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hotel, Room, Booking } from "@/types" // Ensure Booking and ApiResponse types are up-to-date

interface BookingModalProps {
  hotel: Hotel
  isOpen: boolean
  onClose: () => void
  onBookingSuccess?: () => void
}

type BookingStep = "details" | "payment" | "success" | "loading";

export function BookingModal({ hotel, isOpen, onClose, onBookingSuccess }: BookingModalProps) {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<BookingStep>("details");
  const [initiatedBookingDetails, setInitiatedBookingDetails] = useState<Booking | null>(null); // Store BookingDTO from initiate call
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [roomBookings, setRoomBookings] = useState<Record<string, Booking[]>>({});


  useEffect(() => {
    if (isOpen) {
      setCurrentStep("details");
      resetForm();
      fetchRooms();
    }
  }, [isOpen, hotel.id]);

  const resetForm = () => {
    setSelectedRoom(null);
    setCheckInDate("");
    setCheckOutDate("");
    setError("");
    setSuccess(false);
    setInitiatedBookingDetails(null); // Reset initiated booking details
    setPaymentMethod("Credit Card");
  };

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const response = await fetch(`${API_URL}/rooms/hotel/${hotel.id}`);
      if (response.ok) {
        const data = await response.json();
        const fetchedRooms: Room[] = data.roomList || [];
        setRooms(fetchedRooms);
        await fetchBookingsForAllRooms(fetchedRooms);
      } else {
        setError("Failed to fetch rooms for this hotel.");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Error fetching rooms. Please try again.");
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchBookingsForAllRooms = async (roomList: Room[]) => {
    const bookingsMap: Record<string, Booking[]> = {};
    const token = localStorage.getItem("token");

    await Promise.all(
      roomList.map(async (room: Room) => {
        try {
          const res = await fetch(`${API_URL}/bookings/room/${room.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            bookingsMap[room.id.toString()] = await res.json();
          } else {
            bookingsMap[room.id.toString()] = [];
            console.warn(`Failed to fetch bookings for room ${room.id}`);
          }
        } catch (err) {
          console.error(`Error fetching bookings for room ${room.id}:`, err);
          bookingsMap[room.id.toString()] = [];
        }
      })
    );
    setRoomBookings(bookingsMap);
  };

  const isRoomAvailable = (roomId: number) => {
    const bookings = roomBookings[roomId.toString()] || [];
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    if (!checkInDate || !checkOutDate) return true;

    return !bookings.some((booking) => {
      // Only consider CONFIRMED bookings as making the room unavailable
      if (booking.status !== 'CONFIRMED') return false; 

      const existingIn = new Date(booking.checkInDate);
      const existingOut = new Date(booking.checkOutDate);
      return inDate < existingOut && outDate > existingIn;
    });
  };

  const calculateTotalAmountClientSide = () => {
    // This is for display purposes before initiate call, backend will calculate final amount
    if (!selectedRoom || !checkInDate || !checkOutDate) return 0;
    const nights =
      Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)) || 0;
    return nights * selectedRoom.price;
  };

  const handleInitiateBooking = async () => {
    if (!selectedRoom || !checkInDate || !checkOutDate || !user) {
      setError("Please fill in all required fields");
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError("Check-out date must be after check-in date");
      return;
    }

    // Client-side availability check (backend will re-validate)
    if (!isRoomAvailable(selectedRoom.id)) {
      setError("Selected room is already booked for these dates.");
      return;
    }

    setLoading(true);
    setError("");
    setCurrentStep("loading");

    try {
      const token = localStorage.getItem("token");
      const initialBookingData = {
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        checkInDate,
        checkOutDate,
        // totalAmount is not sent by frontend, it's calculated by backend
        // status and bookingTime are set by backend
      };

      // Call the new initiate endpoint
      const response = await fetch(`${API_URL}/bookings/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(initialBookingData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.booking) { // Ensure backend sends `booking` object in response
          setInitiatedBookingDetails(data.booking); // Store full BookingDTO from backend
          setCurrentStep("payment"); // Move to payment step
        } else {
            setError(data.message || "Failed to initiate booking.");
            setCurrentStep("details");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to initiate booking.");
        setCurrentStep("details");
      }
    } catch (err) {
      console.error("Error initiating booking:", err);
      setError("An error occurred while initiating the booking.");
      setCurrentStep("details");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeBooking = async () => {
    if (!initiatedBookingDetails) {
      setError("No booking details found. Please go back and try again.");
      setCurrentStep("details");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setLoading(true);
    setError("");
    setCurrentStep("loading");

    try {
      const token = localStorage.getItem("token");
      const finalizeRequest = {
        bookingDetails: initiatedBookingDetails, // Send the validated booking details from the initiate call
        paymentDetails: {
          amount: initiatedBookingDetails.totalAmount, // Use the total amount calculated by the backend
          paymentMethod: paymentMethod,
          // paymentTime and paymentStatus are set on backend
        },
      };

      // Call the new finalize endpoint
      const response = await fetch(`${API_URL}/bookings/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalizeRequest),
      });

      if (response.ok) {
        setSuccess(true);
        onBookingSuccess?.(); // Trigger parent update (e.g., refetch user bookings)
        setCurrentStep("success");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Booking finalization failed.");
        setCurrentStep("payment");
      }
    } catch (err) {
      console.error("Error finalizing booking:", err);
      setError("An error occurred during booking finalization.");
      setCurrentStep("payment");
    } finally {
      setLoading(false);
    }
  };


  const canProceedToPayment = selectedRoom && checkInDate && checkOutDate && calculateTotalAmountClientSide() > 0;
  const displayTotalAmount = initiatedBookingDetails?.totalAmount || calculateTotalAmountClientSide();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Book Your Stay at {hotel.name}</span>
          </DialogTitle>
          <CardDescription> {/* Use CardDescription here as it's imported now */}
            {hotel.city}, {hotel.state} • {hotel.contact}
          </CardDescription>
        </DialogHeader>

        {currentStep === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-lg text-gray-700">Processing...</p>
          </div>
        )}

        {currentStep === "success" && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600">Your reservation is now confirmed and payment processed.</p>
          </div>
        )}

        {(currentStep === "details" || currentStep === "payment") && (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === "details" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn">Check-in Date</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        setError("");
                      }}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOut">Check-out Date</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        setError("");
                      }}
                      min={checkInDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label>Select Room</Label>
                  {roomsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid gap-3 mt-2">
                      {rooms.map((room) => {
                        const available = checkInDate && checkOutDate ? isRoomAvailable(room.id) : room.available;
                        return (
                          <Card
                            key={room.id}
                            className={`cursor-pointer transition-colors ${
                              selectedRoom?.id === room.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                            } ${!available ? "opacity-50 pointer-events-none" : ""}`}
                            onClick={() => {
                              setSelectedRoom(room);
                              setError("");
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Bed className="h-5 w-5 text-gray-500" />
                                  <div>
                                    <p className="font-semibold">Room {room.roomNumber.toString()}</p>
                                    <p className="text-sm text-gray-600">{room.type}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg">${room.price?.toFixed(2)}/night</p>
                                  <Badge variant={available ? "secondary" : "destructive"}>
                                    {available ? "Available" : "Booked"}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                  {!roomsLoading && rooms.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No available rooms at this hotel</p>
                  )}
                </div>

                {canProceedToPayment && (
                  <Card className="bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Booking Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Room:</span>
                        <span>
                          {selectedRoom?.roomNumber} ({selectedRoom?.type})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-in:</span>
                        <span>{checkInDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-out:</span>
                        <span>{checkOutDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nights:</span>
                        <span>
                          {Math.ceil(
                            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Estimated Total:</span>
                        <span>${calculateTotalAmountClientSide().toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => onClose()} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInitiateBooking} // Changed to handleInitiateBooking
                    disabled={!canProceedToPayment || loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Proceed to Payment (${calculateTotalAmountClientSide().toFixed(2)})
                  </Button>
                </div>
              </>
            )}

            {currentStep === "payment" && (
              <>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-yellow-800">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Confirmation</span>
                    </CardTitle>
                    <CardDescription className="text-yellow-700"> {/* Using CardDescription here */}
                      Final step to confirm your booking.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Amount Due:</span>
                      <span className="text-green-600">${displayTotalAmount?.toFixed(2)}</span> {/* Use displayTotalAmount */}
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="PayPal">PayPal</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Alert className="bg-yellow-100 border-yellow-300 text-yellow-800">
                      <Clock className="h-4 w-4 inline mr-2" />
                      <AlertDescription className="inline">
                        Your booking details are ready. Confirm payment to finalize.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setCurrentStep("details")} className="flex-1 bg-transparent">
                    Back to Details
                  </Button>
                  <Button
                    onClick={handleFinalizeBooking} // Changed to handleFinalizeBooking
                    disabled={loading || !paymentMethod}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Payment
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}