(function () {
  "use strict";

  var BOOKING_ACTION = "https://book.bnbdimoraorru.it/booking.php";
  var PROPERTY_ID = "312937";
  var ROOMS = [
    { id: "651695", name: "Oliva" },
    { id: "651696", name: "Uva" }
  ];
  var ATTRIBUTION_KEYS = [
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
  var BEDS24_LANGUAGES = {
    da: true,
    de: true,
    en: true,
    es: true,
    fr: true,
    it: true,
    pl: true,
    sv: true
  };
  var PARTY_LABELS = {
    da: {
      adult: function (count) {
        return count + (count === 1 ? " voksen" : " voksne");
      },
      child: function (count) {
        return count + (count === 1 ? " barn" : " børn");
      }
    },
    pl: {
      adult: function (count) {
        return count + (count === 1 ? " dorosły" : " dorosłych");
      },
      child: function (count) {
        return count + (count === 1 ? " dziecko" : " dzieci");
      }
    },
    sv: {
      adult: function (count) {
        return count + (count === 1 ? " vuxen" : " vuxna");
      },
      child: function (count) {
        return count + " barn";
      }
    }
  };
  var JQUERY_URL = "/assets/vendor/jquery/jquery-3.7.1.min.js";
  var JQUERY_UI_CSS_URL =
    "/assets/vendor/jquery-ui/jquery-ui-1.13.3.min.css";
  var JQUERY_UI_URL =
    "/assets/vendor/jquery-ui/jquery-ui-1.13.3.min.js";
  var BEDS24_WIDGET_URL =
    "https://media.xmlcal.com/widget/1.01/js/bookWidget.min.js";
  var widgetLoader;

  function loadScript(src, key) {
    var existing = document.querySelector(
      'script[data-dimora-script="' + key + '"]'
    );
    if (existing && existing.dataset.loaded === "true") {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      var script = existing || document.createElement("script");
      var timeout = window.setTimeout(handleError, 8000);

      function handleLoad() {
        window.clearTimeout(timeout);
        script.dataset.loaded = "true";
        resolve();
      }

      function handleError() {
        window.clearTimeout(timeout);
        reject(new Error("Unable to load " + key));
      }

      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });

      if (!existing) {
        script.src = src;
        script.async = true;
        script.dataset.dimoraScript = key;
        if (key === "jquery-ui") script.id = "jquery-ui-script";
        document.head.appendChild(script);
      }
    });
  }

  function loadStylesheet(href, key) {
    if (document.querySelector('link[data-dimora-style="' + key + '"]')) {
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.dimoraStyle = key;
    document.head.appendChild(link);
  }

  function loadBeds24Widget() {
    if (window.jQuery &&
        window.jQuery.fn &&
        window.jQuery.fn.bookWidget) {
      return Promise.resolve(window.jQuery);
    }

    if (!widgetLoader) {
      widgetLoader = loadScript(JQUERY_URL, "jquery")
        .then(function () {
          loadStylesheet(JQUERY_UI_CSS_URL, "jquery-ui");
          return loadScript(JQUERY_UI_URL, "jquery-ui");
        })
        .then(function () {
          return loadScript(BEDS24_WIDGET_URL, "beds24-widget");
        })
        .then(function () {
          if (!window.jQuery ||
              !window.jQuery.fn ||
              !window.jQuery.fn.bookWidget) {
            throw new Error("Beds24 widget did not initialise");
          }
          return window.jQuery;
        })
        .catch(function (error) {
          widgetLoader = undefined;
          throw error;
        });
    }

    return widgetLoader;
  }

  function makeElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function getText(placeholder, name, fallback) {
    var value = placeholder.dataset[name];
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function getPageLanguage(placeholder) {
    return getText(
      placeholder,
      "language",
      document.documentElement.lang || "en"
    ).toLowerCase().slice(0, 2);
  }

  function getBeds24Language(pageLanguage) {
    return BEDS24_LANGUAGES[pageLanguage] ? pageLanguage : "en";
  }

  function getAttributionFields() {
    var parameters = new URLSearchParams(window.location.search);
    return ATTRIBUTION_KEYS.reduce(function (fields, key) {
      var value = (parameters.get(key) || "").trim().slice(0, 300);
      if (value) fields.push([key, value]);
      return fields;
    }, []);
  }

  function addHiddenField(form, name, value) {
    var existing = form.elements.namedItem(name);
    if (existing) {
      existing.value = value;
      return;
    }

    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    input.dataset.dimoraAvailability = "true";
    form.appendChild(input);
  }

  function addAttributionFields(form, fields) {
    fields.forEach(function (field) {
      if (form.elements.namedItem(field[0])) return;
      addHiddenField(form, field[0], field[1]);
    });
  }

  function localizeWidget(host, strings) {
    var fields = [
      ["[data-check-in]", strings.arrival],
      ["[data-check-out]", strings.departure],
      ["select[name='numadult']", strings.adults],
      ["select[name='numchild']", strings.children]
    ];

    var title = host.querySelector(".b24-widget-title");
    if (title) title.textContent = strings.title;

    fields.forEach(function (entry) {
      var field = host.querySelector(entry[0]);
      if (!field) return;

      field.setAttribute("aria-label", entry[1]);
      if (field.matches("input")) field.setAttribute("placeholder", entry[1]);
      var group = field.closest(".book-form-group");
      var label = group && group.querySelector("label");
      if (label) label.textContent = entry[1];
    });

    var button = host.querySelector("button[type='submit']");
    if (button) {
      button.textContent = strings.submit;
      button.setAttribute("aria-label", strings.submit);
    }

    var partyLabels = PARTY_LABELS[strings.pageLanguage];
    if (partyLabels) {
      [
        ["select[name='numadult']", partyLabels.adult],
        ["select[name='numchild']", partyLabels.child]
      ].forEach(function (entry) {
        var select = host.querySelector(entry[0]);
        if (!select) return;
        Array.prototype.forEach.call(select.options, function (option) {
          option.textContent = entry[1](Number(option.value));
        });
      });
    }
  }

  function clearWidgetDefaultDates(host, form) {
    [
      ["[data-check-in]", "checkin"],
      ["[data-check-out]", "checkout"]
    ].forEach(function (entry) {
      var visibleInput = host.querySelector(entry[0]);
      var hiddenInput = form.elements.namedItem(entry[1]);

      if (visibleInput && window.jQuery) {
        try {
          var picker = window.jQuery(visibleInput);
          var onSelect = picker.datepicker("option", "onSelect");
          picker.datepicker("option", "onSelect", null);
          picker.datepicker("setDate", null);
          picker.datepicker("option", "onSelect", onSelect);
        } catch (error) {
          visibleInput.value = "";
        }
        visibleInput.value = "";
      }
      if (hiddenInput) hiddenInput.value = "";
    });
  }

  function keepDatepickerWithinViewport(host) {
    var inputs = Array.prototype.slice.call(
      host.querySelectorAll(".hasDatepicker")
    );
    var timers = [];

    function clamp() {
      if (window.innerWidth > 620) return;

      var picker = document.getElementById("ui-datepicker-div");
      if (!picker || window.getComputedStyle(picker).display === "none") return;

      var margin = 14;
      var rect = picker.getBoundingClientRect();
      var latestTop = Math.max(margin, window.innerHeight - rect.height - margin);
      var viewportTop = Math.max(margin, Math.min(rect.top, latestTop));
      picker.style.top = window.scrollY + viewportTop + "px";
    }

    function scheduleClamp() {
      timers.forEach(window.clearTimeout);
      timers = [
        window.setTimeout(clamp, 0),
        window.setTimeout(clamp, 80),
        window.setTimeout(clamp, 240),
        window.setTimeout(clamp, 420)
      ];
    }

    inputs.forEach(function (input) {
      input.addEventListener("focus", scheduleClamp);
      input.addEventListener("click", scheduleClamp);
    });
    window.addEventListener("resize", scheduleClamp);

    return function () {
      timers.forEach(window.clearTimeout);
      inputs.forEach(function (input) {
        input.removeEventListener("focus", scheduleClamp);
        input.removeEventListener("click", scheduleClamp);
      });
      window.removeEventListener("resize", scheduleClamp);
    };
  }

  function enhanceDatepickerAccessibility(host, strings) {
    var picker = document.getElementById("ui-datepicker-div");
    var inputs = Array.prototype.slice.call(
      host.querySelectorAll(".hasDatepicker")
    );

    if (!picker) return function () {};

    picker.setAttribute("role", "dialog");
    picker.setAttribute("aria-label", strings.title);

    inputs.forEach(function (input) {
      input.setAttribute("aria-haspopup", "dialog");
      input.setAttribute("aria-controls", picker.id);
    });

    function labelNavigation() {
      var previous = picker.querySelector(".ui-datepicker-prev");
      var next = picker.querySelector(".ui-datepicker-next");

      if (previous) {
        previous.setAttribute("aria-label", strings.prevMonth);
        previous.setAttribute("title", strings.prevMonth);
      }
      if (next) {
        next.setAttribute("aria-label", strings.nextMonth);
        next.setAttribute("title", strings.nextMonth);
      }
    }

    labelNavigation();
    var observer = new MutationObserver(labelNavigation);
    observer.observe(picker, { childList: true, subtree: true });

    return function () {
      observer.disconnect();
      inputs.forEach(function (input) {
        input.removeAttribute("aria-haspopup");
        input.removeAttribute("aria-controls");
      });
    };
  }

  function constrainGuestSelectors(form, capacity) {
    var adults = form.elements.namedItem("numadult");
    var children = form.elements.namedItem("numchild");
    if (!adults || !children ||
        adults.tagName !== "SELECT" ||
        children.tagName !== "SELECT") {
      return function () {};
    }

    function synchronize() {
      var adultCount = Number(adults.value) || 1;
      var childCount = Number(children.value) || 0;

      Array.prototype.forEach.call(adults.options, function (option) {
        option.disabled = Number(option.value) > capacity - childCount;
      });
      Array.prototype.forEach.call(children.options, function (option) {
        option.disabled = Number(option.value) > capacity - adultCount;
      });
    }

    adults.addEventListener("change", synchronize);
    children.addEventListener("change", synchronize);
    adults.dataset.totalGuestCapacity = String(capacity);
    children.dataset.totalGuestCapacity = String(capacity);
    synchronize();

    return function () {
      adults.removeEventListener("change", synchronize);
      children.removeEventListener("change", synchronize);
    };
  }

  function getSubmissionUrl(form) {
    var url = new URL(BOOKING_ACTION);
    new FormData(form).forEach(function (value, key) {
      if (String(value).trim()) url.searchParams.append(key, value);
    });
    return url.toString();
  }

  function getAnalyticsUrl(form) {
    var url = new URL(BOOKING_ACTION);
    ["propid", "lang", "referer", "roomid"].forEach(function (key) {
      var field = form.elements.namedItem(key);
      if (field && String(field.value).trim()) {
        url.searchParams.set(key, field.value);
      }
    });
    return url.toString();
  }

  function trackWidgetSubmission(form, room, strings, onMissingDates) {
    return function (event) {
      event.preventDefault();

      var checkin = form.elements.namedItem("checkin");
      var checkout = form.elements.namedItem("checkout");
      if (!checkin || !checkout || !checkin.value || !checkout.value) {
        onMissingDates(
          !checkin || !checkin.value
            ? form.querySelector("[data-check-in]")
            : form.querySelector("[data-check-out]")
        );
        return;
      }

      if (!form.reportValidity()) return;

      var href = getSubmissionUrl(form);
      var navigated = false;

      function navigate() {
        if (navigated) return;
        navigated = true;
        window.location.href = href;
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "landing_booking_click",
        intent_type: "booking",
        cta_id: "availability_search",
        cta_location: "availability_calendar",
        room: room.name,
        room_id: room.id,
        cta_text: strings.submit,
        link_url: getAnalyticsUrl(form),
        page_language: (
          document.documentElement.lang || strings.language
        ).toLowerCase(),
        eventCallback: navigate
      });
      window.setTimeout(navigate, 250);
    };
  }

  function initialise() {
    var placeholder = document.querySelector("[data-availability-calendar]");
    if (!placeholder ||
        placeholder.dataset.availabilityInitialized === "true") {
      return;
    }
    placeholder.dataset.availabilityInitialized = "true";

    var manualForm = document.querySelector("[data-booking-form]");
    var pageLanguage = getPageLanguage(placeholder);
    var strings = {
      language: getBeds24Language(pageLanguage),
      pageLanguage: pageLanguage,
      labelRoom: getText(placeholder, "labelRoom", "Room"),
      title: getText(placeholder, "title", "Choose your dates"),
      hint: getText(
        placeholder,
        "hint",
        "Select arrival, then departure in the same calendar."
      ),
      available: getText(placeholder, "available", "Available night"),
      unavailable: getText(placeholder, "unavailable", "Unavailable night"),
      loading: getText(placeholder, "loading", "Loading availability…"),
      error: getText(
        placeholder,
        "error",
        "Live availability could not be loaded. Use the date fields below."
      ),
      showManual: getText(placeholder, "showManual", "Enter dates manually"),
      hideManual: getText(placeholder, "hideManual", "Hide manual date fields"),
      arrival: getText(placeholder, "arrival", "Arrival"),
      departure: getText(placeholder, "departure", "Departure"),
      adults: getText(placeholder, "adults", "Adults"),
      children: getText(placeholder, "children", "Children"),
      submit: getText(placeholder, "submit", "Check availability"),
      datesRequired: getText(
        placeholder,
        "datesRequired",
        "Choose arrival and departure first."
      ),
      prevMonth: getText(placeholder, "prevMonth", "Previous month"),
      nextMonth: getText(placeholder, "nextMonth", "Next month"),
      guide: getText(
        placeholder,
        "guide",
        "The booking system confirms the complete stay and final price."
      )
    };
    var attributionFields = getAttributionFields();
    var renderToken = 0;
    var activeCleanup = function () {};
    var manualExpanded = false;

    placeholder.replaceChildren();

    var widget = makeElement("div", "beds24-range-trial");
    var topline = makeElement("div", "beds24-range-trial__topline");
    var picker = makeElement(
      "fieldset",
      "beds24-range-trial__room-picker"
    );
    var pickerLegend = makeElement("legend", "", strings.labelRoom);
    var tabs = makeElement("div", "beds24-range-trial__room-tabs");
    var hint = makeElement("p", "", strings.hint);
    var availabilityLegend = makeElement(
      "div",
      "beds24-range-trial__legend"
    );
    var availableItem = makeElement("span");
    var availableSwatch = makeElement("i", "is-available");
    var unavailableItem = makeElement("span");
    var unavailableSwatch = makeElement("i", "is-unavailable");
    var widgetSlot = makeElement("div", "beds24-range-trial__host");
    var status = makeElement(
      "p",
      "beds24-range-trial__status",
      strings.loading
    );
    var guide = makeElement("p", "beds24-range-trial__guide", strings.guide);
    var manualToggle = makeElement(
      "button",
      "booking-handoff__manual-toggle",
      strings.showManual
    );
    var tabButtons = [];

    availableItem.append(availableSwatch, strings.available);
    unavailableItem.append(unavailableSwatch, strings.unavailable);
    availableSwatch.setAttribute("aria-hidden", "true");
    unavailableSwatch.setAttribute("aria-hidden", "true");
    availabilityLegend.append(availableItem, unavailableItem);

    picker.append(pickerLegend, tabs);
    topline.append(picker, hint);
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    widgetSlot.hidden = true;
    manualToggle.type = "button";
    manualToggle.hidden = true;

    if (manualForm) {
      if (!manualForm.id) manualForm.id = "dimora-manual-booking";
      manualToggle.setAttribute("aria-controls", manualForm.id);
      manualToggle.setAttribute("aria-expanded", "false");
      manualForm.hidden = false;
    }

    widget.append(
      topline,
      availabilityLegend,
      widgetSlot,
      status,
      guide,
      manualToggle
    );
    placeholder.appendChild(widget);

    function setStatus(kind) {
      status.classList.toggle("is-error", kind === "error");
      status.classList.toggle("is-validation", kind === "validation");
      status.hidden = kind === "ready";
      status.textContent = kind === "error"
        ? strings.error
        : kind === "validation"
          ? strings.datesRequired
          : strings.loading;
      status.setAttribute(
        "role",
        kind === "error" || kind === "validation" ? "alert" : "status"
      );
    }

    function showManualFallback() {
      manualToggle.hidden = true;
      if (manualForm) manualForm.hidden = false;
    }

    function updateManualToggle() {
      if (!manualForm) return;
      manualForm.hidden = !manualExpanded;
      manualToggle.textContent = manualExpanded
        ? strings.hideManual
        : strings.showManual;
      manualToggle.setAttribute(
        "aria-expanded",
        manualExpanded ? "true" : "false"
      );
    }

    manualToggle.addEventListener("click", function () {
      manualExpanded = !manualExpanded;
      updateManualToggle();
      if (manualExpanded) {
        var firstField = manualForm.querySelector(
          "input:not([type='hidden']), select, button"
        );
        if (firstField) firstField.focus();
      }
    });

    function renderRoom(room) {
      var currentToken = ++renderToken;
      activeCleanup();
      activeCleanup = function () {};
      widgetSlot.replaceChildren();
      widgetSlot.hidden = true;
      setStatus("loading");
      manualToggle.hidden = true;
      if (manualForm) manualForm.hidden = false;

      tabButtons.forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          button.dataset.roomId === room.id ? "true" : "false"
        );
      });

      var host = makeElement("div");
      host.id = "dimora-beds24-availability-" + room.id;
      widgetSlot.appendChild(host);
      tabButtons.forEach(function (button) {
        button.setAttribute("aria-controls", host.id);
      });

      loadBeds24Widget()
        .then(function ($) {
          if (currentToken !== renderToken) return;

          var form;
          var observer;
          var poller;
          var timeout;
          var feedRequested = false;
          var initialAvailabilityCallbacks = [];
          var regionalChangeInputs = [];
          var removeFeedReadinessListeners = function () {};
          var removeGuestConstraints = function () {};
          var removeDatepickerConstraints = function () {};
          var removeDatepickerAccessibility = function () {};
          var removeDateValidation = function () {};
          var handleSubmit;

          function cleanup() {
            if (observer) observer.disconnect();
            window.clearInterval(poller);
            window.clearTimeout(timeout);
            removeFeedReadinessListeners();
            if (form && handleSubmit) {
              form.removeEventListener("submit", handleSubmit);
            }
            removeGuestConstraints();
            removeDatepickerConstraints();
            removeDatepickerAccessibility();
            removeDateValidation();

            $(host).find(".datepicker, .hasDatepicker").each(function (_, input) {
              try {
                $(input).datepicker("destroy");
              } catch (error) {
                // The widget may already have removed the date picker.
              }
            });
            $(host).empty();
            document.querySelectorAll(
              'style[id="' + host.id + '"]'
            ).forEach(function (style) {
              style.remove();
            });
          }

          activeCleanup = cleanup;

          var expectedFeedName = host.id.safeVarName();
          window[expectedFeedName] = undefined;

          $(host).bookWidget({
            roomid: Number(room.id),
            availableBackgroundColor: "#d7ece7",
            availableColor: "#173b3b",
            buttonBackgroundColor: "#205b63",
            buttonColor: "#ffffff",
            buttonTitle: strings.submit,
            dateFormat: "dd/mm/yy",
            dateSelection: 1,
            defaultNumAdult: 2,
            defaultNumChild: 0,
            formAction: BOOKING_ACTION,
            formTarget: "_self",
            loadJQueryUI: false,
            maxAdult: 4,
            maxChild: 3,
            noExternalFonts: true,
            pastBackgroundColor: "#f2efe9",
            peopleSelection: 2,
            prevText: strings.prevMonth,
            referer: "website",
            showLabels: true,
            unavailableBackgroundColor: "#eee9e1",
            unavailableColor: "#8b8176",
            weekFirstDay: 1,
            nextText: strings.nextMonth,
            widgetLang: strings.language,
            widgetTitle: strings.title,
            widgetType: "BookingBox",
            width: "100%"
          });

          function finishWidget() {
            if (currentToken !== renderToken || form) return Boolean(form);

            var nextForm = host.querySelector("form");
            if (!nextForm) return false;

            var datepickers = $(host).find(".hasDatepicker");
            if (!datepickers.length) return false;

            var feedName = host.dataset.feedVarName;
            if (!feedRequested) {
              initialAvailabilityCallbacks = [];
              datepickers.each(function (_, input) {
                initialAvailabilityCallbacks.push(
                  $(input).datepicker("option", "beforeShowDay")
                );
              });
              var listenerRecords = [];
              datepickers.each(function (_, input) {
                var handleRegionalChange = function () {
                  if (regionalChangeInputs.indexOf(input) === -1) {
                    regionalChangeInputs.push(input);
                  }
                };
                $(input).on("change.dimoraFeedReady", handleRegionalChange);
                listenerRecords.push([input, handleRegionalChange]);
              });
              removeFeedReadinessListeners = function () {
                listenerRecords.forEach(function (record) {
                  $(record[0]).off(
                    "change.dimoraFeedReady",
                    record[1]
                  );
                });
                listenerRecords = [];
              };
              feedRequested = true;
              datepickers.each(function (_, input) {
                $(input).trigger("mouseover");
              });
              return false;
            }

            var currentAvailabilityCallbacks = [];
            datepickers.each(function (_, input) {
              currentAvailabilityCallbacks.push(
                $(input).datepicker("option", "beforeShowDay")
              );
            });
            var currentFeedApplied =
              currentAvailabilityCallbacks.length ===
                initialAvailabilityCallbacks.length &&
              currentAvailabilityCallbacks.every(function (callback, index) {
                return callback !== initialAvailabilityCallbacks[index];
              });
            var regionalOptionsApplied =
              regionalChangeInputs.length === datepickers.length;

            if (!currentFeedApplied ||
                !regionalOptionsApplied ||
                !feedName ||
                !window[feedName] ||
                typeof window[feedName] !== "object") {
              return false;
            }

            form = nextForm;
            removeFeedReadinessListeners();
            removeFeedReadinessListeners = function () {};
            form.action = BOOKING_ACTION;
            form.method = "get";
            form.target = "_self";
            addHiddenField(form, "propid", PROPERTY_ID);
            addHiddenField(form, "lang", strings.language);
            addHiddenField(form, "referer", "website");
            addHiddenField(form, "roomid", room.id);
            addAttributionFields(form, attributionFields);
            localizeWidget(host, strings);
            removeGuestConstraints = constrainGuestSelectors(form, 4);
            removeDatepickerConstraints = keepDatepickerWithinViewport(host);
            removeDatepickerAccessibility = enhanceDatepickerAccessibility(
              host,
              strings
            );
            clearWidgetDefaultDates(host, form);

            var dateInputs = Array.prototype.slice.call(
              host.querySelectorAll("[data-check-in], [data-check-out]")
            );
            function clearDateValidation() {
              dateInputs.forEach(function (input) {
                input.removeAttribute("aria-invalid");
              });
              if (status.classList.contains("is-validation")) {
                setStatus("ready");
              }
            }
            dateInputs.forEach(function (input) {
              input.addEventListener("change", clearDateValidation);
            });
            removeDateValidation = function () {
              dateInputs.forEach(function (input) {
                input.removeEventListener("change", clearDateValidation);
              });
            };

            handleSubmit = trackWidgetSubmission(
              form,
              room,
              strings,
              function (missingInput) {
                clearDateValidation();
                setStatus("validation");
                if (missingInput) {
                  missingInput.setAttribute("aria-invalid", "true");
                  missingInput.focus();
                }
              }
            );
            form.addEventListener("submit", handleSubmit);
            widgetSlot.hidden = false;
            setStatus("ready");
            manualToggle.hidden = false;
            updateManualToggle();
            window.clearInterval(poller);
            window.clearTimeout(timeout);
            return true;
          }

          if (!finishWidget()) {
            observer = new MutationObserver(function () {
              if (finishWidget()) observer.disconnect();
            });
            observer.observe(host, { childList: true, subtree: true });
            poller = window.setInterval(finishWidget, 80);
            timeout = window.setTimeout(function () {
              if (currentToken !== renderToken || form) return;
              observer.disconnect();
              window.clearInterval(poller);
              removeFeedReadinessListeners();
              cleanup();
              setStatus("error");
              showManualFallback();
            }, 8000);
          }
        })
        .catch(function () {
          if (currentToken !== renderToken) return;
          widgetSlot.replaceChildren();
          setStatus("error");
          showManualFallback();
        });
    }

    ROOMS.forEach(function (room) {
      var button = makeElement("button");
      button.type = "button";
      button.dataset.roomId = room.id;
      button.setAttribute("aria-label", room.name);
      button.setAttribute("aria-pressed", "false");
      button.appendChild(makeElement("strong", "", room.name));
      button.addEventListener("click", function () {
        renderRoom(room);
      });
      tabs.appendChild(button);
      tabButtons.push(button);
    });

    if (!manualForm) {
      setStatus("error");
      return;
    }

    var calendarStarted = false;
    var visibilityObserver;

    function startCalendar() {
      if (calendarStarted) return;
      calendarStarted = true;
      if (visibilityObserver) visibilityObserver.disconnect();
      renderRoom(ROOMS[0]);
    }

    if ("IntersectionObserver" in window) {
      visibilityObserver = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) {
          return entry.isIntersecting;
        })) {
          startCalendar();
        }
      }, { rootMargin: "800px 0px" });
      visibilityObserver.observe(placeholder);
    } else {
      startCalendar();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
