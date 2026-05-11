# LibSpace × Passmark — Breaking Apps Hackathon

AI-powered test suite for LibSpace (erp.libspace.in) using Passmark.

## Tests
- T1: Dashboard load timing
- T2: Full-time seat booking via interactive map
- T3: Occupied seat protection
- T4: Dual part-time booking (provider limit finding)
- T5: Race condition — same seat same shift blocked
- T6: DOB field validation bug
- T7: Duplicate phone number toast error
- T8: Session security after logout
- T9: Invoice column documentation mismatch
- T10: Exploratory AI testing

## Setup
npm install
cp .env.example .env
Add OPENROUTER_API_KEY to .env
npx playwright test tests/libspace-final.spec.ts --project=chromium

## Findings
- Race condition test passed — dual part-time booking system works correctly
- Invoice columns differ from internal documentation
- DOB field rejects pre-filled default values
- Session security correctly invalidated after logout

Submitted to #BreakingAppsHackathon by Hashnode x Bug0
