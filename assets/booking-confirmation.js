(function () {
  "use strict";

  var allowedLanguages = {
    it: true,
    en: true,
    es: true,
    de: true,
    fr: true,
    pl: true,
    da: true,
    sv: true
  };
  var allowedKeys = {
    status: true,
    propid: true,
    lang: true
  };
  var state = "generic";
  var pageLanguage = (document.documentElement.lang || "it")
    .toLowerCase()
    .slice(0, 2);

  try {
    var search = window.location.search || "";
    var params = new URLSearchParams(search);
    var hasOnlyAllowedKeys = true;
    var hasDuplicates = false;
    var parameterCount = 0;

    params.forEach(function (_value, key) {
      parameterCount += 1;
      if (!allowedKeys[key]) hasOnlyAllowedKeys = false;
      if (params.getAll(key).length !== 1) hasDuplicates = true;
    });

    var status = params.get("status") || "";
    var propertyId = params.get("propid") || "";
    var returnedLanguage = (params.get("lang") || "").toLowerCase();
    var isValid =
      search.length <= 256 &&
      parameterCount === 3 &&
      hasOnlyAllowedKeys &&
      !hasDuplicates &&
      propertyId === "312937" &&
      allowedLanguages[returnedLanguage] === true &&
      returnedLanguage === pageLanguage;

    if (isValid && status === "confirmed") state = "confirmed";
    if (isValid && status === "request") state = "request";

    if (
      !search &&
      window.history.state &&
      window.history.state.dimoraBookingReturn &&
      window.history.state.dimoraBookingReturn.lang === pageLanguage &&
      (window.history.state.dimoraBookingReturn.state === "confirmed" ||
        window.history.state.dimoraBookingReturn.state === "request")
    ) {
      state = window.history.state.dimoraBookingReturn.state;
    }
  } catch (_error) {
    state = "generic";
  }

  document.documentElement.setAttribute("data-booking-state", state);

  try {
    var cleanPath =
      pageLanguage === "it"
        ? "/booking-confirmed/"
        : "/" + pageLanguage + "/booking-confirmed/";
    var nextState =
      state === "confirmed" || state === "request"
        ? { dimoraBookingReturn: { state: state, lang: pageLanguage } }
        : null;
    window.history.replaceState(nextState, "", cleanPath);
  } catch (_error) {
    /* The page remains usable if history replacement is unavailable. */
  }
})();
