/**
 * Element locators for Hotel Search and Booking flow based on exact application DOM
 */
export const hotelLocators = {
  // Step 1: Navigation Buttons
  travelAndStaysBtn: 'a[href*="/compare-fly"], a:has-text("Travel & Stays"), button:has-text("Travel & Stays")',
  
  // Step 2: Hotel Option / Tab / Radio Button
  hotelRadioBtn: 'a[href*="compare-stay"], li.travel-list-li a, a.travel-list-a:has-text("Hotel")',

  // Step 3: Search Form on /compare-stay
  destinationInput: '#citySearchRef, input[placeholder*="Search City" i], input[placeholder*="City" i]',
  destinationClearBtn: '.search-clear-btn, button.clear-btn, span:has-text("✕")',
  destinationDropdownItems: 'li.city-item, .destination-option, [role="option"], ul.dropdown-menu li, .dropdown-item',
  
  // Date Picker
  checkInDateBtn: '[placeholder*="Select Date" i], [data-test="checkin-date"], .mat-datepicker-toggle, .datepicker-trigger',
  checkOutDateBtn: '[placeholder*="Select Date" i], [data-test="checkout-date"]',
  calendarCells: 'button.mat-calendar-body-cell:not(.mat-calendar-body-disabled), .calendar-day:not(.disabled)',

  // Rooms & Guests
  roomsGuestsBtn: 'button:has-text("Room"), button:has-text("Guest"), div:has-text("Room"), .guest-picker',
  applyGuestsBtn: 'button:has-text("Done"), button:has-text("Apply"), .apply-guests',

  // Search Action
  searchHotelsBtn: 'button:has-text("Search"), button.search-btn, button[type="submit"]:has-text("Search")',

  // Results Page
  resultsList: '.hotel-card, .hotel-list-item, [data-testid="hotel-card"], .hotel-result',
  viewRoomsBtn: 'button:has-text("View Rooms"), button:has-text("Select Room"), a:has-text("View Room")',
  bookRoomBtn: 'button:has-text("Book Now"), button:has-text("Reserve"), .book-btn',

  // Guest Details & Checkout
  firstNameInput: 'input#firstName, input[name="firstName"]',
  lastNameInput: 'input#lastName, input[name="lastName"]',
  emailInput: 'input#email, input[name="email"]',
  mobileInput: 'input#mobile, input[name="mobile"], input#phone',
  continueToPaymentBtn: 'button:has-text("Continue to Payment"), button:has-text("Proceed to Pay"), #continueBtn',
  paymentHeader: '.payment-header, h2:has-text("Payment"), #paymentForm',
};
