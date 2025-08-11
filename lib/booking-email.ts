import { getEmailService } from './email';
import { format } from 'date-fns';

// Interface for booking email data
export interface BookingEmailData {
  // User information
  userEmail: string;
  userName: string;
  
  // Booking details
  bookingReference: string;
  bookingId: string;
  
  // Venue information
  venueName: string;
  venueAddress: string;
  venuePhone?: string;
  venueEmail?: string;
  venueInstructions?: string;
  cancellationPolicy?: string;
  
  // Court information
  courtName: string;
  
  // Booking time details
  date: string;
  startTime: string;
  endTime: string;
  playerCount: number;
  notes?: string;
  
  // Payment information
  totalPrice: number;
  paymentId: string;
  paymentMethod: string;
  paidAt: Date;
}

/**
 * Send booking confirmation email to the user
 */
export async function sendBookingConfirmationEmail(
  bookingData: BookingEmailData
): Promise<boolean> {
  try {
    console.log('📧 [BOOKING EMAIL] Preparing to send booking confirmation email:', {
      userEmail: bookingData.userEmail,
      bookingReference: bookingData.bookingReference,
      venueName: bookingData.venueName,
    });

    // Validate required fields
    const requiredFields = [
      'userEmail',
      'userName', 
      'bookingReference',
      'venueName',
      'venueAddress',
      'courtName',
      'date',
      'startTime',
      'endTime',
      'playerCount',
      'totalPrice',
      'paymentId',
      'paymentMethod',
      'paidAt'
    ];

    const missingFields = requiredFields.filter(field => 
      !bookingData[field as keyof BookingEmailData]
    );

    if (missingFields.length > 0) {
      console.error('❌ [BOOKING EMAIL] Missing required fields:', missingFields);
      return false;
    }

    // Get email service instance
    const emailService = getEmailService();

    // Send the booking confirmation email
    const emailSent = await emailService.sendBookingConfirmationEmail({
      userEmail: bookingData.userEmail,
      userName: bookingData.userName,
      bookingReference: bookingData.bookingReference,
      venueName: bookingData.venueName,
      venueAddress: bookingData.venueAddress,
      venuePhone: bookingData.venuePhone,
      venueEmail: bookingData.venueEmail,
      courtName: bookingData.courtName,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      playerCount: bookingData.playerCount,
      totalPrice: bookingData.totalPrice,
      paymentId: bookingData.paymentId,
      paymentMethod: bookingData.paymentMethod,
      paidAt: bookingData.paidAt,
      notes: bookingData.notes,
      venueInstructions: bookingData.venueInstructions,
      cancellationPolicy: bookingData.cancellationPolicy,
    });

    if (emailSent) {
      console.log('✅ [BOOKING EMAIL] Booking confirmation email sent successfully:', {
        userEmail: bookingData.userEmail,
        bookingReference: bookingData.bookingReference,
      });
    } else {
      console.error('❌ [BOOKING EMAIL] Failed to send booking confirmation email:', {
        userEmail: bookingData.userEmail,
        bookingReference: bookingData.bookingReference,
      });
    }

    return emailSent;

  } catch (error) {
    console.error('❌ [BOOKING EMAIL] Error sending booking confirmation email:', {
      error: error instanceof Error ? error.message : String(error),
      userEmail: bookingData.userEmail,
      bookingReference: bookingData.bookingReference,
    });
    return false;
  }
}

/**
 * Format booking data from database objects for email
 */
export function formatBookingDataForEmail(
  booking: any,
  user: any,
  court: any,
  venue: any,
  paymentDetails: any
): BookingEmailData {
  return {
    // User information
    userEmail: user.email,
    userName: user.name || 'Valued Customer',
    
    // Booking details
    bookingReference: booking.bookingReference,
    bookingId: booking.id,
    
    // Venue information
    venueName: venue.name,
    venueAddress: venue.address,
    venuePhone: venue.phone,
    venueEmail: venue.email,
    venueInstructions: venue.instructions,
    cancellationPolicy: venue.cancellationPolicy,
    
    // Court information
    courtName: court.name,
    
    // Booking time details
    date: format(booking.startTime, 'yyyy-MM-dd'),
    startTime: format(booking.startTime, 'HH:mm'),
    endTime: format(booking.endTime, 'HH:mm'),
    playerCount: booking.playerCount,
    notes: booking.notes,
    
    // Payment information
    totalPrice: booking.totalPrice,
    paymentId: booking.paymentId,
    paymentMethod: booking.paymentMethod || 'Razorpay',
    paidAt: booking.paidAt || new Date(),
  };
}

/**
 * Send booking confirmation email with error handling and retries
 */
export async function sendBookingConfirmationEmailWithRetry(
  bookingData: BookingEmailData,
  maxRetries: number = 3
): Promise<boolean> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 [BOOKING EMAIL] Attempt ${attempt}/${maxRetries} to send booking confirmation email`);
      
      const success = await sendBookingConfirmationEmail(bookingData);
      
      if (success) {
        console.log(`✅ [BOOKING EMAIL] Email sent successfully on attempt ${attempt}`);
        return true;
      } else {
        console.warn(`⚠️ [BOOKING EMAIL] Email sending failed on attempt ${attempt}`);
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ [BOOKING EMAIL] Error on attempt ${attempt}:`, lastError.message);
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ [BOOKING EMAIL] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`❌ [BOOKING EMAIL] Failed to send email after ${maxRetries} attempts:`, {
    lastError: lastError?.message,
    userEmail: bookingData.userEmail,
    bookingReference: bookingData.bookingReference,
  });
  
  return false;
}

/**
 * Validate email configuration before sending
 */
export async function validateEmailConfiguration(): Promise<boolean> {
  try {
    console.log('🔍 [BOOKING EMAIL] Validating email configuration...');
    
    const emailService = getEmailService();
    const isValid = await emailService.verifyConnection();
    
    if (isValid) {
      console.log('✅ [BOOKING EMAIL] Email configuration is valid');
    } else {
      console.error('❌ [BOOKING EMAIL] Email configuration is invalid');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ [BOOKING EMAIL] Error validating email configuration:', error);
    return false;
  }
}
