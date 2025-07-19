// RoomService.java
package com.hotel.booking.service.impl;

import com.hotel.booking.dto.Response;
import com.hotel.booking.dto.RoomDTO;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.model.Room;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.interfac.IRoomService;
import com.hotel.booking.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.util.List;

@Service
public class RoomService implements IRoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Override
    public Response addRoom(RoomDTO roomDTO) { 
        Response response = new Response();
        try {
            if (roomDTO.getHotelId() == null) {
                response.setStatusCode(400);
                response.setMessage("Hotel ID is required for adding a room.");
                return response;
            }

            // Fetch the Hotel entity based on the hotelId from the DTO
            Hotel hotel = hotelRepository.findById(roomDTO.getHotelId())
                                       .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + roomDTO.getHotelId()));
            
            // Create a new Room entity and populate its fields from the DTO
            Room room = new Room();
            room.setRoomNumber(roomDTO.getRoomNumber());
            room.setType(roomDTO.getType());
            room.setPrice(roomDTO.getPrice());
            room.setAvailable(roomDTO.isAvailable());
            room.setHotelId(hotel); // <-- Crucially set the fetched Hotel entity

            Room saved = roomRepository.save(room);
            response.setStatusCode(200);
            response.setMessage("Room added");
            response.setRoom(Utils.mapRoomEntityToDTO(saved)); // Return the mapped DTO
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error adding room: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response updateRoom(Long id, RoomDTO roomDTO) { // <-- Change parameter type to RoomDTO
        Response response = new Response();
        try {
            Room existing = roomRepository.findById(id).orElse(null);
            if (existing == null) {
                response.setStatusCode(404);
                response.setMessage("Room not found");
            } else {
                // Update fields from DTO
                existing.setRoomNumber(roomDTO.getRoomNumber());
                existing.setType(roomDTO.getType());
                existing.setPrice(roomDTO.getPrice());
                existing.setAvailable(roomDTO.isAvailable());

                // Update hotel association if hotelId is provided in DTO
                if (roomDTO.getHotelId() != null) {
                    Hotel hotel = hotelRepository.findById(roomDTO.getHotelId())
                                               .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + roomDTO.getHotelId()));
                    existing.setHotelId(hotel);
                }

                Room updated = roomRepository.save(existing);
                response.setStatusCode(200);
                response.setMessage("Room updated");
                response.setRoom(Utils.mapRoomEntityToDTO(updated));
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating room: " + e.getMessage());
        }
        return response;
    }


    @Override
    public Response deleteRoom(Long id) {
        Response response = new Response();
        try {
            if (!roomRepository.existsById(id)) {
                response.setStatusCode(404);
                response.setMessage("Room not found");
            } else {
                roomRepository.deleteById(id);
                response.setStatusCode(200);
                response.setMessage("Room deleted");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting room: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getRoomById(Long id) {
        Response response = new Response();
        try {
            Room room = roomRepository.findById(id).orElse(null);
            if (room == null) {
                response.setStatusCode(404);
                response.setMessage("Room not found");
            } else {
                response.setStatusCode(200);
                response.setMessage("Room found");
                response.setRoom(Utils.mapRoomEntityToDTO(room));
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching room: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAllRooms() {
        Response response = new Response();
        try {
            List<Room> list = roomRepository.findAll();
            List<RoomDTO> dtoList = list.stream().map(Utils::mapRoomEntityToDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("Rooms retrieved");
            response.setRoomList(dtoList); 
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching rooms: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getRoomsByHotelId(Long hotelId) {
        Response response = new Response();
        try {
            List<Room> list = roomRepository.findByHotelId_Id(hotelId);
            List<RoomDTO> dtoList = list.stream().map(Utils::mapRoomEntityToDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("Rooms retrieved for hotel ID " + hotelId);
            response.setRoomList(dtoList); 
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }
}