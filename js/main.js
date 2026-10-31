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

let cart = loadCart();
let user = localStorage.getItem("smartbuy-user");

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("smartbuy-cart")) || [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("smartbuy-cart", JSON.stringify(cart));
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("is-show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toastEl.classList.remove("is-show");
  }, 2400);
}

function renderCatalog() {
  catalogGrid.innerHTML = PRODUCTS.map((product) => `
    <article class="card reveal">
      <div class="card__media">
        <img src="${product.image}" alt="${product.name}" width="400" height="240">
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
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return sum + product.price * item.qty;
  }, 0);
}

function renderCart() {
  const count = cartCount();
  cartBadge.hidden = count === 0;
  cartBadge.textContent = String(count);

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Корзина пуста. Добавьте смартфон из каталога.</p>';
    cartFooter.hidden = true;
    return;
  }

  cartFooter.hidden = false;
  cartItemsEl.innerHTML = cart.map((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <strong>${product.name}</strong>
          <div>${formatPrice(product.price)}</div>
          <div class="qty">
            <button type="button" data-qty="${product.id}" data-delta="-1" aria-label="Уменьшить количество">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty="${product.id}" data-delta="1" aria-label="Увеличить количество">+</button>
          </div>
        </div>
        <button class="remove" type="button" data-remove="${product.id}" aria-label="Удалить ${product.name}">Удалить</button>
      </div>
    `;
  }).join("");
  cartTotal.textContent = formatPrice(cartSum());
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast("Товар добавлен в корзину");
}

function changeQty(id, delta) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) {
    cart = cart.filter((entry) => entry.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((entry) => entry.id !== id);
  saveCart();
  renderCart();
  showToast("Товар удалён");
}

function setOpen(element, open) {
  element.classList.toggle("is-open", open);
  element.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open || document.body.classList.contains("menu-open") ? "hidden" : "";
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
  if (!button) return;
  addToCart(button.dataset.add);
});

cartItemsEl.addEventListener("click", (event) => {
  const qtyBtn = event.target.closest("[data-qty]");
  const removeBtn = event.target.closest("[data-remove]");
  if (qtyBtn) {
    changeQty(qtyBtn.dataset.qty, Number(qtyBtn.dataset.delta));
  }
  if (removeBtn) {
    removeFromCart(removeBtn.dataset.remove);
  }
});

cartOpenBtn.addEventListener("click", () => setOpen(cartDrawer, true));

document.querySelectorAll("[data-close]").forEach((node) => {
  node.addEventListener("click", () => {
    const target = node.dataset.close;
    if (target === "cart") setOpen(cartDrawer, false);
    if (target === "login") setOpen(loginModal, false);
  });
});

checkoutBtn.addEventListener("click", () => {
  if (!cart.length) return;
  cart = [];
  saveCart();
  renderCart();
  setOpen(cartDrawer, false);
  showToast("Заказ оформлен. Это демонстрационный магазин.");
});

loginOpenBtn.addEventListener("click", () => setOpen(loginModal, true));

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  user = String(data.get("email"));
  localStorage.setItem("smartbuy-user", user);
  updateLoginView();
  showToast("Вход выполнен");
});

logoutBtn.addEventListener("click", () => {
  user = null;
  localStorage.removeItem("smartbuy-user");
  loginForm.reset();
  updateLoginView();
  showToast("Вы вышли из аккаунта");
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  contactForm.reset();
  showToast("Сообщение отправлено. Это демо-форма.");
});

document.querySelectorAll("[data-social]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast("Демо-ссылка: " + button.dataset.social);
  });
});

menuToggle.addEventListener("click", () => {
  const open = !document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setOpen(cartDrawer, false);
    setOpen(loginModal, false);
    document.body.classList.remove("menu-open");
  }
});

renderCatalog();
renderCart();
updateLoginView();
