package com.hotel.booking.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Room {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String roomNumber;
	private String type;
	private Double price;
	private boolean available;
	
	@ManyToOne
	@JoinColumn(name = "hotel_Id")
	@JsonIgnore
	private Hotel hotelId;
	
	@OneToMany(mappedBy = "roomId")
	@JsonIgnore
    private List<Booking> bookings;

}
