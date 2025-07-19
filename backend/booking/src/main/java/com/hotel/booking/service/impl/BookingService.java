// BookingService.java (relevant parts of initiateBooking and finalizeBooking methods)
package com.hotel.booking.service.impl;

import com.hotel.booking.dto.BookingDTO;
import com.hotel.booking.dto.Response;
import com.hotel.booking.model.*;
import com.hotel.booking.repository.*;
import com.hotel.booking.service.interfac.IBookingService;
import com.hotel.booking.utils.Utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService implements IBookingService {

    @Autowired private BookingRepository bookingRepo;
    @Autowired private UserRepository    userRepo;
    @Autowired private RoomRepository    roomRepo;
    @Autowired private HotelRepository   hotelRepo;
    @Autowired private PaymentRepository paymentRepo;

    @Override
    public Response initiateBooking(BookingDTO bookingDetails, Long userId) {
        Response res = new Response();
        try {
            User  user  = userRepo.findById(userId)        .orElseThrow(() -> new RuntimeException("User not found"));
            Room  room  = roomRepo.findById(bookingDetails.getRoomId()) .orElseThrow(() -> new RuntimeException("Room not found"));
            Hotel hotel = hotelRepo.findById(bookingDetails.getHotelId()).orElseThrow(() -> new RuntimeException("Hotel not found"));

            // Perform initial validation checks
            if (bookingDetails.getCheckInDate() == null || bookingDetails.getCheckOutDate() == null) {
                res.setStatusCode(400);
                res.setMessage("Check-in and Check-out dates are required.");
                return res;
            }
            if (bookingDetails.getCheckInDate().isAfter(bookingDetails.getCheckOutDate()) || bookingDetails.getCheckInDate().isEqual(bookingDetails.getCheckOutDate())) {
                res.setStatusCode(400);
                res.setMessage("Check-out date must be after check-in date.");
                return res;
            }
            if (bookingDetails.getCheckInDate().isBefore(LocalDate.now())) {
                res.setStatusCode(400);
                res.setMessage("Check-in date cannot be in the past.");
                return res;
            }
            if (bookingRepo.existsByRoomAndDateRange(room, bookingDetails.getCheckInDate(), bookingDetails.getCheckOutDate(), (Long) null)) { // <-- Explicitly cast null to Long
                res.setStatusCode(409);
                res.setMessage("Room is unavailable for the selected dates.");
                return res;
            }

            long nights = ChronoUnit.DAYS.between(bookingDetails.getCheckInDate(), bookingDetails.getCheckOutDate());
            double total = room.getPrice() * nights;
            BookingDTO confirmedBookingDetails = new BookingDTO();
            confirmedBookingDetails.setUserId(userId);
            confirmedBookingDetails.setHotelId(hotel.getId());
            confirmedBookingDetails.setRoomId(room.getId());
            confirmedBookingDetails.setCheckInDate(bookingDetails.getCheckInDate());
            confirmedBookingDetails.setCheckOutDate(bookingDetails.getCheckOutDate());
            confirmedBookingDetails.setTotalAmount(total);
            confirmedBookingDetails.setRoomNumber(room.getRoomNumber());
            confirmedBookingDetails.setRoomType(room.getType());
            confirmedBookingDetails.setHotelName(hotel.getName());
            res.setStatusCode(200);
            res.setMessage("Booking details validated. Proceed to payment.");
            res.setBooking(confirmedBookingDetails);
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatusCode(500);
            res.setMessage("Could not initiate booking: " + e.getMessage());
        }
        return res;
    }

    @Override
    public Response finalizeBooking(BookingDTO bookingDetails, Payment paymentDetails, Long userId) {
        Response res = new Response();
        try {
            User  user  = userRepo.findById(userId)        .orElseThrow(() -> new RuntimeException("User not found"));
            Room  room  = roomRepo.findById(bookingDetails.getRoomId()) .orElseThrow(() -> new RuntimeException("Room not found"));
            Hotel hotel = hotelRepo.findById(bookingDetails.getHotelId()).orElseThrow(() -> new RuntimeException("Hotel not found"));
            if (bookingRepo.existsByRoomAndDateRange(room, bookingDetails.getCheckInDate(), bookingDetails.getCheckOutDate(), (Long) null)) { 
                 res.setStatusCode(409);
                 res.setMessage("Room became unavailable before payment could be confirmed. Please select another room or dates.");
                 return res;
            }
            Booking booking = new Booking();
            booking.setUserId(user);
            booking.setRoomId(room);
            booking.setHotelId(hotel);
            booking.setCheckInDate(bookingDetails.getCheckInDate());
            booking.setCheckOutDate(bookingDetails.getCheckOutDate());
            booking.setTotalAmount(bookingDetails.getTotalAmount());
            booking.setStatus("CONFIRMED"); 
            booking.setBookingTime(LocalDateTime.now()); 
            Booking savedBooking = bookingRepo.save(booking); 
            if (paymentDetails.getAmount() == null || paymentDetails.getPaymentMethod() == null || paymentDetails.getAmount() <= 0) {
                res.setStatusCode(400);
                res.setMessage("Invalid payment details provided.");
                throw new RuntimeException("Invalid payment details.");
            }
            paymentDetails.setBooking(savedBooking); 
            paymentDetails.setPaymentTime(LocalDateTime.now());
            paymentDetails.setPaymentStatus("COMPLETED");
            paymentRepo.save(paymentDetails); 
            room.setAvailable(false);
            roomRepo.save(room);
            res.setStatusCode(200);
            res.setMessage("Booking confirmed and payment processed successfully.");
            res.setBooking(Utils.mapBookingToDetailedDTO(savedBooking));
            res.setBookingId(savedBooking.getId()); 
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatusCode(500);
            res.setMessage("Could not finalize booking: " + e.getMessage());
        }
        return res;
    }
    public Response cancelBooking(Long bookingId, Long userId) {
        Response res = new Response();
        try {
            Booking booking = bookingRepo.findById(bookingId)
                                       .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (!booking.getUserId().getId().equals(userId)) {
                res.setStatusCode(403);
                res.setMessage("You are not authorized to cancel this booking.");
                return res;
            }
            if (!"CONFIRMED".equals(booking.getStatus())) {
                res.setStatusCode(400);
                res.setMessage("Only CONFIRMED bookings can be cancelled.");
                return res;
            }
            if ("CANCELLED".equals(booking.getStatus())) {
                res.setStatusCode(400);
                res.setMessage("Booking is already cancelled.");
                return res;
            }
            LocalDateTime twoHoursAfterBooking = booking.getBookingTime().plusHours(2);
            if (LocalDateTime.now().isAfter(twoHoursAfterBooking)) {
                res.setStatusCode(400);
                res.setMessage("Cancellation is only allowed within 2 hours of booking creation.");
                return res;
            }
            if (booking.getTotalAmount() != null) {
                double refundAmount = booking.getTotalAmount() * 0.90;
                if (booking.getPayment() != null) {
                    Payment payment = booking.getPayment();
                    payment.setPaymentStatus("REFUNDED");
                    payment.setAmount(refundAmount);
                    paymentRepo.save(payment);
                }
            }
            booking.setStatus("CANCELLED");
            Booking updatedBooking = bookingRepo.save(booking);
            Room room = updatedBooking.getRoomId();
            if (room != null) {
                room.setAvailable(true);
                roomRepo.save(room);
            }
            res.setStatusCode(200);
            res.setMessage("Booking cancelled successfully. 90% refund processed.");
            res.setBooking(Utils.mapBookingToDetailedDTO(updatedBooking));
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatusCode(500);
            res.setMessage("Could not cancel booking: " + e.getMessage());
        }
        return res;
    }
    
    @Override
    public Response deleteBooking(String id) {
        Response response = new Response();
        try {
            Long bookingId = Long.parseLong(id);
            Booking booking = bookingRepo.findById(bookingId).orElse(null);
            
            if (booking == null) {
                response.setStatusCode(404);
                response.setMessage("Booking not found");
                return response;
            } 
            if (booking.getPayment() != null) {
                paymentRepo.delete(booking.getPayment());
            }
            if (booking.getRoomId() != null && !booking.getRoomId().isAvailable() && !"CANCELLED".equals(booking.getStatus())) {
                Room room = booking.getRoomId();
                room.setAvailable(true);
                roomRepo.save(room);
            }
            bookingRepo.deleteById(bookingId);
            response.setStatusCode(200);
            response.setMessage("Booking deleted");           
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting booking: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByRoom(Long roomId) {
        try {
            return bookingRepo.findByRoomId_Id(roomId);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public Response getBookingById(String id) {
        Response response = new Response();
        try {
            Long bookingId = Long.parseLong(id);
            Booking booking = bookingRepo.findById(bookingId).orElse(null);
            if (booking == null) {
                response.setStatusCode(404);
                response.setMessage("Booking not found");
            } else {
                response.setStatusCode(200);
                response.setMessage("Booking retrieved");
                response.setBooking(Utils.mapBookingToDetailedDTO(booking));
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching booking: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAllBookings() {
        Response response = new Response();
        try {
            List<Booking> bookings = bookingRepo.findAll();
            List<BookingDTO> bookingDTOs = bookings.stream()
                                                    .map(Utils::mapBookingToDetailedDTO)
                                                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("Bookings retrieved");
            response.setBookingList(bookingDTOs);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving bookings: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response updateBooking(String id, BookingDTO dto) {
        Response response = new Response();
        try {
            Long bookingId = Long.parseLong(id);
            Booking booking = bookingRepo.findById(bookingId).orElse(null);
            if (booking == null) {
                response.setStatusCode(404);
                response.setMessage("Booking not found");
            } else {
                booking.setCheckInDate(dto.getCheckInDate());
                booking.setCheckOutDate(dto.getCheckOutDate());
                booking.setStatus(dto.getStatus());
                if (dto.getTotalAmount() != null) {
                    booking.setTotalAmount(dto.getTotalAmount());
                }
                Booking updated = bookingRepo.save(booking);
                response.setStatusCode(200);
                response.setMessage("Booking updated");
                response.setBooking(Utils.mapBookingToDetailedDTO(updated));
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating booking: " + e.getMessage());
        }
        return response;
    }

    public Long findUserIdByEmail(String email) {
        return userRepo.findByEmail(email)
                       .orElseThrow(() -> new RuntimeException("User not found"))
                       .getId();
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByRoomAsDTOs(Long roomId) {
        try {
            List<Booking> bookings = bookingRepo.findByRoomId_Id(roomId);
            return bookings.stream().map(Utils::mapBookingToDetailedDTO).toList();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error in getBookingsByRoomAsDTOs: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}