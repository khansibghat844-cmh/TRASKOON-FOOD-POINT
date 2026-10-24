const WHATSAPP_NUMBER = "923348807634";
const money = n => `Rs. ${Number(n).toLocaleString("en-PK")}`;

// Prices are based on the supplied menu. No unknown prices are guessed.
const products = [
  {id:"chicken-burger",name:"Chicken Burger",price:170,category:"Burgers",emoji:"🍔",image:"assets/chicken-burger.webp",description:"A classic chicken burger, freshly prepared."},
  {id:"anda-shami",name:"Anda Shami Burger",price:120,category:"Burgers",emoji:"🍔",image:"assets/shami-burger.webp",description:"Shami burger with egg."},
  {id:"special-anda",name:"Special Anda Burger",price:100,category:"Burgers",emoji:"🍳",image:"assets/special-anda.webp",description:"Special egg burger."},
  {id:"shawarma",name:"Shawarma",price:170,category:"Shawarma",emoji:"🌯",image:"assets/shawarma.webp",description:"Freshly prepared shawarma."},
  {id:"zinger-burger",name:"Zinger Burger",price:250,category:"Burgers",emoji:"🍔",image:"assets/zinger-burger.webp",description:"Crunchy zinger-style chicken burger."},
  {id:"afghani-simple",name:"Simple Single Afghani",price:130,category:"Shawarma",emoji:"🌯",image:"assets/afghani-simple.webp",description:"Simple single Afghani roll."},
  {id:"afghani-chicken",name:"Single Chicken Afghani",price:180,category:"Shawarma",emoji:"🌯",image:"assets/chicken-afghani.webp",description:"Single chicken Afghani roll."},
  {id:"afghani-double",name:"Double Chicken Afghani",price:250,category:"Shawarma",emoji:"🌯",image:"assets/afghani-double.webp",description:"Double chicken Afghani roll."},
  {id:"zinger-pieces",name:"Special Zinger Pieces",price:80,category:"Sides",emoji:"🍗",image:"assets/zinger-burger.webp",description:"Special zinger pieces. Confirm serving quantity when ordering."},
  {id:"boiled-egg",name:"Boiled Egg",price:50,category:"Sides",emoji:"🥚",image:"assets/boiled-egg.webp",description:"Price is per egg."},
  {id:"fries-50",name:"French Fries — Rs. 50",price:50,category:"Sides",emoji:"🍟",image:"assets/fries-small.webp",description:"Choose this fries price option."},
  {id:"fries-100",name:"French Fries — Rs. 100",price:100,category:"Sides",emoji:"🍟",image:"assets/fries-small.webp",description:"Choose this fries price option."},
  {id:"fries-200",name:"French Fries — Rs. 200",price:200,category:"Sides",emoji:"🍟",image:"assets/fries-small.webp",description:"Choose this fries price option."},
  {id:"fries-300",name:"French Fries — Rs. 300",price:300,category:"Sides",emoji:"🍟",image:"assets/fries-large.webp",description:"Choose this fries price option."},
  {id:"fries-500",name:"French Fries — Rs. 500",price:500,category:"Sides",emoji:"🍟",image:"assets/fries-large.webp",description:"Choose this fries price option."},
  {id:"fries-700",name:"French Fries — Rs. 700",price:700,category:"Sides",emoji:"🍟",image:"assets/fries-large.webp",description:"Choose this fries price option."},
  {id:"fries-1000",name:"French Fries — Rs. 1,000",price:1000,category:"Sides",emoji:"🍟",image:"assets/fries-large.webp",description:"Choose this fries price option."}
];

let cart = [];
let activeCategory = "All";
const grid = document.getElementById("menuGrid");
const cartPanel = document.getElementById("cartPanel");
const backdrop = document.getElementById("cartBackdrop");

function renderProducts(){
  const shown = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);
  grid.innerHTML = shown.map(p => `
    <article class="food-card">
      <div class="food-photo">${p.image ? `<img src="${p.image}" alt="AI-generated menu illustration of ${p.name}" loading="lazy" decoding="async">` : `<span class="emoji" aria-hidden="true">${p.emoji}</span>`}<span class="photo-label">${p.category.toUpperCase()}</span></div>
      <div class="food-info">
        <h3>${p.name}</h3><p>${p.description}</p>
        <div class="food-bottom"><span class="price ${p.price == null ? "pending" : ""}">${p.price == null ? "Price not set" : money(p.price)}</span>
          <button class="add-btn" data-add="${p.id}" ${p.price == null ? "disabled title='Price has not been set'" : ""}>${p.price == null ? "Unavailable" : "Add to order +"}</button>
        </div>
      </div>
    </article>`).join("");
}
function openCart(){document.body.classList.add("cart-opened");cartPanel.setAttribute("aria-hidden","false");renderCart()}
function closeCart(){document.body.classList.remove("cart-opened");cartPanel.setAttribute("aria-hidden","true")}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p||p.price==null)return;const found=cart.find(x=>x.id===id);if(found)found.qty++;else cart.push({...p,qty:1});renderCart();openCart()}
function changeQty(id,delta){const item=cart.find(x=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);renderCart()}
function renderCart(){
  const count=cart.reduce((s,x)=>s+x.qty,0);document.getElementById("cartCount").textContent=count;
  const container=document.getElementById("cartItems");
  if(!cart.length)container.innerHTML='<p class="empty-cart">Your order is empty. Add something tasty from the menu.</p>';
  else container.innerHTML=cart.map(x=>`<div class="cart-item"><div><h4>${x.name}</h4><small>${money(x.price)} each</small><div class="cart-controls"><button data-qty="${x.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${x.qty}</span><button data-qty="${x.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><span class="cart-item-price">${money(x.price*x.qty)}</span></div>`).join("");
  document.getElementById("cartTotal").textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));
}
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(b.dataset.add)});
document.getElementById("cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-qty]");if(b)changeQty(b.dataset.qty,Number(b.dataset.delta))});
document.getElementById("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
document.getElementById("cartOpen").addEventListener("click",openCart);
document.getElementById("cartClose").addEventListener("click",closeCart);
backdrop.addEventListener("click",closeCart);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});
const orderType=document.getElementById("orderType"),address=document.getElementById("customerAddress"),addressLabel=document.getElementById("addressLabel");
orderType.addEventListener("change",()=>{const isDelivery=orderType.value==="Delivery";address.required=isDelivery;addressLabel.style.display=isDelivery?"grid":"none"});
document.getElementById("orderForm").addEventListener("submit",e=>{
  e.preventDefault();const err=document.getElementById("formError");err.textContent="";
  if(!cart.length){err.textContent="Please add at least one item to your order.";return}
  const name=document.getElementById("customerName").value.trim(),phone=document.getElementById("customerPhone").value.trim(),type=orderType.value,addr=address.value.trim(),payment=document.getElementById("paymentMethod").value;
  if(!name||!phone||(type==="Delivery"&&!addr)){err.textContent="Please complete all required customer details.";return}
  const lines=cart.map(x=>`• ${x.name} x${x.qty} = ${money(x.price*x.qty)}`);
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const message=[
    "Assalam-o-Alaikum, TRASKOON FOOD POINT!",
    "I would like to place an order:",
    "",
    ...lines,
    "",
    `Subtotal: ${money(total)}`,
    `Order type: ${type}`,
    `Customer name: ${name}`,
    `Phone: ${phone}`,
    ...(type==="Delivery"?[`Delivery address: ${addr}`]:[]),
    `Payment method: ${payment}`,
    "",
    "Please confirm availability and delivery details."
  ].join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener");
});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();address.required=true;
