package com.hotel.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotel.booking.model.Room;

public interface RoomRepository extends JpaRepository<Room, Long>{
	List<Room> findByHotelId_Id(Long hotelId); 
}
