package com.hotel.booking.repository;

import com.hotel.booking.model.Booking;
import com.hotel.booking.model.Room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    /* user helper (already present) */
    List<Booking> findByUserId_Id(Long id);

    /* NEW — fetch every booking for a given room */
    // Modified to eagerly fetch Room, Hotel, and User to prevent LazyInitializationException
    @Query("SELECT b FROM Booking b JOIN FETCH b.roomId r JOIN FETCH b.hotelId h JOIN FETCH b.userId u WHERE r.id = :roomId")
    List<Booking> findByRoomId_Id(@Param("roomId") Long roomId);

    /* overlap helper (already present) */
    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
          FROM Booking b
         WHERE b.roomId = :room
           AND b.checkInDate  < :requestedCheckOut
           AND b.checkOutDate > :requestedCheckIn
    """)
    boolean existsByRoomAndDateRange(@Param("room") Room room,
                                     @Param("requestedCheckIn")  LocalDate requestedCheckIn,
                                     @Param("requestedCheckOut") LocalDate requestedCheckOut,
                                     @Param("bookingId") Long bookingId);
}
