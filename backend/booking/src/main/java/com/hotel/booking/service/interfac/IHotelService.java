// IHotelService.java
package com.hotel.booking.service.interfac;

import com.hotel.booking.dto.Response;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.dto.HotelDTO; // Import HotelDTO

public interface IHotelService {
    Response createHotel(Hotel hotel);
    Response getAllHotels();
    Response getHotelById(String id);
    Response deleteHotel(String id);
    Response updateHotel(String id, HotelDTO hotelDTO); // <-- Add this new method signature
}