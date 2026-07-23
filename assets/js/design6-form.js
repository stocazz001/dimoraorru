(function () {
  var form = document.querySelector("[data-booking-form]");
  if (!form) return;

  var arrival = form.elements.checkin;
  var departure = form.elements.checkout;
  var adults = form.elements.numadult;
  var children = form.elements.numchild;
  var room = form.elements.roomid;
  var attributionKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_id",
    "utm_term",
    "utm_content",
    "gclid",
    "gbraid",
    "wbraid"
  ];

  function localDateValue(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function addDays(value, days) {
    var parts = String(value || "").split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    date.setDate(date.getDate() + days);
    return localDateValue(date);
  }

  function setOptions(select, maximum, selected) {
    var minimum = select === adults ? 1 : 0;
    select.innerHTML = "";
    for (var count = minimum; count <= maximum; count += 1) {
      var option = document.createElement("option");
      option.value = String(count);
      option.textContent = String(count);
      select.appendChild(option);
    }
    select.value = String(Math.min(maximum, Math.max(minimum, selected)));
  }

  function reconcileGuests(changed) {
    var capacity = room.value ? 4 : 8;
    var adultCount = Number(adults.value) || 1;
    var childCount = Number(children.value) || 0;

    if (changed === room) {
      adultCount = Math.min(capacity, Math.max(1, adultCount));
      childCount = Math.min(childCount, capacity - adultCount);
    }

    if (adultCount + childCount > capacity) {
      if (changed === adults) {
        childCount = Math.max(0, capacity - adultCount);
      } else {
        adultCount = Math.max(1, capacity - childCount);
      }
    }

    setOptions(adults, capacity - childCount, adultCount);
    setOptions(children, capacity - adultCount, childCount);
  }

  function updateDeparture() {
    var earliest = arrival.value ? addDays(arrival.value, 1) : "";
    departure.disabled = !earliest;
    departure.min = earliest;
    if (departure.value && departure.value < earliest) {
      departure.value = "";
    }
  }

  function appendAttribution() {
    var current = new URLSearchParams(window.location.search);
    attributionKeys.forEach(function (key) {
      var value = (current.get(key) || "").trim().slice(0, 300);
      if (!value || form.elements[key]) return;
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
  }

  function submissionUrl() {
    var url = new URL(form.action);
    new FormData(form).forEach(function (value, key) {
      if (String(value).trim()) url.searchParams.append(key, value);
    });
    return url.toString();
  }

  function analyticsLinkUrl() {
    var url = new URL(form.action);
    ["propid", "lang", "referer"].forEach(function (key) {
      var field = form.elements[key];
      if (field && String(field.value).trim()) {
        url.searchParams.set(key, field.value);
      }
    });
    return url.toString();
  }

  function submitWithTracking(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var href = submissionUrl();
    var selectedRoom = room.options[room.selectedIndex];
    var done = false;
    function go() {
      if (done) return;
      done = true;
      window.location.href = href;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "landing_booking_click",
      intent_type: "booking",
      cta_id: form.dataset.cta || "final_search",
      cta_location: form.dataset.location || "booking_form",
      room: room.value && selectedRoom ? selectedRoom.textContent.trim() : "",
      room_id: room.value || "",
      cta_text: form.querySelector('[type="submit"]').textContent.trim(),
      link_url: analyticsLinkUrl(),
      page_language: (document.documentElement.lang || "it").toLowerCase(),
      eventCallback: go
    });
    window.setTimeout(go, 250);
  }

  var today = localDateValue(new Date());
  arrival.min = today;
  updateDeparture();
  appendAttribution();
  reconcileGuests();

  arrival.addEventListener("change", updateDeparture);
  adults.addEventListener("change", function () {
    reconcileGuests(adults);
  });
  children.addEventListener("change", function () {
    reconcileGuests(children);
  });
  room.addEventListener("change", function () {
    reconcileGuests(room);
  });
  form.addEventListener("submit", submitWithTracking);
})();
