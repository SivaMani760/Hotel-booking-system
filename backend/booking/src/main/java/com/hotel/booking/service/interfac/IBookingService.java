// IBookingService.java
package com.hotel.booking.service.interfac;

import com.hotel.booking.dto.Response;

import java.util.List;

import com.hotel.booking.dto.BookingDTO; // Import BookingDTO
import com.hotel.booking.model.Booking;
import com.hotel.booking.model.Payment; // Import Payment
import com.hotel.booking.model.Room;

public interface IBookingService {
    // Response createBooking(BookingDTO p, Long userId); // <-- REMOVE THIS LINE

    Response initiateBooking(BookingDTO bookingDetails, Long userId); // <-- NEW: for initial validation, no DB save
    Response finalizeBooking(BookingDTO bookingDetails, Payment paymentDetails, Long userId); // <-- NEW: for saving booking and payment

    // Response confirmBookingPayment(Long bookingId, Payment paymentDetails); // <-- REMOVE/RENAME THIS

    Response cancelBooking(Long bookingId, Long userId);
    Response getBookingById(String id);
    Response getAllBookings();
    Response updateBooking(String id, BookingDTO dto);
    Response deleteBooking(String id);
    List<Booking> getBookingsByRoom(Long roomId); // Keep this if used by booking-modal
}