package com.hotel.booking.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
	private Long id;
    private String name;
    private String adress;
    private String city;
    private String state;
    private String zipcode;
    private String contact;
    private List<RoomDTO> rooms;
}
