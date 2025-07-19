package com.hotel.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomDTO {
	private Long id;
    private String roomNumber;
    private String type;
    private double price;
    private boolean available;
    private Long hotelId; // required when adding rooms after hotel
}
