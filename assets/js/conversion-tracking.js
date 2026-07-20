(function () {
  var translations = {
    it: { booking: "Verifica disponibilità", call: "Chiama", label: "Prenota direttamente" },
    en: { booking: "Check availability", call: "Call", label: "Book direct" },
    es: { booking: "Ver disponibilidad", call: "Llamar", label: "Reserva directa" },
    de: { booking: "Verfügbarkeit prüfen", call: "Anrufen", label: "Direkt buchen" },
    fr: { booking: "Voir les disponibilités", call: "Appeler", label: "Réserver en direct" },
    pl: { booking: "Sprawdź dostępność", call: "Zadzwoń", label: "Rezerwacja bezpośrednia" },
    da: { booking: "Tjek tilgængelighed", call: "Ring", label: "Book direkte" },
    sv: { booking: "Kontrollera tillgänglighet", call: "Ring", label: "Boka direkt" }
  };

  function addMobileBookingBar() {
    var bookingLink = document.querySelector('a[href*="book.bnbdimoraorru.it/booking.php"]');
    if (!bookingLink || document.querySelector('.booking-bar')) return;

    var language = (document.documentElement.lang || "it").toLowerCase().split("-")[0];
    var copy = translations[language] || translations.it;
    var bar = document.createElement("aside");
    var booking = document.createElement("a");
    var phone = document.createElement("a");

    bar.className = "booking-bar";
    bar.setAttribute("aria-label", copy.label);

    booking.className = "booking-bar__button";
    booking.href = bookingLink.href;
    booking.dataset.cta = "mobile_sticky_booking";
    booking.dataset.location = "mobile_sticky_bar";
    booking.textContent = copy.booking;

    phone.className = "booking-bar__call";
    phone.href = "tel:+393492166046";
    phone.dataset.cta = "mobile_sticky_phone";
    phone.dataset.location = "mobile_sticky_bar";
    phone.setAttribute("aria-label", copy.call + " +39 349 216 6046");
    phone.textContent = "☎";

    bar.appendChild(booking);
    bar.appendChild(phone);
    document.body.appendChild(bar);
    document.body.classList.add("booking-bar-present");
  }

  addMobileBookingBar();

  function linkKind(anchor) {
    if (!anchor || !anchor.href) return "";
    try {
      var url = new URL(anchor.href, window.location.href);
      if (url.hostname === "book.bnbdimoraorru.it" && url.pathname.indexOf("/booking.php") === 0) {
        return "booking";
      }
      if (url.protocol === "tel:") return "phone";
      if (url.hostname === "wa.me" || url.hostname.indexOf("whatsapp.com") !== -1) return "whatsapp";
      if (url.hostname.indexOf("google.") !== -1 && (url.pathname.indexOf("/maps") !== -1 || url.search.indexOf("destination=") !== -1 || url.search.indexOf("q=") !== -1)) {
        return "maps";
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function pushEvent(anchor, kind, callback) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: kind === "booking" ? "landing_booking_click" : "conversion_intent_click",
      intent_type: kind,
      cta_id: anchor.dataset.cta || "",
      cta_location: anchor.dataset.location || "",
      room: anchor.dataset.room || "",
      room_id: anchor.dataset.roomId || "",
      cta_text: (anchor.textContent || "").trim(),
      link_url: anchor.href,
      page_language: (document.documentElement.lang || "").toLowerCase(),
      eventCallback: callback
    });
  }

  function onClick(event) {
    var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    var kind = linkKind(anchor);
    if (!kind) return;

    if (kind === "booking" && anchor.classList.contains("js-booking-link")) return;

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      pushEvent(anchor, kind);
      return;
    }

    if (kind !== "booking") {
      pushEvent(anchor, kind);
      return;
    }

    event.preventDefault();
    var href = anchor.href;
    var done = false;
    function go() {
      if (done) return;
      done = true;
      window.location.href = href;
    }
    pushEvent(anchor, kind, go);
    setTimeout(go, 250);
  }

  document.addEventListener("click", onClick, { passive: false });
})();
