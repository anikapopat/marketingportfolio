/* Anika Popat — Portfolio
   Small, dependency-free enhancements: overlay menu,
   work filters, copy-email button, footer year. */
(function () {
  "use strict";

  /* ---------- Overlay menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("site-menu");

  if (toggle && menu) {
    var label = toggle.querySelector("[data-label]");
    var outside = document.querySelectorAll("main, .site-footer, .skip-link");
    var homeLink = document.querySelector(".site-header__mark");

    var focusables = function () {
      // Name (home link) → Close button → menu links, so the name stays reachable
      return (homeLink ? [homeLink] : []).concat([toggle], Array.prototype.slice.call(menu.querySelectorAll("a[href]")));
    };

    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Close" : "Menu";
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
      // Everything behind the overlay becomes unreachable while it's open
      outside.forEach(function (el) {
        if (open) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
      });
      if (open) {
        var first = menu.querySelector(".menu__link");
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", function (e) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        // Keep focus cycling between the Close button and menu links
        var items = focusables();
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- Fit big display names to the full width ----------
     CSS sets a close-enough size; this nudges each .hero__name so it runs
     exactly edge to edge whatever the font metrics turn out to be. */
  var bigNames = document.querySelectorAll(".hero__name");
  if (bigNames.length) {
    // Measure the actual text (a Range), not element boxes, which are full width
    var textWidth = function (node) {
      var r = document.createRange();
      r.selectNodeContents(node);
      return r.getBoundingClientRect().width;
    };
    var fitOne = function (el) {
      el.style.fontSize = "";
      // --fit (set in CSS) = share of the width to fill; defaults to all of it
      var fitShare = parseFloat(getComputedStyle(el).getPropertyValue("--fit")) || 1;
      var avail = el.clientWidth * fitShare;
      var spans = el.querySelectorAll("span");
      var widest = 0;
      if (!spans.length || getComputedStyle(spans[0]).display === "inline") {
        widest = textWidth(el);                  // one line → whole thing
      } else {
        spans.forEach(function (s) {             // stacked → widest word
          widest = Math.max(widest, textWidth(s));
        });
      }
      if (!widest || !avail) return;
      var size = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = Math.min(size * (avail / widest) * 0.99, size * 1.3) + "px";
    };
    var raf;
    var schedule = function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { bigNames.forEach(fitOne); });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    else schedule();
    window.addEventListener("resize", schedule);
  }

  /* ---------- Scroll reveal ----------
     Text and images below the fold fade up as they scroll into view.
     Anything already on screen at load is left alone (no flash), and the
     effect is skipped entirely for visitors who prefer reduced motion. */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    var revealSel = [
      ".section-head", ".page-title", ".page-intro__note", ".contact-lede",
      ".hero__intro", ".hero__bar", ".stats__list > div", ".strip__item", ".case",
      ".cta__line", ".cta .rule-link", ".about-body > *", ".facts > *", ".skills > div",
      ".contact-row", ".cs-summary", ".cs-facts > div", ".cs-results > div",
      ".cs-label", ".cs-section__body", ".grid4 > *", ".steps li", ".cs-band__art", ".cs-next", ".bubble"
    ].join(",");
    var pending = [];
    document.querySelectorAll(revealSel).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      // Items side by side arrive one after another (0, 90, 180, 270ms…)
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--reveal-delay", (i % 4) * 90 + "ms");
      el.classList.add("reveal");
      pending.push(el);
    });
    // Reveal anything whose top has scrolled into the lower ~92% of the screen
    var ticking = false;
    var check = function () {
      ticking = false;
      var line = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < line) {
          el.classList.add("is-in");
          return false;
        }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    };
    if (pending.length) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }
  }

  /* ---------- Work filters ---------- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll("[data-filter]");
    var cases = document.querySelectorAll("[data-category]");
    var status = document.getElementById("filter-status");
    var empty = document.querySelector(".work-empty");

    // Count items per category so the pills show real numbers
    buttons.forEach(function (btn) {
      var key = btn.getAttribute("data-filter");
      var n = key === "all" ? cases.length
        : document.querySelectorAll('[data-category~="' + key + '"]').length;
      var count = btn.querySelector(".filter__count");
      if (count) count.textContent = n;
      btn.hidden = n === 0;               // no projects in this category yet
    });

    var apply = function (key, updateHash) {
      var shown = 0;
      cases.forEach(function (el) {
        var cats = (el.getAttribute("data-category") || "").split(/\s+/);
        var match = key === "all" || cats.indexOf(key) !== -1;
        el.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === key));
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) {
        status.textContent = "Showing " + shown + " case stud" + (shown === 1 ? "y" : "ies");
      }
      if (updateHash && history.replaceState) {
        history.replaceState(null, "", key === "all" ? location.pathname : "#" + key);
      }
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.getAttribute("data-filter"), true);
      });
    });

    // Allow deep links like work.html#influencer
    var fromHash = location.hash.replace("#", "");
    if (fromHash && filterBar.querySelector('[data-filter="' + fromHash + '"]')) {
      apply(fromHash, false);
    }
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var original = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = original; }, 1800);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done, function () {});
      }
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
