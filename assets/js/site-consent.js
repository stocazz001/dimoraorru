(function () {
  var GTM_ID = "GTM-5QJSHX9K";
  var STORAGE_KEY = "bnbConsent";
  var loadedGtm = false;
  var lang = (document.documentElement.lang || "en").toLowerCase().slice(0, 2);

  var copy = {
    it: {
      bannerTitle: "Preferenze privacy",
      bannerText:
        "Usiamo strumenti tecnici essenziali e, solo con il tuo consenso, analytics per misurare traffico e click sulle CTA.",
      acceptAll: "Accetta tutto",
      rejectOptional: "Rifiuta opzionali",
      manage: "Gestisci consensi",
      modalTitle: "Gestisci i consensi",
      save: "Salva preferenze",
      essential: "Tecnici essenziali",
      essentialText: "Necessari per il funzionamento del sito e per salvare la tua scelta.",
      analytics: "Analytics",
      analyticsText: "Misurazione anonima del traffico e dei click sulle CTA.",
      alwaysOn: "Sempre attivi",
      privacy: "Privacy policy",
      cookies: "Cookie policy",
      footerManage: "Gestisci consensi"
    },
    en: {
      bannerTitle: "Privacy preferences",
      bannerText:
        "We use essential technical tools and, only with your consent, analytics to measure traffic and CTA clicks.",
      acceptAll: "Accept all",
      rejectOptional: "Reject optional",
      manage: "Manage consent",
      modalTitle: "Manage consent",
      save: "Save preferences",
      essential: "Essential technical",
      essentialText: "Required for the site to work and to remember your choice.",
      analytics: "Analytics",
      analyticsText: "Anonymous measurement of traffic and CTA clicks.",
      alwaysOn: "Always on",
      privacy: "Privacy policy",
      cookies: "Cookie policy",
      footerManage: "Manage consent"
    },
    es: {
      bannerTitle: "Preferencias de privacidad",
      bannerText:
        "Usamos herramientas técnicas esenciales y, solo con tu consentimiento, analytics para medir tráfico y clics en las CTA.",
      acceptAll: "Aceptar todo",
      rejectOptional: "Rechazar opcionales",
      manage: "Gestionar consentimiento",
      modalTitle: "Gestionar consentimiento",
      save: "Guardar preferencias",
      essential: "Técnicos esenciales",
      essentialText: "Necesarios para que el sitio funcione y para recordar tu elección.",
      analytics: "Analytics",
      analyticsText: "Medición anónima del tráfico y de los clics en las CTA.",
      alwaysOn: "Siempre activos",
      privacy: "Política de privacidad",
      cookies: "Política de cookies",
      footerManage: "Gestionar consentimiento"
    },
    de: {
      bannerTitle: "Datenschutzeinstellungen",
      bannerText:
        "Wir verwenden notwendige technische Tools und nur mit Ihrer Zustimmung Analysen zur Messung von Traffic und CTA-Klicks.",
      acceptAll: "Alle akzeptieren",
      rejectOptional: "Optionale ablehnen",
      manage: "Einwilligung verwalten",
      modalTitle: "Einwilligung verwalten",
      save: "Einstellungen speichern",
      essential: "Technisch erforderlich",
      essentialText: "Notwendig, damit die Website funktioniert und Ihre Auswahl gespeichert wird.",
      analytics: "Analytics",
      analyticsText: "Anonyme Messung von Besuchen und CTA-Klicks.",
      alwaysOn: "Immer aktiv",
      privacy: "Datenschutzerklärung",
      cookies: "Cookie-Richtlinie",
      footerManage: "Einwilligung verwalten"
    },
    fr: {
      bannerTitle: "Préférences de confidentialité",
      bannerText:
        "Nous utilisons des outils techniques essentiels et, uniquement avec votre consentement, des analytics pour mesurer le trafic et les clics sur les CTA.",
      acceptAll: "Tout accepter",
      rejectOptional: "Refuser l'optionnel",
      manage: "Gérer le consentement",
      modalTitle: "Gérer le consentement",
      save: "Enregistrer les préférences",
      essential: "Techniques essentiels",
      essentialText: "Nécessaires au fonctionnement du site et à la mémorisation de votre choix.",
      analytics: "Analytics",
      analyticsText: "Mesure anonyme du trafic et des clics sur les CTA.",
      alwaysOn: "Toujours actifs",
      privacy: "Politique de confidentialité",
      cookies: "Politique de cookies",
      footerManage: "Gérer le consentement"
    },
    pl: {
      bannerTitle: "Ustawienia prywatności",
      bannerText:
        "Używamy niezbędnych narzędzi technicznych, a tylko za Twoją zgodą także analytics do pomiaru ruchu i kliknięć w CTA.",
      acceptAll: "Akceptuj wszystko",
      rejectOptional: "Odrzuć opcjonalne",
      manage: "Zarządzaj zgodą",
      modalTitle: "Zarządzaj zgodą",
      save: "Zapisz ustawienia",
      essential: "Techniczne niezbędne",
      essentialText: "Niezbędne do działania strony i zapamiętania Twojego wyboru.",
      analytics: "Analytics",
      analyticsText: "Anonimowy pomiar ruchu i kliknięć w CTA.",
      alwaysOn: "Zawsze aktywne",
      privacy: "Polityka prywatności",
      cookies: "Polityka cookies",
      footerManage: "Zarządzaj zgodą"
    },
    da: {
      bannerTitle: "Privatlivsindstillinger",
      bannerText:
        "Vi bruger nødvendige tekniske værktøjer og kun med dit samtykke analytics til at måle trafik og CTA-klik.",
      acceptAll: "Accepter alle",
      rejectOptional: "Afvis valgfrie",
      manage: "Administrer samtykke",
      modalTitle: "Administrer samtykke",
      save: "Gem indstillinger",
      essential: "Teknisk nødvendige",
      essentialText: "Nødvendige for at siden virker og kan huske dit valg.",
      analytics: "Analytics",
      analyticsText: "Anonym måling af trafik og CTA-klik.",
      alwaysOn: "Altid aktiv",
      privacy: "Privatlivspolitik",
      cookies: "Cookiepolitik",
      footerManage: "Administrer samtykke"
    },
    sv: {
      bannerTitle: "Sekretessinställningar",
      bannerText:
        "Vi använder nödvändiga tekniska verktyg och, endast med ditt samtycke, analytics för att mäta trafik och klick på CTA:er.",
      acceptAll: "Acceptera alla",
      rejectOptional: "Avvisa valfria",
      manage: "Hantera samtycke",
      modalTitle: "Hantera samtycke",
      save: "Spara inställningar",
      essential: "Tekniskt nödvändiga",
      essentialText: "Nödvändiga för att webbplatsen ska fungera och komma ihåg ditt val.",
      analytics: "Analytics",
      analyticsText: "Anonym mätning av trafik och klick på CTA:er.",
      alwaysOn: "Alltid aktiva",
      privacy: "Integritetspolicy",
      cookies: "Cookiepolicy",
      footerManage: "Hantera samtycke"
    }
  };

  var labels = copy[lang] || copy.en;

  function isObject(value) {
    return value && typeof value === "object";
  }

  function readConsent() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      var parsed = JSON.parse(saved);
      if (!isObject(parsed)) return null;
      return {
        analytics: parsed.analytics === true
      };
    } catch (error) {
      return null;
    }
  }

  function writeConsent(value) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          analytics: value.analytics === true,
          savedAt: new Date().toISOString()
        })
      );
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function getConsent() {
    return readConsent() || { analytics: false };
  }

  function loadGtm() {
    if (loadedGtm) return;
    loadedGtm = true;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(script);
  }

  function applyConsent() {
    var consent = getConsent();
    if (consent.analytics) loadGtm();
  }

  function consentPaths() {
    if (lang === "it") {
      return { privacy: "/privacy/", cookies: "/cookies/" };
    }
    return { privacy: "/en/privacy/", cookies: "/en/cookies/" };
  }

  function injectFooterLinks() {
    var footerContainer = document.querySelector("footer .container");
    if (!footerContainer || footerContainer.querySelector(".consent-footer-links")) return;

    var paths = consentPaths();
    var wrap = document.createElement("div");
    wrap.className = "fineprint consent-footer-links";

    var privacyLink = document.createElement("a");
    privacyLink.href = paths.privacy;
    privacyLink.textContent = labels.privacy;

    var cookiesLink = document.createElement("a");
    cookiesLink.href = paths.cookies;
    cookiesLink.textContent = labels.cookies;

    var manageButton = document.createElement("button");
    manageButton.type = "button";
    manageButton.className = "consent-link-button";
    manageButton.textContent = labels.footerManage;
    manageButton.addEventListener("click", openModal);

    wrap.appendChild(privacyLink);
    wrap.appendChild(document.createTextNode(" · "));
    wrap.appendChild(cookiesLink);
    wrap.appendChild(document.createTextNode(" · "));
    wrap.appendChild(manageButton);
    footerContainer.appendChild(wrap);
  }

  function createBanner() {
    if (document.getElementById("consent-banner")) return;
    var root = document.createElement("div");
    root.className = "consent-banner";
    root.id = "consent-banner";
    root.innerHTML =
      '<div class="consent-banner__content">' +
      '<strong>' + labels.bannerTitle + "</strong>" +
      "<p>" + labels.bannerText + "</p>" +
      "</div>" +
      '<div class="consent-banner__actions">' +
      '<button type="button" class="btn ghost" data-consent-action="reject">' + labels.rejectOptional + "</button>" +
      '<button type="button" class="btn ghost" data-consent-action="manage">' + labels.manage + "</button>" +
      '<button type="button" class="btn primary" data-consent-action="accept">' + labels.acceptAll + "</button>" +
      "</div>";
    document.body.appendChild(root);

    root.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-consent-action");
      if (!action) return;
      if (action === "accept") {
        saveConsent({ analytics: true });
      }
      if (action === "reject") {
        saveConsent({ analytics: false });
      }
      if (action === "manage") {
        openModal();
      }
    });
  }

  function createModal() {
    if (document.getElementById("consent-modal")) return;
    var modal = document.createElement("div");
    modal.className = "consent-modal";
    modal.id = "consent-modal";
    modal.setAttribute("hidden", "hidden");
    modal.innerHTML =
      '<div class="consent-modal__backdrop" data-consent-close="true"></div>' +
      '<div class="consent-modal__panel" role="dialog" aria-modal="true" aria-labelledby="consent-modal-title">' +
      '<button type="button" class="consent-modal__close" aria-label="Close" data-consent-close="true">&times;</button>' +
      '<h2 id="consent-modal-title">' + labels.modalTitle + "</h2>" +
      '<div class="consent-option consent-option--locked">' +
      "<div>" +
      "<strong>" + labels.essential + "</strong>" +
      "<p>" + labels.essentialText + "</p>" +
      "</div>" +
      '<span class="consent-pill">' + labels.alwaysOn + "</span>" +
      "</div>" +
      '<label class="consent-option">' +
      '<input type="checkbox" id="consent-analytics"/>' +
      "<div>" +
      "<strong>" + labels.analytics + "</strong>" +
      "<p>" + labels.analyticsText + "</p>" +
      "</div>" +
      "</label>" +
      '<div class="consent-modal__actions">' +
      '<button type="button" class="btn ghost" data-consent-action="reject">' + labels.rejectOptional + "</button>" +
      '<button type="button" class="btn primary" data-consent-action="save">' + labels.save + "</button>" +
      "</div>" +
      "</div>";
    document.body.appendChild(modal);

    modal.addEventListener("click", function (event) {
      var close = event.target && event.target.getAttribute("data-consent-close");
      if (close) closeModal();
      var action = event.target && event.target.getAttribute("data-consent-action");
      if (!action) return;
      if (action === "reject") {
        saveConsent({ analytics: false });
      }
      if (action === "save") {
        saveConsent({
          analytics: document.getElementById("consent-analytics").checked
        });
      }
    });
  }

  function syncModalState() {
    var consent = getConsent();
    var analytics = document.getElementById("consent-analytics");
    if (analytics) analytics.checked = consent.analytics;
  }

  function openModal() {
    var modal = document.getElementById("consent-modal");
    if (!modal) return;
    syncModalState();
    modal.removeAttribute("hidden");
    document.body.classList.add("consent-modal-open");
  }

  function closeModal() {
    var modal = document.getElementById("consent-modal");
    if (!modal) return;
    modal.setAttribute("hidden", "hidden");
    document.body.classList.remove("consent-modal-open");
  }

  function saveConsent(value) {
    writeConsent(value);
    applyConsent();
    closeModal();
    var banner = document.getElementById("consent-banner");
    if (banner) banner.remove();
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectFooterLinks();
    createModal();
    if (!readConsent()) {
      createBanner();
    } else {
      applyConsent();
    }
  });
})();
