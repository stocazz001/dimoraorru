(function () {
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
      event: "conversion_intent_click",
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
