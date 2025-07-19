// Booking.java
package com.hotel.booking.model;

import java.time.LocalDate;
import java.time.LocalDateTime; // Import LocalDateTime

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity
public class Booking {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name = "user_Id")
	@JsonIgnore
	private User userId;
		
	@ManyToOne
	@JoinColumn(name = "hotel_Id")
	@JsonIgnore
	private Hotel hotelId;
		
	@ManyToOne
	@JoinColumn(name = "room_Id")
	@JsonIgnore
	private Room roomId;

	private LocalDate checkInDate;
	private LocalDate checkOutDate;
	private Double totalAmount;
	private String status;
	private LocalDateTime bookingTime; // <-- Add this field for the 2-hour threshold

	@OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
	// @JsonIgnore // You might want to remove this if you want payment details loaded with booking
	private Payment payment;
	
}