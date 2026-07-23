# Production availability calendar decision

## Date

`2026-07-23`

## Status

Approved by the owner for production implementation.

## Decision

Publish the room-specific Beds24 `BookingBox` calendar on all eight Dimora Orrù
homepages.

- Guests choose either Oliva (`651695`) or Uva (`651696`) before selecting dates.
- Arrival selection opens departure selection in the same calendar flow.
- The calendar colours show room-level availability for individual nights.
- The standard, prefilled Beds24 offer page remains the booking destination.
- The existing manual date form remains the automatic fallback.
- Beds24 remains authoritative for the complete stay, restrictions, price,
  booking creation, Stripe/3DS, payment and confirmation.

The production widget must not use a property-level union calendar or the
`br1-ROOMID=Book` direct-checkout shortcut.

## Reason

The same-calendar range interaction reduces friction and gives guests useful
room-level availability before handoff. Keeping the standard Beds24 offer page
avoids treating nightly colour data as proof that every booking condition is
satisfied.

## Known limitations

- A green night does not by itself prove that a complete stay satisfies the
  applicable minimum stay.
- The public widget feed does not expose separate closed-to-arrival and
  closed-to-departure states.
- Beds24 therefore validates the entire selection again after submission.
- The calendar covers the period exposed by the Beds24 widget feed.

The interface must describe the colours as a nightly guide and must not promise
that a selected range is bookable before the Beds24 handoff succeeds.

## Dependencies and privacy

- jQuery `3.7.1` and jQuery UI `1.13.3` are pinned and self-hosted by Dimora
  Orrù.
- The Beds24 booking-widget script and room-level availability feed are loaded
  from `media.xmlcal.com`.
- The calendar layer sends no guest name, email, phone number, identity data,
  payment data or access data.
- Dates and guest counts are transmitted only when the guest submits the
  booking search to Beds24.

## Analytics

- A genuine widget submission emits `landing_booking_click` once.
- The calendar must not emit `begin_checkout`, `confirm_booking` or
  `cancel_booking`.
- Navigation has a short fallback so denied consent or unavailable analytics
  cannot block the booking handoff.

## Alternatives considered

1. Keep only native date inputs: safest, but retains the higher-friction
   interaction and provides no availability guidance.
2. Use the property-level availability calendar: rejected because individual
   green nights can combine different rooms into an impossible stay.
3. Skip directly to Beds24 checkout: rejected until a full offer validation
   succeeds and the checkout analytics gate is updated.
4. Build a custom calendar through a read-only Cloudflare Worker: retained as
   the longer-term target for complete room/date/occupancy validation.

## Expected impact

- Financial impact: no rate, fee, tax or payment change.
- Operational impact: no inventory, restriction, channel or booking-setting
  change.
- Conversion impact: fewer date-selection steps and earlier visibility of
  room-level nightly availability.
- Compliance impact: supporting libraries are self-hosted; Beds24 remains the
  only external functional calendar service.

## Validation

Before deployment:

1. Verify Oliva and Uva remain separate and capped at four guests.
2. Verify arrival moves directly to departure selection.
3. Verify checkout on or before check-in cannot be selected.
4. Compare available and unavailable colours with Beds24 for both rooms.
5. Verify the standard Beds24 URL preserves room, dates, guests, language,
   `referer=website` and allow-listed campaign attribution.
6. Verify manual entry works when the widget script or feed fails.
7. Verify desktop, `390 × 844`, keyboard and all eight languages.
8. Verify one `landing_booking_click` and no other booking-funnel event.

## Rollback

Remove the availability-widget script reference and placeholder from the eight
homepages. The existing manual prefilled form and direct Beds24 link then become
the unchanged primary booking path.
