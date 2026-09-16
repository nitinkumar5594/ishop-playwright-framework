# iShop Hotel Booking Automation Flow

## Target Application
- **URL**: `https://ishop-qa.reward360.in/`
- **Domain**: Travel & Stays -> Hotels

## Test Steps
1. **SSO Login**: Log in to iShop portal using QA SSO endpoint.
2. **Travel & Stays Navigation**: Click on "Travel & Stays" in the main navigation.
3. **Hotel Tab**: Select the "Hotel" radio/tab and center the search card using JavaScript executor.
4. **Dates**: Select check-in and check-out dates from the calendar.
5. **Search**: Click "Search Hotels" and verify search results load.
6. **Book Now**: Click "Book Now" for the target hotel card.
7. **Select Room**: Click "Select Room" on the hotel details page (centered via JS executor).
8. **Room Book**: Click "Book" on the selected room option.
9. **Cancellation Policy**: Dismiss "The partner has updated their cancellation policy" popup by clicking "Continue booking".
10. **Cookie Acceptance**: Automatically accept cookie banner ("Allow cookies") if displayed.
11. **Consent Checkbox**: Scroll to bottom and check the terms consent checkbox (`#agree_terms1`).
12. **Final Continue**: Click the final Continue button to proceed to payment.
13. **Dynamic Error Recovery**:
    - If partner availability error (*"We're unable to fetch the hotel availability details right now. Please try another hotel."*) appears:
    - Click "Go Back", close failed tab, return to main session, and rerun from beginning with the next hotel and a different room option.
