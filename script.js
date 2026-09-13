/* ==================================================
   PREMIUM STORE
   HOME PAGE JAVASCRIPT
   ================================================== */


/* ================= SAMPLE APP DATA ================= */

const apps = [

    {
        id: 1,
        name: "AI Assistant",
        description: "Smart AI tools for everyday tasks.",
        category: "AI",
        version: "1.0.0",
        size: "25 MB",
        icon: "AI",
        featured: true,
        latest: true
    },

    {
        id: 2,
        name: "Video Editor",
        description: "Create beautiful videos directly from your phone.",
        category: "Video",
        version: "3.2.1",
        size: "48 MB",
        icon: "VE",
        featured: true,
        latest: true
    },

    {
        id: 3,
        name: "Study Helper",
        description: "A simple companion for learning and study.",
        category: "Education",
        version: "2.1.0",
        size: "18 MB",
        icon: "SH",
        featured: true,
        latest: true
    },

    {
        id: 4,
        name: "Secure Vault",
        description: "Keep your private files safe and protected.",
        category: "Security",
        version: "1.4.0",
        size: "12 MB",
        icon: "SV",
        featured: false,
        latest: true
    },

    {
        id: 5,
        name: "Photo Studio",
        description: "Simple tools for professional photo editing.",
        category: "Design",
        version: "4.0.2",
        size: "35 MB",
        icon: "PS",
        featured: false,
        latest: true
    },

    {
        id: 6,
        name: "Smart Tools",
        description: "Useful tools designed for Android users.",
        category: "Tools",
        version: "2.5.0",
        size: "15 MB",
        icon: "ST",
        featured: false,
        latest: true
    }

];


/* ================= ELEMENTS ================= */

const featuredContainer =
    document.getElementById("featuredApps");

const latestContainer =
    document.getElementById("latestApps");

const toast =
    document.getElementById("toast");


/* ================= FEATURED APPS ================= */

function renderFeaturedApps(list) {

    if (!featuredContainer) return;

    featuredContainer.innerHTML = "";

    const featuredApps =
        list.filter(app => app.featured);

    featuredApps.forEach(app => {

        const card = document.createElement("article");

        card.className = "app-card";

        card.innerHTML = `

            <div class="app-top">

                <div class="app-icon">
                    ${app.icon}
                </div>

                <span class="app-badge">
                    FEATURED
                </span>

            </div>

            <h3>
                ${app.name}
            </h3>

            <p>
                ${app.description}
            </p>

            <div class="app-meta">

                <span>
                    ${app.version}
                </span>

                <span>
                    ${app.size}
                </span>

                <span>
                    ${app.category}
                </span>

            </div>

            <a
                href="#"
                class="app-download"
                data-app="${app.id}"
            >
                View App
            </a>

        `;

        featuredContainer.appendChild(card);

    });

}


/* ================= LATEST APPS ================= */

function renderLatestApps(list) {

    if (!latestContainer) return;

    latestContainer.innerHTML = "";

    const latestApps =
        list.filter(app => app.latest);

    latestApps.forEach(app => {

        const item = document.createElement("article");

        item.className = "latest-item";

        item.innerHTML = `

            <div class="latest-icon">
                ${app.icon}
            </div>

            <div class="latest-info">

                <h3>
                    ${app.name}
                </h3>

                <p>
                    ${app.category} · ${app.size}
                </p>

            </div>

            <span class="latest-version">
                v${app.version}
            </span>

            <a
                href="#"
                class="latest-download"
                data-app="${app.id}"
            >
                →
            </a>

        `;

        latestContainer.appendChild(item);

    });

}


/* ================= INITIAL RENDER ================= */

renderFeaturedApps(apps);

renderLatestApps(apps);


/* ================= DOWNLOAD / VIEW BUTTON ================= */

document.addEventListener("click", function(event) {

    const button =
        event.target.closest("[data-app]");

    if (!button) return;

    event.preventDefault();

    const appId =
        Number(button.dataset.app);

    const app =
        apps.find(item => item.id === appId);

    if (!app) return;

    showToast(
        `${app.name} — App details will be connected soon.`
    );

});


/* ================= TOAST ================= */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* ================= MOBILE MENU ================= */

const menuBtn =
    document.getElementById("menuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");


menuBtn.addEventListener("click", function() {

    mobileMenu.classList.toggle("active");

});


/* Close mobile menu after clicking link */

document.querySelectorAll(".mobile-menu a")
    .forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("active");

        });

    });


/* ================= SEARCH ================= */

const searchBtn =
    document.getElementById("searchBtn");

const searchOverlay =
    document.getElementById("searchOverlay");

const searchInput =
    document.getElementById("searchInput");

const closeSearch =
    document.getElementById("closeSearch");


searchBtn.addEventListener("click", function() {

    searchOverlay.classList.add("active");

    setTimeout(() => {

        searchInput.focus();

    }, 100);

});


closeSearch.addEventListener("click", function() {

    searchOverlay.classList.remove("active");

    searchInput.value = "";

});


/* Close search when clicking outside */

searchOverlay.addEventListener("click", function(event) {

    if (event.target === searchOverlay) {

        searchOverlay.classList.remove("active");

    }

});


/* Search apps */

searchInput.addEventListener("input", function() {

    const query =
        this.value.toLowerCase().trim();

    if (!query) {

        renderFeaturedApps(apps);

        renderLatestApps(apps);

        return;

    }


    const results =
        apps.filter(app =>

            app.name.toLowerCase().includes(query) ||

            app.category.toLowerCase().includes(query) ||

            app.description.toLowerCase().includes(query)

        );


    renderFeaturedApps(results);

    renderLatestApps(results);

});


/* ================= CATEGORY FILTER ================= */

document.querySelectorAll(".category-card")
    .forEach(button => {

        button.addEventListener("click", function() {

            const category =
                this.dataset.category;

            const results =
                apps.filter(app =>
                    app.category === category
                );

            renderFeaturedApps(results);

            renderLatestApps(results);

            document
                .getElementById("apps")
                .scrollIntoView({
                    behavior: "smooth"
                });

        });

    });
