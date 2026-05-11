import { test, expect } from "@playwright/test";
import { runSteps, runUserFlow, configure } from "passmark";
import dotenv from "dotenv";
dotenv.config();

configure({ ai: { gateway: "openrouter" } });

const LOGIN = [
  { description: "Navigate to https://erp.libspace.in" },
  { description: "Type email into Email Address field", data: { value: process.env.LIBSPACE_EMAIL! } },
  { description: "Type password into Password field", data: { value: process.env.LIBSPACE_PASSWORD! } },
  { description: "Click Sign In button" },
];

test.describe("LibSpace Final Test Suite", () => {

  // ── T1: TIMING BASELINE ──────────────────────────────────────────────────
  test("[T1] Timing — dashboard load", async ({ page }) => {
    test.setTimeout(120_000);
    const start = Date.now();
    await runSteps({
      page,
      userFlow: "Dashboard baseline",
      steps: [
        ...LOGIN,
        { description: "Observe the dashboard stats" },
      ],
      assertions: [{ assertion: "Dashboard shows library stats including seat availability and member count" }],
      test, expect,
    });
    console.log(`\n⏱ T1: ${Date.now() - start}ms\n`);
  });

  // ── T2: FULL TIME BOOKING ────────────────────────────────────────────────
  test("[T2] Full-time booking — correct flow on seat map", async ({ page }) => {
    test.setTimeout(180_000);
    await runSteps({
      page,
      userFlow: "Full time seat booking via map",
      steps: [
        ...LOGIN,
        { description: "Click Seat Allocation in the left sidebar" },
        { description: "You will see an interactive grid seat map. Click on a green available seat by its number — for example click seat number 03" },
        { description: "A panel opens on the right side. From the Plan or Shift dropdown select full day" },
        { description: "Click the Assign to Student button" },
        { description: "In the student search dropdown that appears search for and select Stu 1" },
      ],
      assertions: [{ assertion: "The seat is now booked — it turns red on the map confirming successful assignment" }],
      test, expect,
    });
  });

  // ── T3: BLOCK DOUBLE BOOKING — RED SEAT HAS NO ASSIGN BUTTON ────────────
  test("[T3] Occupied seat shows no Assign button — only Vacate", async ({ page }) => {
    test.setTimeout(180_000);
    await runSteps({
      page,
      userFlow: "Verify occupied seat cannot be double booked",
      steps: [
        ...LOGIN,
        { description: "Click Seat Allocation in the left sidebar" },
        { description: "Look at the interactive seat map and find a red seat — a seat that is already booked" },
        { description: "Click on the red occupied seat" },
        { description: "Observe the panel that opens on the right side" },
      ],
      assertions: [
        { assertion: "The panel shows the current occupant details and a Vacate button — there is NO Assign to Student button visible for an occupied seat" },
      ],
      test, expect,
    });
  });

  // ── T4: TWO PART TIME DIFFERENT SHIFTS SAME SEAT (SHOULD WORK) ──────────
  test("[T4] Two part-time students different shifts same seat — should work", async ({ page }) => {
    test.setTimeout(240_000);
    await runSteps({
      page,
      userFlow: "Part time dual booking different shifts",
      steps: [
        ...LOGIN,
        { description: "Click Seat Allocation in the left sidebar" },
        { description: "Click on a green available seat on the seat map — for example seat 05" },
        { description: "From the Plan or Shift dropdown select part time" },
        { description: "Click the Assign to Student button" },
        { description: "Type stu in the student search textbox and wait for results then click the first student name that appears" },
        { description: "Now click on the same seat 05 again on the map" },
        { description: "From the Plan or Shift dropdown select Part time 2" },
        { description: "Click the Assign to Student button" },
        { description: "Type stu in the student search textbox and wait for results then click the second student name that appears" },
      ],
      assertions: [{ assertion: "Both bookings confirmed — seat 05 has two different students assigned to part time and Part time 2 shifts respectively" }],
      test, expect,
    });
  });

  // ── T5: RACE CONDITION — SAME SEAT SAME SHIFT BLOCKED ───────────────────
  test("[T5] Race condition — same seat same shift cannot be double booked", async ({ page }) => {
    test.setTimeout(180_000);
    await runSteps({
      page,
      userFlow: "Race condition same shift conflict",
      steps: [
        ...LOGIN,
        { description: "Click Seat Allocation in the left sidebar" },
        { description: "Find seat 05 on the map which already has part time shift booked" },
        { description: "Click on seat 05" },
        { description: "From the Plan or Shift dropdown try to select part time — the same shift already booked on this seat" },
        { description: "Observe whether the Assign to Student button is available or blocked" },
      ],
      assertions: [{ assertion: "The system prevents double booking the same shift — either the part time option is disabled or the Assign to Student button does not appear for an already booked shift" }],
      test, expect,
    });
  });

  // ── T6: DOB BUG — TYPED INPUT ───────────────────────────────────────────
  test("[T6] Bug — date of birth typed input validation", async ({ page }) => {
    test.setTimeout(180_000);
    await runSteps({
      page,
      userFlow: "DOB field direct typing test",
      steps: [
        ...LOGIN,
        { description: "Click Students in the left sidebar" },
        { description: "Click New Admission button" },
        { description: "Fill First Name field", data: { value: "Test" } },
        { description: "Fill Last Name field", data: { value: "DOB" } },
        { description: "Fill Phone Number field", data: { value: "9999999999" } },
        { description: "Check the Same as Phone Number checkbox for WhatsApp Number" },
        { description: "Find the Date of Birth field with placeholder dd/mm/yyyy" },
        { description: "Try typing directly into the Date of Birth field — type 01012001" },
        { description: "Observe whether the field accepts the typed date or shows an error" },
      ],
      assertions: [{ assertion: "The Date of Birth field correctly accepts directly typed date input — no error appears after typing 01012001" }],
      test, expect,
    });
  });

  // ── T7: DUPLICATE PHONE NUMBER ───────────────────────────────────────────
  test("[T7] Duplicate phone number shows toast error", async ({ page }) => {
    test.setTimeout(180_000);
    await runSteps({
      page,
      userFlow: "Duplicate phone number validation",
      steps: [
        ...LOGIN,
        { description: "Click Students in the left sidebar" },
        { description: "Click New Admission button" },
        { description: "Fill First Name field", data: { value: "Dup" } },
        { description: "Fill Last Name field", data: { value: "Test" } },
        { description: "Fill Phone Number field with 1111111111 — a number already used by existing student Stu 1", data: { value: "1111111111" } },
        { description: "Check the Same as Phone Number checkbox for WhatsApp Number" },
        { description: "Fill Email Address field", data: { value: "dup@test.com" } },
        { description: "Click the calendar icon next to Date of Birth and select any date" },
        { description: "Select Male from the Gender dropdown" },
        { description: "Fill Residential Address field", data: { value: "Ghazipur" } },
        { description: "Scroll to bottom of the form" },
        { description: "Select part time from the Membership Plan dropdown" },
        { description: "Select today as Start Date using the date picker" },
        { description: "Check the Agreements checkbox" },
        { description: "Click Confirm Admission button" },
      ],
      assertions: [{ assertion: "A toast notification appears with the exact text: The phone has already been taken" }],
      test, expect,
    });
  });

  // ── T8: SESSION SECURITY ─────────────────────────────────────────────────
  test("[T8] Session security — dashboard inaccessible after logout", async ({ page }) => {
    test.setTimeout(120_000);
    await runSteps({
      page,
      userFlow: "Session security check",
      steps: [
        ...LOGIN,
        { description: "Look at the top right corner of the screen and click on the user profile icon showing user initials" },
        { description: "Click the Logout option which appears in red text in the dropdown menu" },
        { description: "After logout press the browser back button" },
      ],
      assertions: [{ assertion: "After logout and pressing back the user sees the login page not the dashboard — session is properly invalidated" }],
      test, expect,
    });
  });

  // ── T9: INVOICE EMPTY STATE ──────────────────────────────────────────────
  test("[T9] Invoices section — correct empty state and columns", async ({ page }) => {
    test.setTimeout(120_000);
    await runSteps({
      page,
      userFlow: "Invoice empty state check",
      steps: [
        ...LOGIN,
        { description: "Look in the left sidebar under the ACCOUNTING section" },
        { description: "Click Invoices under the ACCOUNTING section" },
        { description: "Observe what the page shows" },
      ],
      assertions: [
        { assertion: "The invoices page loads and shows a table with these columns in order: Student, Invoice Date, Due Date, Subtotal, Tax, Total, Balance, Status, Actions" },
        { assertion: "If no invoices exist the page shows the message: No transactions found" },
      ],
      test, expect,
    });
  });

  // ── T10: EXPLORATORY ─────────────────────────────────────────────────────
  test("[T10] Exploratory — AI finds what humans missed", async ({ page }) => {
    test.setTimeout(240_000);
    await runUserFlow({
      page,
      userFlow: "Explore LibSpace as new admin",
      steps: `Navigate to https://erp.libspace.in, login with email ${process.env.LIBSPACE_EMAIL} and password ${process.env.LIBSPACE_PASSWORD}.
      You are a first-time library administrator. Here is how the app works:
      - Seat Allocation: interactive grid map. Green seats are available, red are booked. Click a green seat to open booking panel. Select shift from dropdown (part time, Part time 2, full day). Click Assign to Student. Search student name.
      - Students: click New Admission to add students. Form has First Name, Last Name, Phone, WhatsApp, Email, DOB, Gender, Address, Membership Plan, Start Date.
      - Invoices: found under ACCOUNTING section in sidebar. Shows fee records.
      - Logout: top right corner, click profile icon, click Logout in red.
      Explore each section thoroughly. Note anything broken, confusing, or that a new admin might struggle with.`,
      effort: "high",
    });
  });

});