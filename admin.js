/* ==========================================
   PREMIUM STORE - ADMIN PANEL JS (PREVIOUS VERSION)
   ========================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDNItGEILCV3ssNYSe2sSqa-4w40GfNsLs",
  authDomain: "premium-store-abb6f.firebaseapp.com",
  projectId: "premium-store-abb6f",
  storageBucket: "premium-store-abb6f.firebasestorage.app",
  messagingSenderId: "706337940165",
  appId: "1:706337940165:web:183f9ef3e9ab23a93606ac"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// আপনার আসল UID
const ADMIN_UID = "KdZ72nHmJrOEET2fVkRuHrSfPE93"; 

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const appForm = document.getElementById("appForm");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const formMessage = document.getElementById("formMessage");
const appsList = document.getElementById("appsList");

auth.onAuthStateChanged(function(user){
  if(user){
    if(user.uid !== ADMIN_UID){
      loginMessage.innerHTML = `<span style="color:red;">UID Match Error! You are not Admin.</span>`;
      auth.signOut();
      return;
    }
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");
    loadApps();
  } else {
    loginPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");
  }
});

loginForm.addEventListener("submit", async function(event){
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  loginButton.disabled = true; loginButton.textContent = "LOGIN...";
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch(error) {
    loginMessage.innerHTML = `<span style="color:red;">Login failed: ${error.message}</span>`;
  } finally {
    loginButton.disabled = false; loginButton.textContent = "LOGIN";
  }
});

logoutButton.addEventListener("click", async () => await auth.signOut());

appForm.addEventListener("submit", async function(event){
  event.preventDefault();
  saveButton.disabled = true; saveButton.textContent = "Saving..."; formMessage.textContent = "";
  
  const editId = document.getElementById("editId").value.trim();
  const appData = {
    name: document.getElementById("appName").value.trim(),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value.trim(),
    version: document.getElementById("version").value.trim(),
    size: document.getElementById("size").value.trim(),
    iconUrl: document.getElementById("iconUrl").value.trim(),
    telegramUrl: document.getElementById("telegramUrl").value.trim(),
    whatsappUrl: document.getElementById("whatsappUrl").value.trim(),
    apkUrl: document.getElementById("apkUrl").value.trim(),
    featured: document.getElementById("featured").checked,
    latest: document.getElementById("latest").checked,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if(editId){
      await db.collection("apps").doc(editId).update(appData);
      formMessage.style.color = "green"; formMessage.textContent = "App updated successfully.";
    } else {
      appData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      appData.downloads = 0;
      await db.collection("apps").add(appData);
      formMessage.style.color = "green"; formMessage.textContent = "App added successfully.";
    }
    resetForm();
    await loadApps();
  } catch(error) {
    formMessage.style.color = "red"; formMessage.textContent = "Error saving app to Firebase.";
  } finally {
    saveButton.disabled = false; saveButton.textContent = "SAVE APP";
  }
});

async function loadApps(){
  appsList.innerHTML = '<div class="loading">Loading apps...</div>';
  try {
    const snapshot = await db.collection("apps").orderBy("createdAt", "desc").get();
    const apps = [];
    snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
    document.getElementById("totalApps").textContent = apps.length;
    renderApps(apps);
  } catch(error) {
    appsList.innerHTML = '<div class="empty">Could not load apps.</div>';
  }
}

function renderApps(apps){
  if(apps.length === 0){ appsList.innerHTML = '<div class="empty">No apps.</div>'; return; }
  appsList.innerHTML = "";
  apps.forEach(app => {
    const item = document.createElement("div");
    item.className = "app-item";
    let iconHTML = app.iconUrl ? `<img src="${escapeHTML(app.iconUrl)}" alt="">` : escapeHTML((app.name || "A").charAt(0).toUpperCase());
    item.innerHTML = `
      <div class="app-left">
        <div class="app-icon">${iconHTML}</div>
        <div class="app-details">
          <h3>${escapeHTML(app.name || "App")}</h3>
          <p>${escapeHTML(app.version || "")} | ${escapeHTML(app.size || "")}</p>
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

window.editApp = async function(id){
  try {
    const docData = await db.collection("apps").doc(id).get();
    if(!docData.exists) return;
    const app = docData.data();
    document.getElementById("editId").value = id;
    document.getElementById("appName").value = app.name || "";
    document.getElementById("category").value = app.category || "";
    document.getElementById("description").value = app.description || "";
    document.getElementById("version").value = app.version || "";
    document.getElementById("size").value = app.size || "";
    document.getElementById("iconUrl").value = app.iconUrl || "";
    document.getElementById("telegramUrl").value = app.telegramUrl || "";
    document.getElementById("whatsappUrl").value = app.whatsappUrl || "";
    document.getElementById("apkUrl").value = app.apkUrl || "";
    document.getElementById("featured").checked = app.featured === true;
    document.getElementById("latest").checked = app.latest === true;
    
    saveButton.textContent = "UPDATE APP";
    cancelButton.classList.remove("hidden");
    window.scrollTo({ top:0, behavior:"smooth" });
  } catch(error) { alert("Error loading app."); }
};

window.deleteApp = async function(id){
  if(confirm("Are you sure you want to delete this app?")){
    await db.collection("apps").doc(id).delete();
    await loadApps();
  }
};

document.getElementById("refreshButton").addEventListener("click", loadApps);
cancelButton.addEventListener("click", resetForm);

function resetForm(){
  appForm.reset();
  document.getElementById("editId").value = "";
  saveButton.textContent = "SAVE APP";
  cancelButton.classList.add("hidden");
}

function escapeHTML(value){
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
