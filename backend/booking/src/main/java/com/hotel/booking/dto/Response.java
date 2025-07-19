// Response.java
package com.hotel.booking.dto;

import com.hotel.booking.model.Payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Response {
    private int statusCode;
    private String message;
    private String token;
    private UserDTO user;
    private List<UserDTO> userList;

    private HotelDTO hotel;
    private List<HotelDTO> hotelList;

    private RoomDTO room;
    private List<RoomDTO> roomList;

    private BookingDTO booking;
    private List<BookingDTO> bookingList;
    private Long bookingId; // <-- Add this line for the booking ID

    private Payment payment;
    private List<Payment> paymentList;
}