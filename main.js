const ACTIVE_CLASS = "active";

if (typeof window === "undefined") {
  const http = require("http");
  const fs = require("fs");
  const path = require("path");

  const root = process.cwd();
  const port = Number(process.env.PORT || 4173);

  const contentTypes = {
    ".html": "text/html; charset=UTF-8",
    ".js": "text/javascript; charset=UTF-8",
    ".css": "text/css; charset=UTF-8",
    ".json": "application/json; charset=UTF-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=UTF-8",
  };

  const resolvePath = (urlPath) => {
    const clean = decodeURIComponent(urlPath.split("?")[0]);
    if (clean === "/" || clean === "") return path.join(root, "index.html");

    const direct = path.join(root, clean);
    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;

    const htmlPath = `${direct}.html`;
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) return htmlPath;

    return path.join(root, "index.html");
  };

  http
    .createServer((req, res) => {
      const filePath = resolvePath(req.url || "/");
      const ext = path.extname(filePath).toLowerCase();
      const type = contentTypes[ext] || "application/octet-stream";

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=UTF-8" });
          res.end("Server error");
          return;
        }
        res.writeHead(200, { "Content-Type": type });
        res.end(data);
      });
    })
    .listen(port, () => {
      console.log(`Buildana site running at http://localhost:${port}`);
    });
}

function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === page) {
      link.classList.add(ACTIVE_CLASS);
      link.setAttribute("aria-current", "page");
    }
  });
}

function setupMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".mobile-panel a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupFaq() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;
    button.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  });

  const faqSearch = document.querySelector("[data-faq-search]");
  if (!faqSearch) return;

  faqSearch.addEventListener("input", () => {
    const query = faqSearch.value.trim().toLowerCase();
    faqItems.forEach((item) => {
      const text = item.textContent?.toLowerCase() ?? "";
      const match = !query || text.includes(query);
      item.hidden = !match;
    });
  });
}

function setupForms() {
  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    const success = form.querySelector("[data-form-success]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const endpoint = form.dataset.apiEndpoint;

      if (!endpoint) {
        if (success) {
          success.hidden = false;
          success.textContent = "Thanks! A Buildana consultant will reach out within one business day.";
        }
        form.reset();
        return;
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Unable to send message right now.");
          }
          return response.json();
        })
        .then(() => {
          if (success) {
            success.hidden = false;
            success.textContent = "Thanks! Your message has been sent.";
          }
          form.reset();
        })
        .catch((error) => {
          if (success) {
            success.hidden = false;
            success.textContent = error.message;
          }
        });
    });
  });
}

function setupDynamicContent() {
  const container = document.querySelector("[data-dynamic-grid]");
  if (!container) return;

  const filters = document.querySelectorAll("[data-dynamic-filter]");
  const cards = Array.from(container.querySelectorAll("[data-category]"));

  if (!filters.length || !cards.length) return;

  const applyFilter = (value) => {
    cards.forEach((card) => {
      const category = card.getAttribute("data-category");
      const visible = value === "all" || category === value;
      card.hidden = !visible;
    });
  };

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      filters.forEach((btn) => btn.classList.remove(ACTIVE_CLASS));
      filter.classList.add(ACTIVE_CLASS);
      applyFilter(filter.getAttribute("data-dynamic-filter") ?? "all");
    });
  });
}

function setupExitIntent() {
  const popup = document.querySelector("[data-exit-popup]");
  if (!popup) return;

  let shown = false;
  const showPopup = () => {
    if (shown) return;
    shown = true;
    popup.hidden = false;
    document.body.classList.add("exit-open");
  };

  document.addEventListener("mouseout", (event) => {
    if (shown) return;
    if (event.clientY > 0) return;
    showPopup();
  });

  popup.querySelectorAll("[data-exit-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      popup.hidden = true;
      document.body.classList.remove("exit-open");
    });
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {
    // Non-blocking in this static environment.
  });
}

function sendAnalyticsPageView() {
  if (!window.fetch) return;
  fetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: window.location.pathname,
      referrer: document.referrer || null,
    }),
  }).catch(() => {
    // Analytics is best-effort.
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    setupMobileNav();
    setupFaq();
    setupForms();
    setupDynamicContent();
    setupExitIntent();
    registerServiceWorker();
    sendAnalyticsPageView();
  });
}
