// IRoomService.java
package com.hotel.booking.service.interfac;

import com.hotel.booking.dto.Response;
import com.hotel.booking.dto.RoomDTO; // Import RoomDTO
import com.hotel.booking.model.Room; // Keep Room import for other methods that still use it

public interface IRoomService {
    Response addRoom(RoomDTO roomDTO); // Changed from Room to RoomDTO
    Response updateRoom(Long id, RoomDTO roomDTO); // Changed from Room to RoomDTO
    Response deleteRoom(Long id);
    Response getRoomById(Long id);
    Response getAllRooms();
    Response getRoomsByHotelId(Long hotelId);
}