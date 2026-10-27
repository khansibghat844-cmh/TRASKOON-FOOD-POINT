
const WHATSAPP_NUMBER = "923348807634";

const money = n => `Rs. ${Number(n).toLocaleString("en-PK")}`;

let db;
let products = [];
let cart = [];
let activeCategory = "All";

const $ = id => document.getElementById(id);
const grid = $("menuGrid");
const cartPanel = $("cartPanel");
const backdrop = $("cartBackdrop");

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

function showMenuMessage(message) {
  grid.innerHTML = `<p class="menu-message">${safe(message)}</p>`;
}

async function loadProducts() {
  showMenuMessage("Loading menu...");

  if (!window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY ||
      !window.supabase) {
    showMenuMessage("Menu setup error. Please contact the shop.");
    return;
  }

  db = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_PUBLISHABLE_KEY
  );

  const { data, error } = await db
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Menu loading error:", error);
    showMenuMessage("Menu could not load. Please refresh the page.");
    return;
  }

  products = (data || []).map(p => ({
    id: String(p.id),
    name: p.name || "Menu item",
    price: p.price_pkr == null ? null : Number(p.price_pkr),
    category: p.category || "Sides",
    image: p.image_url || "",
    description: p.description || "",
    available: p.is_available !== false
  }));

  renderProducts();
  renderCart();
}

function renderProducts() {
  const shown = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  if (!shown.length) {
    showMenuMessage("No products found in this category.");
    return;
  }

  grid.innerHTML = shown.map(p => `
    <article class="food-card">
      <div class="food-photo">
        ${p.image
          ? `<img src="${safe(p.image)}"
                  alt="${safe(p.name)}"
                  loading="lazy"
                  decoding="async"
                  onerror="this.style.display='none'">`
          : `<span class="emoji" aria-hidden="true">🍽️</span>`}
        <span class="photo-label">${safe(p.category.toUpperCase())}</span>
      </div>
      <div class="food-info">
        <h3>${safe(p.name)}</h3>
        <p>${safe(p.description)}</p>
        <div class="food-bottom">
          <span class="price">
            ${p.price == null ? "Price not set" : money(p.price)}
          </span>
          <button class="add-btn"
            data-add="${safe(p.id)}"
            ${!p.available || p.price == null ? "disabled" : ""}>
            ${!p.available ? "Unavailable"
              : p.price == null ? "Price not set" : "Add to order +"}
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function openCart() {
  document.body.classList.add("cart-opened");
  cartPanel.setAttribute("aria-hidden", "false");
  renderCart();
}

function closeCart() {
  document.body.classList.remove("cart-opened");
  cartPanel.setAttribute("aria-hidden", "true");
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p || !p.available || p.price == null) return;

  const found = cart.find(x => x.id === id);
  if (found) {
    found.qty++;
  } else {
    cart.push({ ...p, qty: 1 });
  }

  renderCart();
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(x => x.id !== id);
  }
  renderCart();
}

function renderCart() {
  $("cartCount").textContent =
    cart.reduce((sum, item) => sum + item.qty, 0);

  const container = $("cartItems");

  if (!cart.length) {
    container.innerHTML =
      '<p class="empty-cart">Your order is empty. Add something tasty from the menu.</p>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <h4>${safe(item.name)}</h4>
          <small>${money(item.price)} each</small>
          <div class="cart-controls">
            <button data-qty="${safe(item.id)}" data-delta="-1"
              aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-qty="${safe(item.id)}" data-delta="1"
              aria-label="Increase quantity">+</button>
          </div>
        </div>
        <span class="cart-item-price">${money(item.price * item.qty)}</span>
      </div>
    `).join("");
  }

  $("cartTotal").textContent =
    money(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
}

grid.addEventListener("click", e => {
  const button = e.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

$("cartItems").addEventListener("click", e => {
  const button = e.target.closest("[data-qty]");
  if (button) {
    changeQty(button.dataset.qty, Number(button.dataset.delta));
  }
});

$("categories").addEventListener("click", e => {
  const button = e.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;
  document.querySelectorAll(".category").forEach(item =>
    item.classList.toggle("active", item === button)
  );
  renderProducts();
});

$("cartOpen").addEventListener("click", openCart);
$("cartClose").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeCart();
});

const orderType = $("orderType");
const address = $("customerAddress");
const addressLabel = $("addressLabel");

function updateAddressRequirement() {
  const delivery = orderType.value === "Delivery";
  address.required = delivery;
  addressLabel.style.display = delivery ? "grid" : "none";
}

orderType.addEventListener("change", updateAddressRequirement);

$("orderForm").addEventListener("submit", e => {
  e.preventDefault();

  const errorMessage = $("formError");
  errorMessage.textContent = "";

  if (!cart.length) {
    errorMessage.textContent = "Please add at least one item to your order.";
    return;
  }

  const name = $("customerName").value.trim();
  const phone = $("customerPhone").value.trim();
  const type = orderType.value;
  const addr = address.value.trim();
  const payment = $("paymentMethod").value;

  if (!name || !phone || (type === "Delivery" && !addr)) {
    errorMessage.textContent = "Please complete all required customer details.";
    return;
  }

  const lines = cart.map(item =>
    `- ${item.name} x${item.qty} = ${money(item.price * item.qty)}`
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty, 0
  );

  const message = [
    "Assalam-o-Alaikum, TRASKOON FOOD POINT!",
    "I would like to place an order:",
    "",
    ...lines,
    "",
    `Subtotal: ${money(total)}`,
    `Order type: ${type}`,
    `Customer name: ${name}`,
    `Phone: ${phone}`,
    ...(type === "Delivery" ? [`Delivery address: ${addr}`] : []),
    `Payment method: ${payment}`,
    "",
    "Please confirm availability and delivery details."
  ].join("\n");

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
});

$("year").textContent = new Date().getFullYear();
updateAddressRequirement();
loadProducts();
