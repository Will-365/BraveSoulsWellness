(function () {
  const STORAGE_KEY = "bs_preferred_lang";
  const LANGUAGES = [
    { locale: "en", goog: "en", flag: "🇺🇸", label: "English" },
    { locale: "rw", goog: "rw", flag: "🇷🇼", label: "Kinyarwanda" },
    { locale: "sw", goog: "sw", flag: "🇹🇿", label: "Kiswahili" },
    { locale: "de", goog: "de", flag: "🇩🇪", label: "Deutsch" },
    { locale: "zh", goog: "zh-CN", flag: "🇨🇳", label: "中文" },
  ];

  function currentLocale() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((item) => item.locale === saved) ? saved : "en";
  }

  function byLocale(locale) {
    return LANGUAGES.find((item) => item.locale === locale) || LANGUAGES[0];
  }

  function writeCookie(name, value) {
    const expires = "expires=Fri, 31 Dec 9999 23:59:59 GMT";
    document.cookie = name + "=" + value + "; path=/; " + expires;
    const host = location.hostname;
    if (host && host !== "localhost") {
      document.cookie =
        name + "=" + value + "; path=/; domain=." + host + "; " + expires;
    }
  }

  function clearCookie(name) {
    const past = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = name + "=; path=/; " + past;
    const host = location.hostname;
    if (host && host !== "localhost") {
      document.cookie = name + "=; path=/; domain=." + host + "; " + past;
    }
  }

  function persistLocale(locale) {
    const lang = byLocale(locale);
    localStorage.setItem(STORAGE_KEY, lang.locale);
    document.documentElement.lang = lang.locale === "zh" ? "zh-CN" : lang.locale;
    if (lang.locale === "en") {
      clearCookie("googtrans");
      writeCookie("googtrans", "/en/en");
    } else {
      writeCookie("googtrans", "/en/" + lang.goog);
    }
  }

  persistLocale(currentLocale());

  function waitForCombo(callback, attempt) {
    const combo = document.querySelector("select.goog-te-combo");
    if (combo) {
      callback(combo);
      return;
    }
    if (attempt > 50) return;
    setTimeout(function () {
      waitForCombo(callback, (attempt || 0) + 1);
    }, 120);
  }

  function applyGoogleLanguage(locale) {
    const lang = byLocale(locale);
    persistLocale(lang.locale);
    waitForCombo(function (combo) {
      const value = lang.locale === "en" ? "en" : lang.goog;
      if (combo.value === value) return;
      combo.value = value;
      combo.dispatchEvent(new Event("change"));
    });
  }

  function syncButton(root, locale) {
    const lang = byLocale(locale);
    const flag = root.querySelector(".lang-switcher-flag");
    const code = root.querySelector(".lang-switcher-code");
    const btn = root.querySelector(".lang-switcher-btn");
    if (flag) flag.textContent = lang.flag;
    if (code) code.textContent = lang.locale.toUpperCase();
    if (btn) btn.setAttribute("aria-label", "Language: " + lang.label);
    root.querySelectorAll(".lang-switcher-option").forEach(function (option) {
      option.classList.toggle("is-active", option.dataset.locale === lang.locale);
      option.setAttribute("aria-selected", option.dataset.locale === lang.locale ? "true" : "false");
    });
  }

  function closeSwitcher(root) {
    root.classList.remove("open");
    const btn = root.querySelector(".lang-switcher-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function openSwitcher(root) {
    root.classList.add("open");
    const btn = root.querySelector(".lang-switcher-btn");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  function buildSwitcher() {
    const selected = byLocale(currentLocale());
    const wrap = document.createElement("div");
    wrap.className = "lang-switcher notranslate";
    wrap.setAttribute("translate", "no");
    wrap.innerHTML =
      '<button type="button" class="lang-switcher-btn" aria-haspopup="listbox" aria-expanded="false">' +
      '<span class="lang-switcher-flag" aria-hidden="true">' + selected.flag + "</span>" +
      '<span class="lang-switcher-code">' + selected.locale.toUpperCase() + "</span>" +
      '<span class="lang-switcher-caret" aria-hidden="true">▾</span>' +
      "</button>" +
      '<div class="lang-switcher-menu" role="listbox" aria-label="Select language">' +
      LANGUAGES.map(function (lang) {
        const active = lang.locale === selected.locale ? " is-active" : "";
        return (
          '<button type="button" class="lang-switcher-option' + active +
          '" role="option" data-locale="' + lang.locale +
          '" aria-selected="' + (lang.locale === selected.locale) + '">' +
          '<span aria-hidden="true">' + lang.flag + "</span><span>" + lang.label + "</span></button>"
        );
      }).join("") +
      "</div>";
    return wrap;
  }

  function bindSwitcher(root) {
    const btn = root.querySelector(".lang-switcher-btn");
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      if (root.classList.contains("open")) closeSwitcher(root);
      else {
        document.querySelectorAll(".lang-switcher.open").forEach(function (openRoot) {
          closeSwitcher(openRoot);
        });
        openSwitcher(root);
      }
    });
    root.querySelectorAll(".lang-switcher-option").forEach(function (option) {
      option.addEventListener("click", function (event) {
        event.stopPropagation();
        const locale = option.dataset.locale;
        applyGoogleLanguage(locale);
        document.querySelectorAll(".lang-switcher").forEach(function (item) {
          syncButton(item, locale);
          closeSwitcher(item);
        });
        if (locale === "en" && document.querySelector("html.translated-ltr, html.translated-rtl")) {
          location.reload();
        }
      });
    });
  }

  function mountSwitcher() {
    if (document.querySelector(".lang-switcher")) return;
    const switcher = buildSwitcher();
    const navRight = document.querySelector(".nav-right");
    const hamburger = document.querySelector(".hamburger");
    const navInner = document.querySelector(".nav-inner");
    const compactNav = document.querySelector(".ni");

    function attachWithCta(parent, cta) {
      const group = document.createElement("div");
      group.className = "lang-switcher-cluster notranslate";
      group.style.cssText = "display:flex;align-items:center;gap:10px;flex-shrink:0;";
      parent.insertBefore(group, cta);
      group.appendChild(switcher);
      group.appendChild(cta);
    }

    if (navRight) {
      if (hamburger) navRight.insertBefore(switcher, hamburger);
      else navRight.appendChild(switcher);
    } else if (navInner) {
      const cta = navInner.querySelector("a.btn, a.nav-cta-desk, a[href='#apply']");
      if (cta) attachWithCta(navInner, cta);
      else navInner.appendChild(switcher);
    } else if (compactNav) {
      const cta = compactNav.querySelector("a.n-cta, a.ncta, a[href='#apply']");
      if (cta) attachWithCta(compactNav, cta);
      else compactNav.appendChild(switcher);
    } else {
      return;
    }

    bindSwitcher(switcher);
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".lang-switcher")) closeSwitcher(switcher);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSwitcher(switcher);
    });
  }

  function injectTranslateHost() {
    if (document.getElementById("google_translate_element")) return;
    const host = document.createElement("div");
    host.id = "google_translate_element";
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);
  }

  window.googleTranslateElementInit = function () {
    if (!window.google || !google.translate) return;
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,rw,sw,de,zh-CN",
        autoDisplay: false,
      },
      "google_translate_element",
    );
    const locale = currentLocale();
    if (locale !== "en") applyGoogleLanguage(locale);
  };

  function loadGoogleTranslate() {
    if (document.getElementById("bs-google-translate")) return;
    const script = document.createElement("script");
    script.id = "bs-google-translate";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }

  function start() {
    injectTranslateHost();
    mountSwitcher();
    loadGoogleTranslate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
