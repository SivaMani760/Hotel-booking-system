package com.hotel.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotel.booking.model.Hotel;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
	
}
