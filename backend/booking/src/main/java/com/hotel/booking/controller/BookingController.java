// BookingController.java
package com.hotel.booking.controller;

import com.hotel.booking.dto.BookingDTO;
import com.hotel.booking.dto.BookingFinalizeRequest;
import com.hotel.booking.dto.Response;
import com.hotel.booking.model.Payment;
import com.hotel.booking.service.impl.BookingService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // --- NEW: Endpoint to initiate booking (validate, calculate, no DB save) ---
    @PostMapping("/initiate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Response> initiateBooking(
            @RequestBody BookingDTO payload,
            @AuthenticationPrincipal(expression = "username") String email) {

        Long userId = bookingService.findUserIdByEmail(email);
        Response response = bookingService.initiateBooking(payload, userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // --- NEW: Endpoint to finalize booking (save to DB with payment) ---
    @PostMapping("/finalize")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Response> finalizeBooking(
            @RequestBody BookingFinalizeRequest request, 
            @AuthenticationPrincipal(expression = "username") String email) {

        Long userId = bookingService.findUserIdByEmail(email);
        Response response = bookingService.finalizeBooking(request.getBookingDetails(), request.getPaymentDetails(), userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // --- REMOVED original POST /api/bookings and confirm-payment endpoint ---
    // The previous @PostMapping and @PostMapping("/{bookingId}/confirm-payment") are replaced by /initiate and /finalize

    // --- Existing cancel, get, getAll, update, delete methods (unchanged for now) ---
    @PutMapping("/{bookingId}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Response> cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal(expression = "username") String email) {
        
        Long userId = bookingService.findUserIdByEmail(email);
        Response response = bookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Response> getBookingById(@PathVariable String id) {
        Response response = bookingService.getBookingById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Response> getAllBookings() {
        Response response = bookingService.getAllBookings();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> updateBooking(
            @PathVariable String id,
            @RequestBody BookingDTO dto) {

        Response response = bookingService.updateBooking(id, dto);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Response> deleteBooking(@PathVariable String id) {
        Response response = bookingService.deleteBooking(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<BookingDTO>> getBookingsByRoom(@PathVariable Long roomId) {
        List<BookingDTO> dtos = bookingService.getBookingsByRoomAsDTOs(roomId);
        return ResponseEntity.ok(dtos);
    }
}