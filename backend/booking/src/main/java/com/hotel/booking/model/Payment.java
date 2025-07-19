// Payment.java
package com.hotel.booking.model;

import java.time.LocalDate;
import java.time.LocalDateTime; // Change to LocalDateTime for precise timestamp

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Payment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private Double amount;
	private String paymentMethod;
	private String paymentStatus;
	private LocalDateTime paymentTime; // <-- Changed from LocalDate to LocalDateTime
	
	@OneToOne
	@JoinColumn(name = "booking_Id")
	@JsonIgnore // You might want to remove this if payment is loaded with booking.
	private Booking booking;
	
}