package com.hotel.booking.utils;

import com.hotel.booking.dto.UserDTO;
import com.hotel.booking.dto.BookingDTO;
import com.hotel.booking.dto.HotelDTO;
import com.hotel.booking.dto.RoomDTO;
import com.hotel.booking.model.User;
import com.hotel.booking.model.Booking;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.model.Room;

import java.util.List;
import java.util.stream.Collectors;

public class Utils {

    public static UserDTO mapUserEntityToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }

    // Convert User entity to UserDTO including bookings
    public static UserDTO mapUserEntityToUserDTOPlusUserBookings(User user) {
        UserDTO dto = mapUserEntityToUserDTO(user);
        if (user.getBookings() != null) {
            List<BookingDTO> bookingDTOs = user.getBookings()
                .stream()
                .map(Utils::mapBookingToDTO)
                .collect(Collectors.toList());
            dto.setBookings(bookingDTOs);
        }
        return dto;
    }

    // Simple booking to bookingDTO conversion
    public static BookingDTO mapBookingToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setStatus(booking.getStatus());
        if (booking.getUserId() != null) {
            dto.setUserId(booking.getUserId().getId());
        } else {
            System.err.println("Booking " + booking.getId() + " has a null UserId.");
        }
        dto.setBookingTime(booking.getBookingTime()); // <-- Add this
        return dto;
    }

    
    public static List<UserDTO> mapUserListEntityToUserListDTO(List<User> users) {
        return users.stream()
                    .map(Utils::mapUserEntityToUserDTO)
                    .collect(Collectors.toList());
    }
    
    public static BookingDTO mapBookingToDetailedDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setStatus(booking.getStatus());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setBookingTime(booking.getBookingTime()); // <-- Add this

        if (booking.getUserId() != null) {
            dto.setUserId(booking.getUserId().getId());
        }

        if (booking.getRoomId() != null) {
            dto.setRoomNumber(booking.getRoomId().getRoomNumber());
            dto.setRoomType(booking.getRoomId().getType());
        }

        if (booking.getHotelId() != null) {
            dto.setHotelName(booking.getHotelId().getName());
        }
        // You can also add payment details here if needed,
        // but ensure @JsonIgnore is removed from Payment.booking and Booking.payment if bidirectional.
        // For example:
        // if (booking.getPayment() != null) {
        //     dto.setPaymentStatus(booking.getPayment().getPaymentStatus());
        //     dto.setPaymentMethod(booking.getPayment().getPaymentMethod());
        // }


        return dto;
    }
    public static HotelDTO mapHotelEntityToDTO(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setAdress(hotel.getAdress());
        dto.setCity(hotel.getCity());
        dto.setState(hotel.getState());
        dto.setZipcode(hotel.getZipcode());
        dto.setContact(hotel.getContact());
        if (hotel.getRooms() != null) {
            dto.setRooms(hotel.getRooms().stream()
                               .map(Utils::mapRoomEntityToDTO)
                               .collect(Collectors.toList()));
        }
        return dto;
    }
    
    public static RoomDTO mapRoomEntityToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setType(room.getType());
        dto.setPrice(room.getPrice());
        dto.setAvailable(room.isAvailable());

        if (room.getHotelId() != null) {
            dto.setHotelId(room.getHotelId().getId());
        }

        return dto;
    }
    
}
