// API request and response types

export interface ApiSuccess<T = unknown> {
  success: true
  data: T
}

export interface ApiError {
  error: true
  code: string
  title: string
  message: string
  fixSteps: string[]
  httpStatus: number
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// Booking API types
export interface CreateBookingRequest {
  listingId: string
  bookingType: 'cab' | 'auto' | 'hotel' | 'tour'
  pickupLat?: number
  pickupLng?: number
  pickupName?: string
  destinationLat?: number
  destinationLng?: number
  destinationName?: string
  checkinDate?: string
  checkoutDate?: string
  tourDate?: string
  numPassengers?: number
  numRooms?: number
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cash'
}

export interface BookingResponse {
  bookingId: string
  bookingReference: string
  razorpayOrderId?: string
  totalPaise: number
  status: string
}

// Listing search types
export interface ListingSearchParams {
  destinationSlug?: string
  listingType?: 'cab' | 'auto' | 'hotel_room' | 'tour'
  date?: string
  guests?: number
  lang?: string
  page?: number
  limit?: number
}

export interface ListingCard {
  id: string
  listingType: string
  title: string
  description: string
  basePricePaise: number
  coverPhotoUrl: string | null
  locationName: string
  rating: number
  reviewCount: number
  providerName: string
  providerPhoto: string | null
  isInstantBook: boolean
  isVerified: boolean
  sortBoost: number
}
