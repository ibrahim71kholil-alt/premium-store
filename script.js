/* ==========================================
   PREMIUM STORE - USER WEBSITE JS
   ========================================== */

/* ================= FIREBASE CONFIG ================= */
// আপনার ফায়ারবেস কনফিগারেশন এখানে বসান (admin.js এর মত)
const firebaseConfig = {
  apiKey: "AIzaSyDNItGEILCV3ssNYSe2sSqa-4w40GfNsLs",
  authDomain: "premium-store-abb6f.firebaseapp.com",
  projectId: "premium-store-abb6f",
  storageBucket: "premium-store-abb6f.firebasestorage.app",
  messagingSenderId: "706337940165",
  appId: "1:706337940165:web:183f9ef3e9ab23a93606ac"
};

/* ================= FIREBASE START ================= */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ================= ELEMENTS ================= */
const appsGrid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
let allApps = []; // সার্চ করার জন্য অ্যাপগুলো এখানে সেভ করে রাখব

/* ================= LOAD APPS ================= */
async function loadUserApps() {
  try {
    const snapshot = await db.collection("apps").orderBy("createdAt", "desc").get();
    allApps = [];
    
    snapshot.forEach(doc => {
      allApps.push({ id: doc.id, ...doc.data() });
    });

    renderUserApps(allApps);
  } catch (error) {
    console.error("Error loading apps: ", error);
    appsGrid.innerHTML = '<div class="loading">Failed to load apps. Check connection.</div>';
  }
}

/* ================= RENDER APPS ================= */
function renderUserApps(apps) {
  if (apps.length === 0) {
    appsGrid.innerHTML = '<div class="loading">No apps found.</div>';
    return;
  }

  appsGrid.innerHTML = ""; // আগের লোডিং লেখা মুছে ফেললাম

  apps.forEach(app => {
    const card = document.createElement("div");
    card.className = "app-card";

    // আইকন সেটআপ
    let iconHTML = app.iconUrl 
      ? `<img src="${app.iconUrl}" alt="${app.name}">` 
      : escapeHTML((app.name || "A").charAt(0).toUpperCase());

    // সাইজ ও ভার্সন
    let sizeText = app.size ? app.size : "Unknown Size";
    let versionText = app.version ? `v${app.version}` : "";

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
        <span>${versionText}</span>
        <span>${sizeText}</span>
      </div>
      <a href="${app.apkUrl}" class="download-btn" target="_blank" rel="noopener noreferrer">
        Download APK
      </a>
    `;

    appsGrid.appendChild(card);
  });
}

/* ================= SEARCH APP ================= */
searchInput.addEventListener("input", function(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  const filteredApps = allApps.filter(app => {
    return app.name.toLowerCase().includes(searchTerm) || 
           (app.category && app.category.toLowerCase().includes(searchTerm));
  });

  renderUserApps(filteredApps);
});

/* ================= UTILS ================= */
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Start App */
loadUserApps();
