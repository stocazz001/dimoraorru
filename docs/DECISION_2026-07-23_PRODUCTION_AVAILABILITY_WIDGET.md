# Production availability calendar decision

## Date

`2026-07-23`

Updated `2026-07-26` to use Beds24's room-specific direct-checkout handoff.

## Status

Approved by the owner for production implementation.

## Decision

Publish the room-specific Beds24 `BookingBox` calendar on all eight Dimora Orrù
homepages.

- Guests choose either Oliva (`651695`) or Uva (`651696`) before selecting dates.
- Arrival selection opens departure selection in the same calendar flow.
- The calendar colours show room-level availability for individual nights.
- Available nights may also show an indicative nightly base price for two
  adults, drawn from a same-origin snapshot of the Beds24 standard offer.
- When a room, dates and guests are selected through the availability-aware
  calendar, the handoff includes Beds24's offer-one parameter
  (`br1-ROOMID=Book`) and opens the guest-details checkout directly.
- The manual fallback form continues to use the standard, prefilled Beds24
  offer page because it has not verified room-level availability.
- The existing manual date form remains the automatic fallback.
- Beds24 remains authoritative for the complete stay, restrictions, price,
  booking creation, Stripe/3DS, payment and confirmation.

The production widget must not use a property-level union calendar.

## Reason

The same-calendar range interaction reduces friction and gives guests useful
room-level availability before handoff. Once the site has already captured a
specific available room, dates and guest count, asking for the room quantity
again adds a redundant step. The direct handoff removes that step without
bypassing Beds24's server-side validation.

## Known limitations

- A green night does not by itself prove that a complete stay satisfies the
  applicable minimum stay.
- The public widget feed does not expose separate closed-to-arrival and
  closed-to-departure states.
- The two-person nightly prices are a cached preview, not a complete-stay
  quote; they may briefly lag a rate change or be absent if a price cannot be
  refreshed.
- Every displayed accommodation price excludes the tourist tax established by
  the Municipality of Cabras.
- Beds24 therefore validates the entire selection again after submission.
- `br1` selects Beds24 offer 1. If the room's offer ordering changes, the
  handoff mapping must be revalidated.
- The calendar covers the period exposed by the Beds24 widget feed.

The interface must describe the colours and nightly prices as a guide and must
not promise that a selected range is bookable at the previewed nightly amount
before the Beds24 handoff succeeds.

## Dependencies and privacy

- jQuery `3.7.1` and jQuery UI `1.13.3` are pinned and self-hosted by Dimora
  Orrù.
- The Beds24 booking-widget script and room-level availability feed are loaded
  from `media.xmlcal.com`.
- A daily GitHub Actions job refreshes a static, same-origin JSON snapshot of
  available-night prices for two adults from the public Beds24 standard-offer
  response. A failed refresh leaves the previous snapshot unchanged. When the
  snapshot changes, the job commits it and requests a rebuild of the
  branch-based GitHub Pages site.
- The calendar layer sends no guest name, email, phone number, identity data,
  payment data or access data.
- Dates and guest counts are transmitted only when the guest submits the
  booking search to Beds24.

## Analytics

- A genuine widget submission emits `landing_booking_click` once.
- The calendar must not emit `begin_checkout`, `confirm_booking` or
  `cancel_booking`.
- Direct checkout does not change the event gate: the website cannot know
  whether Beds24 will accept the complete stay until the destination loads.
- The current Beds24 custom-head `begin_checkout` gate expects `page=book3` and
  `sr1-*`; a direct `br1-*` checkout therefore does not emit that event. The
  owner accepted this temporary instrumentation gap when approving production
  deployment on `2026-07-26`; updating the Beds24-side gate to detect the
  confirmed guest-details checkout DOM remains a follow-up.
- Navigation has a short fallback so denied consent or unavailable analytics
  cannot block the booking handoff.

## Alternatives considered

1. Keep only native date inputs: safest, but retains the higher-friction
   interaction and provides no availability guidance.
2. Use the property-level availability calendar: rejected because individual
   green nights can combine different rooms into an impossible stay.
3. Always use the standard Beds24 offer page: retained for the manual fallback
   because it can recover from unavailable or restricted selections, but
   rejected for the availability-aware calendar because it repeats a choice
   the guest has already made.
4. Build a custom calendar through a read-only Cloudflare Worker: retained as
   the longer-term target for complete room/date/occupancy validation.

## Expected impact

- Financial impact: no rate, fee, tax or payment change; the interface only
  previews existing rates and states that tourist tax is excluded.
- Operational impact: no inventory, restriction, channel or booking-setting
  change.
- Conversion impact: fewer date-selection steps, no redundant room-quantity
  prompt for a specific-room search, and earlier visibility of room-level
  nightly availability.
- Compliance impact: supporting libraries are self-hosted; Beds24 remains the
  only external functional calendar service.

## Validation

Before deployment:

1. Verify Oliva and Uva remain separate and capped at four guests.
2. Verify arrival moves directly to departure selection.
3. Verify checkout on or before check-in cannot be selected.
4. Compare available and unavailable colours with Beds24 for both rooms.
5. Verify two-person base-price chips appear only on available nights and
   compare sample nights for both rooms with the standard Beds24 offer.
6. Verify the tourist-tax exclusion is present and correctly localized on all
   eight homepages.
7. Verify valid Oliva and Uva searches open the correct Beds24 guest-details
   checkout with room, dates, guests, price and language preserved.
8. Verify Beds24 still rejects an unavailable or restricted direct-checkout
   selection.
9. Verify the direct URL preserves `referer=website` and allow-listed campaign
   attribution.
10. Verify manual entry retains the standard offer page whether or not a room
    is selected.
11. Verify manual entry works when the widget script or feed fails.
12. Verify desktop, `390 × 844`, keyboard and all eight languages.
13. Verify one `landing_booking_click` and no other booking-funnel event.
14. Verify the Beds24-side `begin_checkout` gate on a direct checkout after its
    custom-head script has been updated.

## Rollback

Remove the availability-widget script reference and placeholder from the eight
homepages. The existing manual prefilled form and direct Beds24 link then become
the unchanged primary booking path. To roll back only the price preview, remove
the price decorator, static snapshot, and scheduled refresh workflow while
leaving the availability widget in place. To restore the intermediate Beds24
offer-selection screen, remove the dynamic `br1-ROOMID=Book` parameter from the
calendar submission builder.
