/**
 * Brave Souls client-side cart
 * - No accounts / no payment gateway
 * - Isolated per browser via localStorage (never mixed across visitors)
 * - Checkout always redirects to contact.html and pre-fills the inquiry
 */
(function () {
  const CART_KEY = "bsw_cart_v1";
  const VISITOR_KEY = "bsw_visitor_id";

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "v-" + Date.now().toString(16) + "-" + Math.random().toString(16).slice(2);
  }

  function ensureVisitorId() {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  }

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("bsw:cart-change", { detail: { items: items } }));
  }

  function count(items) {
    return items.reduce(function (sum, item) {
      return sum + (parseInt(item.qty, 10) || 0);
    }, 0);
  }

  function formatPrice(value) {
    const n = Number(value) || 0;
    if (n <= 0) return "Quote on request";
    return n.toLocaleString("en-US") + " RWF";
  }

  function addItem(payload) {
    const items = readCart();
    const optionKey = payload.option ? String(payload.option) : "";
    const id = payload.id + (optionKey ? "::" + optionKey : "");
    const existing = items.find(function (item) {
      return item.id === id;
    });
    if (existing) {
      existing.qty = (parseInt(existing.qty, 10) || 1) + (parseInt(payload.qty, 10) || 1);
    } else {
      items.push({
        id: id,
        productId: payload.id,
        name: payload.name,
        qty: parseInt(payload.qty, 10) || 1,
        price: Number(payload.price) || 0,
        image: payload.image || "",
        option: optionKey,
      });
    }
    writeCart(items);
    return items;
  }

  function setQty(id, qty) {
    const next = Math.max(0, parseInt(qty, 10) || 0);
    let items = readCart();
    if (next <= 0) items = items.filter(function (item) { return item.id !== id; });
    else {
      items.forEach(function (item) {
        if (item.id === id) item.qty = next;
      });
    }
    writeCart(items);
  }

  function removeItem(id) {
    writeCart(readCart().filter(function (item) { return item.id !== id; }));
  }

  function inquiryText(items) {
    if (!items.length) return "";
    const lines = items.map(function (item) {
      const opt = item.option ? " (" + item.option + ")" : "";
      const price = formatPrice(item.price);
      return "- " + item.name + opt + " × " + item.qty + " — " + price;
    });
    return (
      "Shop order (visitor " + ensureVisitorId().slice(0, 8) + ")\n" +
      lines.join("\n") +
      "\nPlease confirm availability, sizes, and how I can collect or receive these items in Kigali."
    );
  }

  const WHATSAPP_NUMBER = "250788675638";

  function lineTotal(item) {
    const qty = parseInt(item.qty, 10) || 1;
    return (Number(item.price) || 0) * qty;
  }

  function whatsappMessage(items) {
    const lines = items.map(function (item, index) {
      const option = item.option ? " (" + item.option + ")" : "";
      const qty = parseInt(item.qty, 10) || 1;
      return (
        (index + 1) + ". " + item.name + option + " x" + qty +
        " (" + formatPrice(lineTotal(item)) + ")"
      );
    });
    const sum = items.reduce(function (total, item) {
      return total + lineTotal(item);
    }, 0);
    return (
      "Hello! I would like to purchase these products:\n" +
      lines.join("\n") +
      "\n\nTotal: " + formatPrice(sum) + "\n" +
      "Please let me know the payment and delivery steps!"
    );
  }

  function checkout() {
    const items = readCart();
    if (!items.length) return;
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(whatsappMessage(items));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function toast(message) {
    let el = document.getElementById("bswCartToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "bswCartToast";
      el.className = "cart-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  function render() {
    const items = readCart();
    const badge = document.getElementById("bswCartBadge");
    const list = document.getElementById("bswCartList");
    const totalEl = document.getElementById("bswCartTotal");
    const checkoutBtn = document.getElementById("bswCartCheckout");
    if (badge) {
      const n = count(items);
      badge.textContent = String(n);
      badge.classList.toggle("is-on", n > 0);
    }
    if (!list) return;
    if (!items.length) {
      list.innerHTML = '<div class="cart-empty">Your cart is empty. Open a product description and tap Order, or add merch below the shop.</div>';
      if (totalEl) totalEl.textContent = "0 RWF";
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }
    if (checkoutBtn) checkoutBtn.disabled = false;
    list.innerHTML = items.map(function (item) {
      const opt = item.option ? '<div class="cart-item-meta">' + item.option + "</div>" : "";
      const img = item.image
        ? '<img src="' + item.image + '" alt="">'
        : "<div></div>";
      return (
        '<article class="cart-item" data-id="' + item.id + '">' +
        img +
        "<div><div class=\"cart-item-name\">" + item.name + "</div>" +
        opt +
        '<div class="cart-item-meta">' + formatPrice(item.price) + "</div>" +
        '<div class="cart-qty">' +
        '<button type="button" data-cart-qty="-1" aria-label="Decrease">−</button>' +
        "<span>" + item.qty + "</span>" +
        '<button type="button" data-cart-qty="1" aria-label="Increase">+</button>' +
        "</div></div>" +
        '<button type="button" class="cart-remove" data-cart-remove>Remove</button>' +
        "</article>"
      );
    }).join("");
    const priced = items.reduce(function (sum, item) {
      return sum + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 0);
    }, 0);
    const hasQuote = items.some(function (item) { return !item.price; });
    if (totalEl) {
      totalEl.textContent = priced
        ? priced.toLocaleString("en-US") + " RWF" + (hasQuote ? " + quotes" : "")
        : "Quote on request";
    }
  }

  function openCart() {
    document.getElementById("bswCartDrawer").classList.add("open");
    document.getElementById("bswCartOverlay").classList.add("open");
    document.getElementById("bswCartBtn").setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    const drawer = document.getElementById("bswCartDrawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    document.getElementById("bswCartOverlay").classList.remove("open");
    document.getElementById("bswCartBtn").setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function mount() {
    if (document.getElementById("bswCartBtn")) {
      render();
      return;
    }
    ensureVisitorId();

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "bswCartBtn";
    btn.className = "cart-btn";
    btn.setAttribute("aria-label", "Open cart");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.6L5 4H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>' +
      '<span class="cart-badge" id="bswCartBadge">0</span>';

    const navRight = document.querySelector(".nav-right");
    const hamburger = document.querySelector(".hamburger");
    const navInner = document.querySelector(".nav-inner");
    if (navRight) {
      if (hamburger) navRight.insertBefore(btn, hamburger);
      else navRight.appendChild(btn);
    } else if (navInner) {
      navInner.appendChild(btn);
    } else {
      btn.style.position = "fixed";
      btn.style.top = "18px";
      btn.style.right = "18px";
      document.body.appendChild(btn);
    }

    const overlay = document.createElement("div");
    overlay.id = "bswCartOverlay";
    overlay.className = "cart-overlay";
    overlay.addEventListener("click", closeCart);

    const drawer = document.createElement("aside");
    drawer.id = "bswCartDrawer";
    drawer.className = "cart-drawer";
    drawer.setAttribute("aria-label", "Shopping cart");
    drawer.innerHTML =
      '<div class="cart-head"><h3>Your cart</h3><button type="button" class="cart-close" id="bswCartClose" aria-label="Close">×</button></div>' +
      '<div class="cart-body" id="bswCartList" data-lenis-prevent></div>' +
      '<div class="cart-foot">' +
      '<div class="cart-total"><span>Total</span><span id="bswCartTotal">0 RWF</span></div>' +
      '<p class="cart-note">No online payment. Checkout sends this order to our contact form so the team can confirm stock and collection in Kigali.</p>' +
      '<button type="button" class="cart-checkout" id="bswCartCheckout">Checkout</button>' +
      "</div>";

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    btn.addEventListener("click", function () {
      if (drawer.classList.contains("open")) closeCart();
      else openCart();
    });
    document.getElementById("bswCartClose").addEventListener("click", closeCart);
    document.getElementById("bswCartCheckout").addEventListener("click", checkout);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeCart();
    });

    drawer.addEventListener("click", function (e) {
      const row = e.target.closest(".cart-item");
      if (!row) return;
      const id = row.getAttribute("data-id");
      if (e.target.closest("[data-cart-remove]")) removeItem(id);
      const qtyBtn = e.target.closest("[data-cart-qty]");
      if (qtyBtn) {
        const item = readCart().find(function (entry) { return entry.id === id; });
        if (item) setQty(id, item.qty + parseInt(qtyBtn.getAttribute("data-cart-qty"), 10));
      }
    });

    document.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-add-cart]");
      if (!trigger) return;
      e.preventDefault();
      const optionInput = trigger.getAttribute("data-option-from");
      let option = trigger.getAttribute("data-option") || "";
      if (optionInput) {
        const field = document.getElementById(optionInput);
        if (field && field.value) option = field.value;
      }
      const flavourBox = trigger.closest(".shop-cat");
      if (flavourBox && flavourBox.querySelector("[data-flavour-choice]")) {
        const picked = flavourBox.querySelector("[data-flavour-choice]:checked");
        if (!picked) {
          if (!flavourBox.classList.contains("open")) {
            const toggle = flavourBox.querySelector(".shop-toggle");
            if (toggle) toggle.click();
          }
          toast("Choose a flavour in Learn more first");
          return;
        }
        option = picked.value;
      }
      addItem({
        id: trigger.getAttribute("data-id"),
        name: trigger.getAttribute("data-name"),
        price: trigger.getAttribute("data-price"),
        image: trigger.getAttribute("data-image"),
        qty: 1,
        option: option,
      });
      toast(trigger.getAttribute("data-name") + " added to cart");
      render();
    });

    document.addEventListener("bsw:cart-change", render);
    render();
  }

  function fillContactForm() {
    const items = readCart();
    if (!items.length) return;
    const params = new URLSearchParams(window.location.search);
    const dedicated = document.getElementById("contactCartItems");
    const message = document.getElementById("contactChallenge");
    const text = inquiryText(items);
    if (dedicated) {
      dedicated.value = text;
      const wrap = document.getElementById("cartInquiryWrap");
      if (wrap) wrap.hidden = false;
    }
    if (message && params.get("from") === "cart") {
      if (message.value.indexOf("Shop order") === -1) {
        message.value = text;
      }
    }
    const program = document.getElementById("contactProgram");
    if (program) {
      const opt = Array.from(program.options).find(function (o) {
        return /shop|merch|product/i.test(o.value || o.textContent);
      });
      if (opt) program.value = opt.value || opt.textContent;
    }
    const chips = document.querySelectorAll(".interest-chips .chip");
    chips.forEach(function (chip) {
      if (/shop|merch/i.test(chip.textContent || "")) chip.classList.add("selected", "on", "active");
    });
  }

  window.BSWCart = {
    addItem: addItem,
    read: readCart,
    checkout: checkout,
    inquiryText: inquiryText,
    open: function () { openCart(); },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      mount();
      fillContactForm();
    });
  } else {
    mount();
    fillContactForm();
  }
})();
