// BookingDTO.java
package com.hotel.booking.dto;

import java.time.LocalDate;
import java.time.LocalDateTime; // Import LocalDateTime

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@JsonInclude(JsonInclude.Include.NON_NULL)

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long userId;
    private Long hotelId;
    private Long roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Double totalAmount;
    private String roomNumber;
	private String status;
	private String roomType;
	private String hotelName;
	private LocalDateTime bookingTime; // <-- Add this field
}