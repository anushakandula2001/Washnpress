# UAT Scripts

## UAT-01 Resident Onboarding and First Pickup
1. Open login page and request OTP.
2. Verify OTP and complete profile.
3. Subscribe to Standard plan.
4. Schedule pickup and receive confirmation.
Expected: order created, schedule visible, notification delivered.

## UAT-02 Operator Processing and Delivery
1. Operator opens assigned bookings.
2. Marks pickup with garment count and QR tag.
3. Moves batch through Wash, Dry, Iron, QC.
4. Marks delivery with OTP/signature.
Expected: order lifecycle complete, subscription usage updated.

## UAT-03 QC Failure Handling
1. Operator submits QC fail with reason.
2. System blocks ready-for-delivery transition.
3. Resident receives update and support ticket opens.
Expected: ticket visible in support queue.

## UAT-04 Admin Pricing and Reporting
1. Admin updates plan pricing.
2. Runs sustainability report export.
Expected: changes persist with audit trail and export output.
