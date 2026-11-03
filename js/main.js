const PRODUCTS = [
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    price: 129990,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    specs: ["6,3\" Super Retina XDR", "A18 Pro, 256 ГБ", "Камера 48 Мп"]
  },
  {
    id: "galaxy-s25-ultra",
    name: "Samsung Galaxy S25 Ultra",
    price: 119990,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    specs: ["6,8\" Dynamic AMOLED", "Snapdragon 8 Elite", "S Pen в комплекте"]
  },
  {
    id: "pixel-9-pro",
    name: "Google Pixel 9 Pro",
    price: 94990,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    specs: ["6,3\" LTPO OLED", "Google Tensor G4", "Магия Pixel Camera"]
  },
  {
    id: "xiaomi-15-ultra",
    name: "Xiaomi 15 Ultra",
    price: 89990,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    specs: ["6,73\" AMOLED 120 Гц", "Leica оптика", "Зарядка 90 Вт"]
  }
];

const CART_KEY = "smartbuy-cart";
const USER_KEY = "smartbuy-user";
const MAX_QUANTITY = 99;
const productById = new Map(PRODUCTS.map((product) => [product.id, product]));

const cartOpenBtn = document.getElementById("cart-open");
const cartDrawer = document.getElementById("cart-drawer");
const cartItemsEl = document.getElementById("cart-items");
const cartBadge = document.getElementById("cart-badge");
const cartTotal = document.getElementById("cart-total");
const cartFooter = document.getElementById("cart-footer");
const checkoutBtn = document.getElementById("checkout-btn");
const catalogGrid = document.getElementById("catalog-grid");
const loginOpenBtn = document.getElementById("login-open");
const loginModal = document.getElementById("login-modal");
const loginForm = document.getElementById("login-form");
const loginFormView = document.getElementById("login-form-view");
const loginSuccessView = document.getElementById("login-success-view");
const loginUser = document.getElementById("login-user");
const logoutBtn = document.getElementById("logout-btn");
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");
const toastEl = document.getElementById("toast");
const contactForm = document.getElementById("contact-form");

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    showToast("Браузер запретил сохранение данных. Изменения не сохранятся после перезагрузки.");
    return false;
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    showToast("Не удалось очистить сохранённые данные браузера.");
  }
}

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];

  const quantities = new Map();
  value.forEach((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string") return;
    if (!productById.has(item.id)) return;

    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1) return;
    quantities.set(item.id, Math.min(MAX_QUANTITY, (quantities.get(item.id) || 0) + qty));
  });

  return Array.from(quantities, ([id, qty]) => ({ id, qty }));
}

function loadCart() {
  try {
    const stored = storageGet(CART_KEY);
    return stored ? normalizeCart(JSON.parse(stored)) : [];
  } catch (error) {
    return [];
  }
}

let cart = loadCart();
let user = storageGet(USER_KEY);
if (typeof user !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) user = null;

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function saveCart() {
  storageSet(CART_KEY, JSON.stringify(cart));
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("is-show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toastEl.classList.remove("is-show"), 3000);
}

function renderCatalog() {
  catalogGrid.innerHTML = PRODUCTS.map((product) => `
    <article class="card reveal">
      <div class="card__media">
        <img src="${product.image}" alt="${product.name}" width="400" height="240" loading="lazy">
      </div>
      <div class="card__body">
        <h3>${product.name}</h3>
        <ul class="card__specs">
          ${product.specs.map((spec) => `<li>${spec}</li>`).join("")}
        </ul>
        <div class="card__price">${formatPrice(product.price)}</div>
        <button class="btn btn--primary" type="button" data-add="${product.id}">В корзину</button>
      </div>
    </article>
  `).join("");
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartSum() {
  return cart.reduce((sum, item) => {
    const product = productById.get(item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

function renderCart() {
  cart = normalizeCart(cart);
  const count = cartCount();
  cartBadge.hidden = count === 0;
  cartBadge.textContent = String(count);

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Корзина пуста. Добавьте смартфон из каталога.</p>';
    cartFooter.hidden = true;
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartFooter.hidden = false;
  cartItemsEl.innerHTML = cart.map((item) => {
    const product = productById.get(item.id);
    if (!product) return "";
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div>
          <strong>${product.name}</strong>
          <div>${formatPrice(product.price)}</div>
          <div class="qty">
            <button type="button" data-qty="${product.id}" data-delta="-1" aria-label="Уменьшить количество">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty="${product.id}" data-delta="1" aria-label="Увеличить количество" ${item.qty >= MAX_QUANTITY ? "disabled" : ""}>+</button>
          </div>
        </div>
        <button class="remove" type="button" data-remove="${product.id}" aria-label="Удалить ${product.name}">Удалить</button>
      </div>
    `;
  }).join("");
  cartTotal.textContent = formatPrice(cartSum());
}

function addToCart(id) {
  if (!productById.has(id)) return;
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    if (existing.qty >= MAX_QUANTITY) {
      showToast(`Максимум ${MAX_QUANTITY} шт. одного товара.`);
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast("Товар добавлен в корзину");
}

function changeQty(id, delta) {
  if (!Number.isInteger(delta) || !productById.has(id)) return;
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty = Math.min(MAX_QUANTITY, item.qty + delta);
  if (item.qty < 1) cart = cart.filter((entry) => entry.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  if (!productById.has(id)) return;
  cart = cart.filter((entry) => entry.id !== id);
  saveCart();
  renderCart();
  showToast("Товар удалён");
}

let previouslyFocused = null;

function setOpen(element, open) {
  if (!element) return;
  if (open) {
    previouslyFocused = document.activeElement;
    element.classList.add("is-open");
    element.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstControl = element.querySelector("button, input, a[href], [tabindex]:not([tabindex="-1"])");
    window.requestAnimationFrame(() => firstControl?.focus());
  } else {
    element.classList.remove("is-open");
    element.setAttribute("aria-hidden", "true");
    document.body.style.overflow = document.body.classList.contains("menu-open") ? "hidden" : "";
    if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
    previouslyFocused = null;
  }
}

function updateLoginView() {
  if (user) {
    loginFormView.hidden = true;
    loginSuccessView.hidden = false;
    loginUser.textContent = "Вы вошли как " + user;
    loginOpenBtn.textContent = "Аккаунт";
  } else {
    loginFormView.hidden = false;
    loginSuccessView.hidden = true;
    loginOpenBtn.textContent = "Войти";
  }
}

catalogGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

cartItemsEl.addEventListener("click", (event) => {
  const qtyBtn = event.target.closest("[data-qty]");
  const removeBtn = event.target.closest("[data-remove]");
  if (qtyBtn) changeQty(qtyBtn.dataset.qty, Number(qtyBtn.dataset.delta));
  if (removeBtn) removeFromCart(removeBtn.dataset.remove);
});

cartOpenBtn.addEventListener("click", () => setOpen(cartDrawer, true));

document.querySelectorAll("[data-close]").forEach((node) => {
  node.addEventListener("click", () => {
    if (node.dataset.close === "cart") setOpen(cartDrawer, false);
    if (node.dataset.close === "login") setOpen(loginModal, false);
  });
});

checkoutBtn.addEventListener("click", () => {
  if (!cart.length) return;
  showToast("Это демонстрационный магазин. Заказ не создан, корзина сохранена.");
});

loginOpenBtn.addEventListener("click", () => setOpen(loginModal, true));

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = String(data.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Введите корректный email.");
    return;
  }
  user = email;
  storageSet(USER_KEY, user);
  updateLoginView();
  setOpen(loginModal, false);
  showToast("Демо-вход выполнен. Реальной авторизации нет.");
});

logoutBtn.addEventListener("click", () => {
  user = null;
  storageRemove(USER_KEY);
  loginForm.reset();
  updateLoginView();
  setOpen(loginModal, false);
  showToast("Вы вышли из демо-аккаунта.");
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Это демонстрационная форма. Сообщение не отправлено.");
});

document.querySelectorAll("[data-social]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(`Ссылка на ${button.dataset.social} пока не настроена.`);
  });
});

menuToggle.addEventListener("click", () => {
  const open = !document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
});

document.addEventListener("keydown", (event) => {
  const activeDialog = document.querySelector(".drawer.is-open, .modal.is-open");
  if (event.key === "Tab" && activeDialog) {
    const focusable = [...activeDialog.querySelectorAll("button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])")]
      .filter((element) => element.offsetParent !== null);
    if (focusable.length) {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  if (event.key === "Escape") {
    setOpen(cartDrawer, false);
    setOpen(loginModal, false);
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
});

renderCatalog();
renderCart();
updateLoginView();
