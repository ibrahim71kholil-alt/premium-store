/* ==========================================
   PREMIUM STORE - USER WEBSITE JS (UPDATED)
   ========================================== */

const firebaseConfig = {
  // আপনার ফায়ারবেস কনফিগারেশন
  apiKey: "AIzaSyDNItGEILCV3ssNYSe2sSqa-4w40GfNsLs",
  authDomain: "premium-store-abb6f.firebaseapp.com",
  projectId: "premium-store-abb6f",
  storageBucket: "premium-store-abb6f.firebasestorage.app",
  messagingSenderId: "706337940165",
  appId: "1:706337940165:web:183f9ef3e9ab23a93606ac"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const appsGrid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let allApps = []; 
let currentCategory = "All";

function showSkeletonLoader() {
  appsGrid.innerHTML = "";
  for(let i = 0; i < 6; i++) {
    appsGrid.innerHTML += `
      <div class="app-card">
        <div class="app-card-header">
          <div class="skeleton sk-icon"></div>
          <div style="flex:1;">
            <div class="skeleton sk-title"></div>
            <div class="skeleton sk-tag"></div>
          </div>
        </div>
        <div class="skeleton sk-desc"></div>
        <div class="skeleton sk-btn"></div>
      </div>
    `;
  }
}

async function loadUserApps() {
  showSkeletonLoader();
  try {
    const snapshot = await db.collection("apps").orderBy("createdAt", "desc").get();
    allApps = [];
    snapshot.forEach(doc => { allApps.push({ id: doc.id, ...doc.data() }); });
    filterAndRenderApps();
  } catch (error) {
    appsGrid.innerHTML = '<div style="text-align:center; width:100%; color:red;">Failed to load apps. Check Firestore rules.</div>';
  }
}

if (filterButtons.length > 0) {
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.getAttribute("data-category");
      filterAndRenderApps();
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("input", filterAndRenderApps);
}

function filterAndRenderApps() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const filteredApps = allApps.filter(app => {
    const matchSearch = app.name && app.name.toLowerCase().includes(searchTerm);
    const matchCategory = currentCategory === "All" || app.category === currentCategory;
    return matchSearch && matchCategory;
  });
  renderUserApps(filteredApps);
}

function renderUserApps(apps) {
  if (apps.length === 0) {
    appsGrid.innerHTML = '<div style="text-align:center; width:100%; color:#707782;">No apps found.</div>';
    return;
  }
  appsGrid.innerHTML = "";

  apps.forEach(app => {
    const card = document.createElement("div");
    card.className = "app-card";

    let iconHTML = app.iconUrl 
      ? `<img src="${escapeHTML(app.iconUrl)}" alt="${escapeHTML(app.name)}">` 
      : escapeHTML((app.name || "A").charAt(0).toUpperCase());

    let sizeText = app.size ? escapeHTML(app.size) : "Unknown Size";
    let downloads = app.downloads ? app.downloads : 0;

    // বাটন তৈরি করার লজিক (টেলিগ্রাম এবং হোয়াটসঅ্যাপ)
    let buttonsHTML = '<div class="btn-group">';
    
    if (app.telegramUrl) {
      buttonsHTML += `<button class="btn-telegram" onclick="handleDownload('${app.id}', '${escapeHTML(app.telegramUrl)}')">✈️ Telegram</button>`;
    }
    
    if (app.whatsappUrl) {
      buttonsHTML += `<button class="btn-whatsapp" onclick="handleDownload('${app.id}', '${escapeHTML(app.whatsappUrl)}')">💬 WhatsApp</button>`;
    }
    
    // যদি কোনো অ্যাপে শুধু পুরনো ড্রাইভ লিংক (apkUrl) থাকে
    if (!app.telegramUrl && !app.whatsappUrl && app.apkUrl) {
      buttonsHTML += `<button class="download-btn" onclick="handleDownload('${app.id}', '${escapeHTML(app.apkUrl)}')">Download APK</button>`;
    }
    
    buttonsHTML += '</div>';

    card.innerHTML = `
      <div class="app-card-header">
        <div class="app-icon">${iconHTML}</div>
        <div class="app-info">
          <h4>${escapeHTML(app.name)}</h4>
          <span>${escapeHTML(app.category || "App")}</span>
        </div>
      </div>
      <p class="app-desc">${escapeHTML(app.description)}</p>
      <div class="app-meta">
        <span>📥 ${downloads} Downloads</span>
        <span>${sizeText}</span>
      </div>
      ${buttonsHTML}
    `;

    appsGrid.appendChild(card);
  });
}

window.handleDownload = async function(appId, targetUrl) {
  // লিংকে ক্লিক করলে নতুন ট্যাবে ওপেন করবে
  window.open(targetUrl, '_blank');
  
  // ফায়ারবেসে ডাউনলোড কাউন্ট ১ বাড়াবে
  try {
    await db.collection("apps").doc(appId).update({
      downloads: firebase.firestore.FieldValue.increment(1)
    });
    const appIndex = allApps.findIndex(a => a.id === appId);
    if(appIndex !== -1) {
      allApps[appIndex].downloads = (allApps[appIndex].downloads || 0) + 1;
      filterAndRenderApps();
    }
  } catch(error) {
    console.error("Counter update failed", error);
  }
};

function escapeHTML(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* Start */
loadUserApps();
