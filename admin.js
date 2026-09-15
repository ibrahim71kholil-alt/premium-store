/* =====================================================
   PREMIUM STORE
   ADMIN PANEL
   FIREBASE + APPWRITE
===================================================== */


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyDNItGEILCV3ssNYSe2sSqa-4w40GfNsLs",

    authDomain:
        "premium-store-abb6f.firebaseapp.com",

    projectId:
        "premium-store-abb6f",

    storageBucket:
        "premium-store-abb6f.firebasestorage.app",

    messagingSenderId:
        "706337940165",

    appId:
        "1:706337940165:web:183f9ef3e9ab23a93606ac"

};


/* =====================================================
   FIREBASE INITIALIZE
===================================================== */

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const db = firebase.firestore();


/* =====================================================
   FIREBASE ADMIN UID
===================================================== */

const ADMIN_UID =
    "KdZ72nHmJrOEET2fVkRuHrSfPE93";


/* =====================================================
   APPWRITE CONFIG
===================================================== */

const APPWRITE_ENDPOINT =
    "https://cloud.appwrite.io/v1";

const APPWRITE_PROJECT_ID =
    "6aa8fe7e0033f2b50491";

const APPWRITE_BUCKET_ID =
    "6aa8fe7e0033f2b50491";


/* =====================================================
   APPWRITE INITIALIZE
===================================================== */

const { Client, Account, Storage, ID } = Appwrite;


const appwriteClient =
    new Client();

appwriteClient
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);


const appwriteAccount =
    new Account(appwriteClient);


const appwriteStorage =
    new Storage(appwriteClient);


/* =====================================================
   ELEMENTS
===================================================== */

const loginPage =
    document.getElementById("loginPage");

const dashboardPage =
    document.getElementById("dashboardPage");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const appForm =
    document.getElementById("appForm");

const apkFile =
    document.getElementById("apkFile");

const selectedApk =
    document.getElementById("selectedApk");

const uploadProgress =
    document.getElementById("uploadProgress");

const apkUrl =
    document.getElementById("apkUrl");

const publishBtn =
    document.getElementById("publishBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const appsList =
    document.getElementById("appsList");


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        loginMessage.textContent =
            "Logging in...";


        try {

            /* Firebase login */

            const result =
                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );


            const user =
                result.user;


            /* Check Firebase Admin */

            if (
                user.uid !== ADMIN_UID
            ) {

                await auth.signOut();

                throw new Error(
                    "You are not authorized as admin."
                );

            }


            /* Appwrite login */

            try {

                await appwriteAccount
                    .createEmailPasswordSession(
                        email,
                        password
                    );

            }

            catch (appwriteError) {

                console.error(
                    "Appwrite login:",
                    appwriteError
                );

                throw new Error(
                    "Firebase login successful, but Appwrite login failed. Make sure the same admin email/password exists in Appwrite Authentication."
                );

            }


            loginMessage.textContent =
                "";


            showDashboard();

            await loadApps();

        }

        catch (error) {

            console.error(error);

            loginMessage.textContent =
                error.message ||
                "Login failed.";

        }

    }
);


/* =====================================================
   AUTH STATE
===================================================== */

auth.onAuthStateChanged(
    async function(user) {

        if (!user) {

            showLogin();

            return;

        }


        if (
            user.uid !== ADMIN_UID
        ) {

            await auth.signOut();

            showLogin();

            return;

        }


        try {

            await appwriteAccount.get();

            showDashboard();

            await loadApps();

        }

        catch (error) {

            console.log(
                "Appwrite session not active."
            );

            showLogin();

        }

    }
);


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    loginPage.style.display =
        "flex";

    dashboardPage.style.display =
        "none";

}


/* =====================================================
   SHOW DASHBOARD
===================================================== */

function showDashboard() {

    loginPage.style.display =
        "none";

    dashboardPage.style.display =
        "block";

}


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.addEventListener(
    "click",
    async function() {

        try {

            await appwriteAccount
                .deleteSession("current");

        }

        catch (error) {

            console.log(
                "Appwrite logout:",
                error
            );

        }


        try {

            await auth.signOut();

        }

        catch (error) {

            console.log(error);

        }


        showLogin();

    }
);


/* =====================================================
   APK FILE SELECT
===================================================== */

apkFile.addEventListener(
    "change",
    function() {

        const file =
            apkFile.files[0];


        if (!file) {

            selectedApk.textContent =
                "No APK selected";

            return;

        }


        if (
            !file.name
                .toLowerCase()
                .endsWith(".apk")
        ) {

            selectedApk.textContent =
                "Please select a valid APK file.";

            apkFile.value =
                "";

            return;

        }


        const sizeMB =
            (
                file.size /
                1024 /
                1024
            ).toFixed(2);


        selectedApk.textContent =
            `${file.name} • ${sizeMB} MB`;

    }
);


/* =====================================================
   UPLOAD APK TO APPWRITE
===================================================== */

async function uploadAPK(file) {

    if (!file) {

        throw new Error(
            "Please select an APK file."
        );

    }


    if (
        !file.name
            .toLowerCase()
            .endsWith(".apk")
    ) {

        throw new Error(
            "Only APK files are allowed."
        );

    }


    uploadProgress.textContent =
        "Uploading APK...";


    publishBtn.disabled =
        true;


    try {

        const fileId =
            ID.unique();


        const result =
            await appwriteStorage.createFile(
                APPWRITE_BUCKET_ID,
                fileId,
                Appwrite.InputFile.fromFile(file)
            );


        uploadProgress.textContent =
            "APK uploaded successfully.";


        /*
          Public download URL
        */

        const downloadURL =
            `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${result.$id}/download?project=${APPWRITE_PROJECT_ID}`;


        return downloadURL;

    }

    catch (error) {

        console.error(
            "APK Upload Error:",
            error
        );

        uploadProgress.textContent =
            "";

        throw new Error(
            error.message ||
            "APK upload failed."
        );

    }

    finally {

        publishBtn.disabled =
            false;

    }

}


/* =====================================================
   APP FORM SUBMIT
===================================================== */

appForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        try {

            publishBtn.disabled =
                true;


            publishBtn.textContent =
                "Publishing...";


            const editingId =
                document
                    .getElementById(
                        "editingAppId"
                    )
                    .value;


            let finalApkURL =
                apkUrl.value.trim();


            /*
              If new APK selected,
              upload it first.
            */

            if (
                apkFile.files.length > 0
            ) {

                finalApkURL =
                    await uploadAPK(
                        apkFile.files[0]
                    );

            }


            if (!finalApkURL) {

                throw new Error(
                    "Please upload an APK or enter an APK URL."
                );

            }


            const screenshotsText =
                document
                    .getElementById(
                        "screenshots"
                    )
                    .value
                    .trim();


            const screenshots =
                screenshotsText
                    ? screenshotsText
                        .split("\n")
                        .map(
                            url =>
                                url.trim()
                        )
                        .filter(Boolean)
                    : [];


            const appData = {

                name:
                    document
                        .getElementById(
                            "appName"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "appDescription"
                        )
                        .value
                        .trim(),

                category:
                    document
                        .getElementById(
                            "appCategory"
                        )
                        .value,

                version:
                    document
                        .getElementById(
                            "appVersion"
                        )
                        .value
                        .trim(),

                size:
                    document
                        .getElementById(
                            "appSize"
                        )
                        .value
                        .trim(),

                androidVersion:
                    document
                        .getElementById(
                            "androidVersion"
                        )
                        .value
                        .trim(),

                iconUrl:
                    document
                        .getElementById(
                            "iconUrl"
                        )
                        .value
                        .trim(),

                apkUrl:
                    finalApkURL,

                screenshots:
                    screenshots,

                featured:
                    document
                        .getElementById(
                            "featured"
                        )
                        .checked,

                latest:
                    document
                        .getElementById(
                            "latest"
                        )
                        .checked,

                downloads:
                    Number(
                        document
                            .getElementById(
                                "downloadCount"
                            )
                            .value
                    ) || 0,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            };


            if (editingId) {

                await db
                    .collection("apps")
                    .doc(editingId)
                    .update(
                        appData
                    );

                alert(
                    "App updated successfully!"
                );

            }

            else {

                appData.createdAt =
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp();


                await db
                    .collection("apps")
                    .add(
                        appData
                    );


                alert(
                    "App published successfully!"
                );

            }


            resetForm();

            await loadApps();

        }

        catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Something went wrong."
            );

        }

        finally {

            publishBtn.disabled =
                false;

            publishBtn.textContent =
                "Publish App";

        }

    }
);


/* =====================================================
   LOAD APPS
===================================================== */

async function loadApps() {

    try {

        const snapshot =
            await db
                .collection("apps")
                .orderBy(
                    "updatedAt",
                    "desc"
                )
                .get();


        const apps =
            [];


        snapshot.forEach(
            doc => {

                apps.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        updateStats(apps);

        renderApps(apps);

    }

    catch (error) {

        console.error(error);

        appsList.innerHTML =
            `<p>Failed to load apps.</p>`;

    }

}


/* =====================================================
   UPDATE STATS
===================================================== */

function updateStats(apps) {

    document
        .getElementById(
            "totalApps"
        )
        .textContent =
        apps.length;


    document
        .getElementById(
            "featuredApps"
        )
        .textContent =
        apps.filter(
            app => app.featured
        ).length;


    document
        .getElementById(
            "latestApps"
        )
        .textContent =
        apps.filter(
            app => app.latest
        ).length;

}


/* =====================================================
   RENDER APPS
===================================================== */

function renderApps(apps) {

    if (!apps.length) {

        appsList.innerHTML =
            "<p>No apps found.</p>";

        return;

    }


    appsList.innerHTML =
        apps.map(
            app => `

            <div class="app-item">

                <div>

                    <strong>
                        ${escapeHTML(
                            app.name || ""
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            app.category || ""
                        )}
                    </p>

                </div>


                <div class="app-actions">

                    <button
                        onclick="editApp('${app.id}')"
                    >
                        Edit
                    </button>

                    <button
                        onclick="deleteApp('${app.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `
        ).join("");

}


/* =====================================================
   EDIT APP
===================================================== */

window.editApp =
async function(id) {

    try {

        const doc =
            await db
                .collection("apps")
                .doc(id)
                .get();


        if (!doc.exists) {

            alert(
                "App not found."
            );

            return;

        }


        const app =
            doc.data();


        document
            .getElementById(
                "editingAppId"
            )
            .value =
            id;


        document
            .getElementById(
                "appName"
            )
            .value =
            app.name || "";


        document
            .getElementById(
                "appCategory"
            )
            .value =
            app.category || "";


        document
            .getElementById(
                "appDescription"
            )
            .value =
            app.description || "";


        document
            .getElementById(
                "appVersion"
            )
            .value =
            app.version || "";


        document
            .getElementById(
                "appSize"
            )
            .value =
            app.size || "";


        document
            .getElementById(
                "androidVersion"
            )
            .value =
            app.androidVersion || "";


        document
            .getElementById(
                "downloadCount"
            )
            .value =
            app.downloads || 0;


        document
            .getElementById(
                "iconUrl"
            )
            .value =
            app.iconUrl || "";


        document
            .getElementById(
                "apkUrl"
            )
            .value =
            app.apkUrl || "";


        document
            .getElementById(
                "screenshots"
            )
            .value =
            (
                app.screenshots || []
            ).join("\n");


        document
            .getElementById(
                "featured"
            )
            .checked =
            !!app.featured;


        document
            .getElementById(
                "latest"
            )
            .checked =
            !!app.latest;


        document
            .getElementById(
                "formTitle"
            )
            .textContent =
            "Edit App";


        publishBtn.textContent =
            "Update App";


        cancelEditBtn.style.display =
            "inline-block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    catch (error) {

        console.error(error);

        alert(
            "Failed to load app."
        );

    }

};


/* =====================================================
   DELETE APP
===================================================== */

window.deleteApp =
async function(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this app?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await db
            .collection("apps")
            .doc(id)
            .delete();


        alert(
            "App deleted successfully."
        );


        await loadApps();

    }

    catch (error) {

        console.error(error);

        alert(
            "Failed to delete app."
        );

    }

};


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    appForm.reset();


    document
        .getElementById(
            "editingAppId"
        )
        .value =
        "";


    apkUrl.value =
        "";


    selectedApk.textContent =
        "No APK selected";


    uploadProgress.textContent =
        "";


    document
        .getElementById(
            "formTitle"
        )
        .textContent =
        "Add New App";


    publishBtn.textContent =
        "Publish App";


    cancelEditBtn.style.display =
        "none";

}


/* =====================================================
   CANCEL EDIT
===================================================== */

cancelEditBtn.addEventListener(
    "click",
    function() {

        resetForm();

    }
);


/* =====================================================
   REFRESH
===================================================== */

refreshBtn.addEventListener(
    "click",
    function() {

        loadApps();

    }
);


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
