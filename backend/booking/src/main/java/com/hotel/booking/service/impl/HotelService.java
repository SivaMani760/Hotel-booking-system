// HotelService.java
package com.hotel.booking.service.impl;

import com.hotel.booking.dto.HotelDTO; // Import HotelDTO
import com.hotel.booking.dto.Response;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.service.interfac.IHotelService;
import com.hotel.booking.utils.Utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class HotelService implements IHotelService {

    @Autowired
    private HotelRepository hotelRepository;

    @Override
    @Transactional 
    public Response createHotel(Hotel hotel) {
        Response response = new Response();
        try {
            Hotel saved = hotelRepository.save(hotel);
            response.setStatusCode(200);
            response.setMessage("Hotel created");
            response.setHotel(Utils.mapHotelEntityToDTO(saved)); // Return DTO
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating hotel: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAllHotels() {
        Response response = new Response();
        try {
            List<Hotel> hotels = hotelRepository.findAll();
            List<HotelDTO> hotelDTOs = hotels.stream()
                                            .map(Utils::mapHotelEntityToDTO)
                                            .collect(Collectors.toList());
            
            response.setStatusCode(200);
            response.setMessage("Hotels retrieved");
            response.setHotelList(hotelDTOs);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving hotels: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional // Mark this as transactional too if it's updating/deleting
    public Response getHotelById(String id) {
        Response response = new Response();
        try {
            Long hotelId = Long.parseLong(id);
            Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
            if (hotel == null) {
                response.setStatusCode(404);
                response.setMessage("Hotel not found");
            } else {
                response.setStatusCode(200);
                response.setMessage("Hotel found");
                response.setHotel(Utils.mapHotelEntityToDTO(hotel)); // Return DTO
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching hotel: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional 
    public Response deleteHotel(String id) {
        Response response = new Response();
        try {
            Long hotelId = Long.parseLong(id);
            if (!hotelRepository.existsById(hotelId)) {
                response.setStatusCode(404);
                response.setMessage("Hotel not found");
            } else {
                hotelRepository.deleteById(hotelId);
                response.setStatusCode(200);
                response.setMessage("Hotel deleted");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting hotel: " + e.getMessage());
        }
        return response;
    }
    
    @Override
    @Transactional
    public Response updateHotel(String id, HotelDTO dto) {
        Response response = new Response();
        try {
            Long hotelId = Long.parseLong(id);
            Hotel existingHotel = hotelRepository.findById(hotelId).orElse(null);

            if (existingHotel == null) {
                response.setStatusCode(404);
                response.setMessage("Hotel not found for update.");
            } else {
                // Update existing hotel properties from DTO
                existingHotel.setName(dto.getName());
                existingHotel.setAdress(dto.getAdress());
                existingHotel.setCity(dto.getCity());
                existingHotel.setState(dto.getState());
                existingHotel.setZipcode(dto.getZipcode());
                existingHotel.setContact(dto.getContact());

                Hotel updatedHotel = hotelRepository.save(existingHotel);
                response.setStatusCode(200);
                response.setMessage("Hotel updated successfully.");
                response.setHotel(Utils.mapHotelEntityToDTO(updatedHotel)); // Return DTO
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating hotel: " + e.getMessage());
        }
        return response;
    }
}