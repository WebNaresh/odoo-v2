"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  IndianRupee, 
  Star, 
  Wifi, 
  Car, 
  Coffee,
  Info,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

interface BookingSummaryProps {
  booking: {
    venue: {
      id: number;
      name: string;
      location: string;
      rating: number;
      image?: string;
      amenities: string[];
    };
    court: {
      id: string;
      name: string;
      sport: string;
    };
    timeSlot: {
      date: Date;
      startTime: string;
      endTime: string;
      price: number;
    };
    duration: number; // in hours
    totalPrice: number;
    taxes?: number;
    discount?: number;
    promoCode?: string;
  };
  onConfirmBooking: () => void;
  onEditBooking?: () => void;
  isLoading?: boolean;
  className?: string;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Parking": Car,
  "WiFi": Wifi,
  "Cafeteria": Coffee,
  "Changing Rooms": Users,
};

export function BookingSummary({ 
  booking, 
  onConfirmBooking, 
  onEditBooking,
  isLoading = false,
  className 
}: BookingSummaryProps) {
  const { venue, court, timeSlot, duration, totalPrice, taxes = 0, discount = 0, promoCode } = booking;

  const subtotal = timeSlot.price * duration;
  const finalTotal = subtotal + taxes - discount;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Summary
          </CardTitle>
          <CardDescription>
            Review your booking details before confirming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Venue Information */}
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{venue.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  {venue.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{venue.rating}</span>
                  <span className="text-sm text-muted-foreground">rating</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {venue.amenities.slice(0, 4).map((amenity) => {
                const Icon = amenityIcons[amenity];
                return (
                  <Badge key={amenity} variant="secondary" className="text-xs">
                    {Icon && <Icon className="h-3 w-3 mr-1" />}
                    {amenity}
                  </Badge>
                );
              })}
              {venue.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{venue.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Booking Details</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Court:</span>
                <p className="font-medium">{court.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sport:</span>
                <p className="font-medium">{court.sport}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{format(timeSlot.date, "EEEE, MMMM d, yyyy")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <p className="font-medium">{timeSlot.startTime} - {timeSlot.endTime}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-medium">{duration} hour{duration > 1 ? 's' : ''}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Price per hour:</span>
                <p className="font-medium">₹{timeSlot.price}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium">Price Breakdown</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({duration} hour{duration > 1 ? 's' : ''})</span>
                <span>₹{subtotal}</span>
              </div>
              
              {taxes > 0 && (
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>₹{taxes}</span>
                </div>
              )}
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount {promoCode && `(${promoCode})`}
                  </span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Cancellation Policy:</strong> Free cancellation up to 2 hours before your booking time. 
              Late cancellations may incur charges.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onEditBooking && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onEditBooking}
                disabled={isLoading}
              >
                Edit Booking
              </Button>
            )}
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={onConfirmBooking}
              disabled={isLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoading ? "Processing..." : `Confirm & Pay ₹${finalTotal}`}
            </Button>
          </div>

          {/* Payment Security */}
          <div className="text-center text-xs text-muted-foreground">
            <p>🔒 Your payment information is secure and encrypted</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
