// Create new file: com/hotel/booking/dto/BookingFinalizeRequest.java
package com.hotel.booking.dto;

import com.hotel.booking.model.Payment; // Import Payment
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingFinalizeRequest {
    private BookingDTO bookingDetails;
    private Payment paymentDetails;
}