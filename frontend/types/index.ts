// types/index.ts
export interface User {
  id: number
  name: string
  email: string
  role: string
  bookings?: Booking[]
}

export interface Hotel {
  id: number
  name: string
  adress: string
  city: string
  state: string
  zipcode: string
  contact: string
  rooms?: Room[]
  bookings?: Booking[]
}

export interface Room {
  id: number
  roomNumber: string
  type: string
  price: number
  available: boolean
  hotelId?: Hotel
  bookings?: Booking[]
}

export interface Booking {
  id: number
  userId?: User
  hotelId?: Hotel
  roomId?: Room
  checkInDate: string
  checkOutDate: string
  totalAmount?: number
  status: string
  payment?: Payment
  roomNumber?: string
  roomType?: string
  hotelName?: string
  bookingTime?: string; // Add this line, assuming it comes as an ISO string from Java's LocalDateTime
}

export interface Payment {
  id: number
  amount: number
  paymentMethod: string
  paymentStatus: string
  paymentTime: string
  booking?: Booking
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  token?: string
  user?: User
  userList?: User[]
  hotel?: Hotel
  hotelList?: Hotel[]
  room?: Room
  roomList?: Room[]
  booking?: Booking
  bookingList?: Booking[]
  payment?: Payment
  paymentList?: Payment[]
  bookingId?: number; // Add this field, as we're now returning it from backend
}