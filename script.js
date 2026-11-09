/* ==========================================
   PREMIUM STORE - DROPSHIPPING WEBSITE JS
   ========================================== */

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDNItGEILCV3ssNYSe2sSqa-4w40GfNsLs",
  authDomain: "premium-store-abb6f.firebaseapp.com",
  projectId: "premium-store-abb6f",
  storageBucket: "premium-store-abb6f.firebasestorage.app",
  messagingSenderId: "706337940165",
  appId: "1:706337940165:web:183f9ef3e9ab23a93606ac"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

/* ================= ELEMENTS ================= */
const appsGrid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let allProducts = []; 
let currentCategory = "All";

/* ================= SKELETON LOADER ================= */
function showSkeletonLoader() {
  appsGrid.innerHTML = "";
  for(let i = 0; i < 6; i++) {
    appsGrid.innerHTML += `
      <div class="app-card">
        <div class="skeleton" style="width:100%; height:160px; border-radius:10px; margin-bottom:10px;"></div>
        <div class="skeleton sk-title"></div>
        <div class="skeleton sk-desc"></div>
        <div class="skeleton sk-btn"></div>
      </div>
    `;
  }
}

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  showSkeletonLoader();

  try {
    // আগের "apps" কালেকশন থেকেই ডাটা নিচ্ছে যাতে সহজে কাজ করে
    const snapshot = await db.collection("apps").orderBy("createdAt", "desc").get();
    allProducts = [];
    
    snapshot.forEach(doc => {
      allProducts.push({ id: doc.id, ...doc.data() });
    });

    filterAndRenderProducts();
  } catch (error) {
    console.error("Error:", error);
    appsGrid.innerHTML = '<div style="text-align:center; width:100%; color:red;">প্রোডাক্ট লোড করতে সমস্যা হয়েছে।</div>';
  }
}

/* ================= FILTER LOGIC ================= */
filterButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    filterButtons.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    currentCategory = e.target.getAttribute("data-category");
    filterAndRenderProducts();
  });
});

searchInput.addEventListener("input", filterAndRenderProducts);

function filterAndRenderProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  
  const filtered = allProducts.filter(item => {
    const itemName = (item.name || "").toLowerCase();
    const matchSearch = itemName.includes(searchTerm);
    const matchCategory = currentCategory === "All" || item.category === currentCategory;
    return matchSearch && matchCategory;
  });

  renderProducts(filtered);
}

/* ================= RENDER PRODUCT CARDS ================= */
function renderProducts(products) {
  if (products.length === 0) {
    appsGrid.innerHTML = '<div style="text-align:center; width:100%; color:#707782; padding: 30px;">এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।</div>';
    return;
  }

  appsGrid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "app-card";

    // প্রোডাক্টের ছবি ও দাম সেটআপ
    const imageUrl = product.iconUrl || "https://via.placeholder.com/300x300?text=Product";
    const price = Number(product.price || product.size || 550); // প্রাইস না থাকলে ডিফল্ট দেখানোর জন্য
    const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
    const soldCount = product.downloads || 0;

    let discountBadge = "";
    if (oldPrice && oldPrice > price) {
      const percent = Math.round(((oldPrice - price) / oldPrice) * 100);
      discountBadge = `<span class="discount-badge">-${percent}% OFF</span>`;
    }

    card.innerHTML = `
      <div class="product-img-box" onclick="window.location.href='details.html?id=${product.id}'" style="cursor:pointer;">
        ${discountBadge}
        <img src="${imageUrl}" alt="${escapeHTML(product.name)}">
      </div>
      <div class="app-info">
        <h4 onclick="window.location.href='details.html?id=${product.id}'" style="cursor:pointer; margin: 0 0 4px 0;">
          ${escapeHTML(product.name)}
        </h4>
        <span style="font-size:12px; color:#6b7280;">${escapeHTML(product.category || "General")}</span>
      </div>
      <p class="app-desc">${escapeHTML(product.description || "")}</p>
      
      <div class="price-box">
        <span class="current-price">৳ ${price}</span>
        ${oldPrice ? `<span class="old-price">৳ ${oldPrice}</span>` : ""}
      </div>

      <div class="app-meta">
        <span>🔥 ${soldCount} Sold</span>
        <span style="color:#16a34a; font-weight:bold;">✔ In Stock</span>
      </div>

      <button class="download-btn" onclick="openOrderModal('${product.id}', '${escapeHTML(product.name)}', ${price})">
        🛒 Order Now
      </button>
    `;

    appsGrid.appendChild(card);
  });
}

/* ================= ORDER MODAL & CHECKOUT LOGIC ================= */
function openOrderModal(id, name, price) {
  document.getElementById("orderProductId").value = id;
  document.getElementById("orderProductName").value = name;
  document.getElementById("orderProductPrice").value = price;

  document.getElementById("summaryName").innerText = name;
  document.getElementById("summaryPrice").innerText = price;
  updateOrderTotal();

  document.getElementById("orderModal").style.display = "flex";
}

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
}

function updateOrderTotal() {
  const price = Number(document.getElementById("orderProductPrice").value || 0);
  const delivery = Number(document.getElementById("deliveryArea").value || 70);
  document.getElementById("summaryDelivery").innerText = delivery;
  document.getElementById("summaryTotal").innerText = price + delivery;
}

// কাস্টমার অর্ডার সাবমিট করলে Firebase-এ সেভ হবে
document.getElementById("checkoutForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("submitOrderBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Processing Order...";

  const productId = document.getElementById("orderProductId").value;
  const productName = document.getElementById("orderProductName").value;
  const productPrice = Number(document.getElementById("orderProductPrice").value);
  const deliveryCharge = Number(document.getElementById("deliveryArea").value);

  const orderData = {
    productId: productId,
    productName: productName,
    productPrice: productPrice,
    deliveryCharge: deliveryCharge,
    totalAmount: productPrice + deliveryCharge,
    customerName: document.getElementById("custName").value.trim(),
    customerPhone: document.getElementById("custPhone").value.trim(),
    customerAddress: document.getElementById("custAddress").value.trim(),
    status: "Pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    // ১. নতুন "orders" কালেকশনে অর্ডার সেভ করা
    await db.collection("orders").add(orderData);

    // ২. প্রোডাক্টের Sold সংখ্যা ১ বাড়ানো
    await db.collection("apps").doc(productId).update({
      downloads: firebase.firestore.FieldValue.increment(1)
    });

    alert("🎉 আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! খুব শীঘ্রই আমাদের প্রতিনিধি আপনাকে কল করবেন।");
    document.getElementById("checkoutForm").reset();
    closeOrderModal();
    loadProducts();
  } catch (error) {
    console.error("Order error:", error);
    alert("দুঃখিত, অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "✅ Confirm Order (Cash on Delivery)";
  }
});

function escapeHTML(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* Start */
loadProducts();
