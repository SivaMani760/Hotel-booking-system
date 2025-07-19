// RoomController.java
package com.hotel.booking.controller;

import com.hotel.booking.dto.Response;
import com.hotel.booking.dto.RoomDTO; // Import RoomDTO
// import com.hotel.booking.model.Room; // No longer directly used as @RequestBody
import com.hotel.booking.service.impl.RoomService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping // Change parameter type to RoomDTO
    public ResponseEntity<Response> addRoom(@RequestBody RoomDTO roomDTO) {
        return ResponseEntity.ok(roomService.addRoom(roomDTO));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Response> updateRoom(@PathVariable Long id, @RequestBody RoomDTO roomDTO) { // Change parameter type
        return ResponseEntity.ok(roomService.updateRoom(id, roomDTO));
    }

    // ... (other methods remain the same, as they likely retrieve Room entities)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> deleteRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.deleteRoom(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping
    public ResponseEntity<Response> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<Response> getRoomsByHotelId(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotelId(hotelId));
    }
}