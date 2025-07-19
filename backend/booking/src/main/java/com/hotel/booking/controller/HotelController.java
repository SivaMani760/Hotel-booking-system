package com.hotel.booking.controller;

import com.hotel.booking.dto.HotelDTO;
import com.hotel.booking.dto.Response;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.service.interfac.IHotelService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private IHotelService hotelService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Response> createHotel(@RequestBody Hotel hotel) {
        Response response = hotelService.createHotel(hotel);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Get all hotels
    @GetMapping
    public ResponseEntity<Response> getAllHotels() {
        Response response = hotelService.getAllHotels();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Get hotel by ID
    @GetMapping("/{id}")
    public ResponseEntity<Response> getHotelById(@PathVariable String id) {
        Response response = hotelService.getHotelById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Delete hotel by ID
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Response> deleteHotel(@PathVariable String id) {
        Response response = hotelService.deleteHotel(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}") // <-- Add this new endpoint
    public ResponseEntity<Response> updateHotel(
            @PathVariable String id,
            @RequestBody HotelDTO hotelDTO) { // Expect HotelDTO as request body
        Response response = hotelService.updateHotel(id, hotelDTO);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
