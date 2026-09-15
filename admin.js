/* ==========================================
   PREMIUM STORE
   ADMIN PANEL JAVASCRIPT
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

/* ================= FIREBASE START ================= */
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ================= ADMIN UID ================= */
// এখানে আপনার আসল UID দিতে হবে। প্রথমবার লগইন করলে স্ক্রিনে UID দেখাবে, সেটা এখানে বসিয়ে দিবেন।
const ADMIN_UID = "KdZ72nHmJrOEET2fVkRuHrSfPE93"; // <-- পরে এটি পরিবর্তন করতে হবে

/* ================= ELEMENTS ================= */
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

const appForm = document.getElementById("appForm");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const formMessage = document.getElementById("formMessage");
const appsList = document.getElementById("appsList");
const refreshButton = document.getElementById("refreshButton");

/* ================= AUTH STATE ================= */
auth.onAuthStateChanged(function(user){
  if(user){
    /* UID Check */
    if(user.uid !== ADMIN_UID){
      // অ্যাডমিন UID না মিললে ইউজারকে তার UID দেখিয়ে দেওয়া হবে যাতে সে কপি করতে পারে
      loginMessage.innerHTML = `<span style="color:red;">UID Match Error!</span><br>আপনার আসল UID হলো:<br><b style="color:#245f73; user-select:all;">${user.uid}</b><br>এটি কপি করে admin.js এর ADMIN_UID এর জায়গায় বসান।`;
      auth.signOut();
      return;
    }

    /* Show dashboard */
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");
    loadApps();
  } else {
    /* Show login */
    loginPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");
  }
});

/* ================= LOGIN ================= */
loginForm.addEventListener("submit", async function(event){
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginButton.disabled = true;
  loginButton.textContent = "LOGIN...";
  loginMessage.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch(error) {
    console.error(error);
    if(error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      loginMessage.textContent = "ভুল ইমেইল বা পাসওয়ার্ড। অথবা Firebase এ অ্যাকাউন্ট তৈরি করা হয়নি।";
    } else {
      loginMessage.textContent = "Login failed. " + error.message;
    }
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "LOGIN";
  }
});

/* ================= LOGOUT ================= */
logoutButton.addEventListener("click", async function(){
  await auth.signOut();
});

/* ================= ADD / EDIT APP ================= */
appForm.addEventListener("submit", async function(event){
  event.preventDefault();

  const editId = document.getElementById("editId").value.trim();
  const name = document.getElementById("appName").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const version = document.getElementById("version").value.trim();
  const size = document.getElementById("size").value.trim();
  const androidVersion = document.getElementById("androidVersion").value.trim();
  const downloads = Number(document.getElementById("downloads").value) || 0;
  const iconUrl = document.getElementById("iconUrl").value.trim();
  const apkUrl = document.getElementById("apkUrl").value.trim();
  const screenshotsText = document.getElementById("screenshots").value.trim();
  const featured = document.getElementById("featured").checked;
  const latest = document.getElementById("latest").checked;

  const screenshots = screenshotsText ? screenshotsText.split("\n").map(url => url.trim()).filter(url => url.length > 0) : [];

  const appData = {
    name: name,
    description: description,
    category: category,
    version: version,
    size: size,
    androidVersion: androidVersion,
    iconUrl: iconUrl,
    apkUrl: apkUrl,
    screenshots: screenshots,
    featured: featured,
    latest: latest,
    downloads: downloads,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    saveButton.disabled = true;
    saveButton.textContent = "SAVING...";

    if(editId){
      await db.collection("apps").doc(editId).update(appData);
      formMessage.textContent = "App updated successfully.";
    } else {
      appData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("apps").add(appData);
      formMessage.textContent = "App added successfully.";
    }
    resetForm();
    await loadApps();
  } catch(error) {
    console.error(error);
    formMessage.textContent = "Something went wrong. Check Firebase.";
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "ADD APP";
  }
});

/* ================= LOAD APPS ================= */
async function loadApps(){
  appsList.innerHTML = '<div class="loading">Loading apps...</div>';
  try {
    const snapshot = await db.collection("apps").get();
    const apps = [];
    snapshot.forEach(function(doc){
      apps.push({ id: doc.id, ...doc.data() });
    });
    updateStats(apps);
    renderApps(apps);
  } catch(error) {
    console.error(error);
    appsList.innerHTML = '<div class="empty">Could not load apps. (Check Firestore Rules)</div>';
  }
}

/* ================= STATS ================= */
function updateStats(apps){
  document.getElementById("totalApps").textContent = apps.length;
  document.getElementById("featuredApps").textContent = apps.filter(app => app.featured === true).length;
  document.getElementById("latestApps").textContent = apps.filter(app => app.latest === true).length;
}

/* ================= RENDER APPS ================= */
function renderApps(apps){
  if(apps.length === 0){
    appsList.innerHTML = '<div class="empty">No apps added yet.</div>';
    return;
  }
  appsList.innerHTML = "";
  apps.forEach(function(app){
    const item = document.createElement("div");
    item.className = "app-item";
    
    let iconHTML = app.iconUrl ? `<img src="${escapeHTML(app.iconUrl)}" alt="">` : escapeHTML((app.name || "A").charAt(0).toUpperCase());
    
    let badges = "";
    if(app.category) badges += `<span class="badge">${escapeHTML(app.category)}</span>`;
    if(app.featured) badges += `<span class="badge">Featured</span>`;
    if(app.latest) badges += `<span class="badge">Latest</span>`;

    item.innerHTML = `
      <div class="app-left">
        <div class="app-icon">${iconHTML}</div>
        <div class="app-details">
          <h3>${escapeHTML(app.name || "Unnamed App")}</h3>
          <p>${escapeHTML(app.description || "No description")}</p>
          <div class="badges">${badges}</div>
        </div>
      </div>
      <div class="app-actions">
        <button class="edit-button" onclick="editApp('${app.id}')">Edit</button>
        <button class="delete-button" onclick="deleteApp('${app.id}')">Delete</button>
      </div>
    `;
    appsList.appendChild(item);
  });
}

/* ================= EDIT & DELETE ================= */
window.editApp = async function(id){
  try {
    const documentData = await db.collection("apps").doc(id).get();
    if(!documentData.exists){ alert("App not found."); return; }
    const app = documentData.data();
    document.getElementById("editId").value = id;
    document.getElementById("appName").value = app.name || "";
    document.getElementById("category").value = app.category || "";
    document.getElementById("description").value = app.description || "";
    document.getElementById("version").value = app.version || "";
    document.getElementById("size").value = app.size || "";
    document.getElementById("androidVersion").value = app.androidVersion || "";
    document.getElementById("downloads").value = app.downloads || 0;
    document.getElementById("iconUrl").value = app.iconUrl || "";
    document.getElementById("apkUrl").value = app.apkUrl || "";
    document.getElementById("screenshots").value = Array.isArray(app.screenshots) ? app.screenshots.join("\n") : "";
    document.getElementById("featured").checked = app.featured === true;
    document.getElementById("latest").checked = app.latest === true;
    formTitle.textContent = "Edit App";
    saveButton.textContent = "UPDATE APP";
    cancelButton.classList.remove("hidden");
    window.scrollTo({ top:0, behavior:"smooth" });
  } catch(error) {
    console.error(error); alert("Could not load app.");
  }
};

window.deleteApp = async function(id){
  if(!confirm("Are you sure you want to delete this app?")) return;
  try {
    await db.collection("apps").doc(id).delete();
    await loadApps();
  } catch(error) {
    console.error(error); alert("Delete failed.");
  }
};

cancelButton.addEventListener("click", function(){ resetForm(); });
refreshButton.addEventListener("click", function(){ loadApps(); });

function resetForm(){
  appForm.reset();
  document.getElementById("editId").value = "";
  document.getElementById("downloads").value = 0;
  formTitle.textContent = "Add New App";
  saveButton.textContent = "ADD APP";
  cancelButton.classList.add("hidden");
}

function escapeHTML(value){
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
