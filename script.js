// ============================================================
// HUNGER RELIEF NETWORK
// Complete frontend JavaScript
// ============================================================

let donations = [];
let nextId = 1;
let loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || null;
let loginEmail = "";


// ============================================================
// DOM ELEMENTS
// ============================================================

const views = document.querySelectorAll(".view");
const mainNav = document.getElementById("mainNav");

const homeLoginButton =
    document.getElementById("homeLoginButton");

const googleLoginButton =
    document.getElementById("googleLoginButton");

const googleLoginMessage =
    document.getElementById("googleLoginMessage");


// ============================================================
// VIEW CONTROL
// ============================================================

function showView(viewName) {

    const donorPages = [
        "donate",
        "dashboard"
    ];

    const volunteerPages = [
        "find",
        "volunteer"
    ];


    // --------------------------------------------------------
    // Donor protection
    // --------------------------------------------------------

    if (donorPages.includes(viewName)) {

        if (!loggedInUser) {

            showToast("Please login first.");
            showView("login");

            return;
        }

        if (loggedInUser.role !== "DONOR") {

            showToast(
                "This page is available only for donors."
            );

            return;
        }
    }


    // --------------------------------------------------------
    // Volunteer protection
    // --------------------------------------------------------

    if (volunteerPages.includes(viewName)) {

        if (!loggedInUser) {

            showToast("Please login first.");
            showView("login");

            return;
        }

        if (loggedInUser.role !== "VOLUNTEER") {

            showToast(
                "This page is available only for volunteers."
            );

            return;
        }
    }


    // --------------------------------------------------------
    // Impact protection
    // --------------------------------------------------------

    if (viewName === "impact") {

        if (!loggedInUser) {

            showToast("Please login first.");
            showView("login");

            return;
        }
    }


    // --------------------------------------------------------
    // Hide all views
    // --------------------------------------------------------

    views.forEach(view => {
        view.classList.remove("active");
    });


    // --------------------------------------------------------
    // Show requested view
    // --------------------------------------------------------

    const targetView =
        document.getElementById(
            "view-" + viewName
        );

    if (targetView) {
        targetView.classList.add("active");
    }


    // --------------------------------------------------------
    // Refresh relevant content
    // --------------------------------------------------------

    if (viewName === "donate") {
        renderMyDonations();
    }

    if (viewName === "find") {
        renderFind();
    }

    if (viewName === "impact") {
        renderImpact();
    }

    if (viewName === "dashboard") {
        renderDashboard();
    }

    if (viewName === "volunteer") {
        renderVolunteerDashboard();
    }
    
}


// ============================================================
// NAVIGATION
// ============================================================

function updateNavigation() {

    if (!mainNav) {
        return;
    }


    mainNav.innerHTML = "";


    // HOME
if (!loggedInUser) {
    const homeButton =
        document.createElement("button");

    homeButton.textContent = "Home";
    homeButton.dataset.view = "home";

    mainNav.appendChild(homeButton);
}


    // --------------------------------------------------------
    // NOT LOGGED IN
    // --------------------------------------------------------

    if (!loggedInUser) {

        const loginButton =
            document.createElement("button");

        loginButton.textContent = "Login";
        loginButton.dataset.view = "login";
        loginButton.id = "loginNavButton";

        mainNav.appendChild(loginButton);

        attachNavigationListeners();

        return;
    }
    
    


    // --------------------------------------------------------
    // DONOR
    // --------------------------------------------------------

    if (loggedInUser.role === "DONOR") {

        const donateButton =
            document.createElement("button");

        donateButton.textContent =
            "Donate Food";

        donateButton.dataset.view =
            "donate";


        const dashboardButton =
            document.createElement("button");

        dashboardButton.textContent =
            "Donor Dashboard";

        dashboardButton.dataset.view =
            "dashboard";


        const impactButton =
            document.createElement("button");

        impactButton.textContent =
            "My Records";

        impactButton.dataset.view =
            "impact";


        mainNav.appendChild(
            donateButton
        );

        mainNav.appendChild(
            dashboardButton
        );

        mainNav.appendChild(
            impactButton
        );
    }


    // --------------------------------------------------------
    // VOLUNTEER
    // --------------------------------------------------------

    if (loggedInUser.role === "VOLUNTEER") {

        const findButton =
            document.createElement("button");

        findButton.textContent =
            "Find & Deliver";

        findButton.dataset.view =
            "find";


        const volunteerButton =
            document.createElement("button");

        volunteerButton.textContent =
            "Volunteer Dashboard";

        volunteerButton.dataset.view =
            "volunteer";


        const impactButton =
            document.createElement("button");

        impactButton.textContent =
            "Records";

        impactButton.dataset.view =
            "impact";


        mainNav.appendChild(
            findButton
        );

        mainNav.appendChild(
            volunteerButton
        );

        mainNav.appendChild(
            impactButton
        );
    }


    // --------------------------------------------------------
    // LOGOUT
    // --------------------------------------------------------

    const profileButton =
    document.createElement("button");

profileButton.textContent = "👤 Profile";
profileButton.id = "profileNavButton";

mainNav.appendChild(profileButton);

profileButton.addEventListener("click", openProfileMenu);


    attachNavigationListeners();
}


// ============================================================
// NAVIGATION LISTENERS
// ============================================================

function attachNavigationListeners() {

    const navigationButtons =
        mainNav.querySelectorAll(
            "button[data-view]"
        );


    navigationButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                if (button.dataset.view === "login") {
    openLoginWindow();
    return;
}
navigationButtons.forEach(btn => {
    btn.classList.remove("active");
});

button.classList.add("active");
showView(button.dataset.view);

            }
        );

    });
}


// ============================================================
// LOGOUT
// ============================================================
function openProfileMenu() {
    document.getElementById("profileName").textContent =
        loggedInUser.name;

    document.getElementById("profileEmail").textContent =
        loggedInUser.email;

    document.getElementById("profileRole").textContent =
        loggedInUser.role;

    profileOverlay.classList.add("active");
}

function logoutUser() {

    loggedInUser = null;
    loginEmail = "";
    sessionStorage.removeItem("loggedInUser");

    updateNavigation();

    showView("home");

    showToast(
        "Logged out successfully."
    );
}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


// ============================================================
// TIME AGO
// ============================================================

function timeAgo(dateValue) {

    if (!dateValue) {
        return "Just now";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return "Just now";
    }


    const now =
        new Date();


    const seconds =
        Math.floor(
            (now - date) / 1000
        );


    if (seconds < 60) {
        return "Just now";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return (
            minutes +
            " min ago"
        );
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return (
            hours +
            " hr ago"
        );
    }


    const days =
        Math.floor(
            hours / 24
        );


    return (
        days +
        " day" +
        (days === 1 ? "" : "s") +
        " ago"
    );
}


// ============================================================
// STATUS LABEL
// ============================================================

function statusLabel(status) {

    const labels = {

        available: "Available",

        accepted: "Accepted",

        picked_up: "Picked up",

        delivered: "Delivered"

    };


    return (
        labels[status] ||
        status ||
        "Unknown"
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// LOAD DONATIONS
// ============================================================

async function loadDonations() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/donations"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load donations"
            );
        }


        const data =
            await response.json();


        donations =
            data.map(donation => {

                return {

                    ...donation,

                    donationId:
                        Number(
                            donation.donationId
                        )

                };

            });


        if (donations.length > 0) {

            nextId =
                Math.max(
                    ...donations.map(
                        d =>
                            Number(
                                d.donationId
                            )
                    )
                ) + 1;
        }


        renderAll();
        
        if (
    loggedInUser &&
    loggedInUser.role === "volunteer"
) {
    showToast(
        "New donation information updated."
    );
}



    } catch (error) {

        console.error(
            "Error loading donations:",
            error
        );

    }
}


// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {

    renderStats();

    renderMyDonations();

    renderFind();

    renderImpact();

    renderDashboard();

    renderVolunteerDashboard();
}


// ============================================================
// DONATION FORM
// ============================================================

const donateForm =
    document.getElementById(
        "donateForm"
    );


if (donateForm) {

    donateForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (
                !loggedInUser ||
                loggedInUser.role !== "DONOR"
            ) {

                showToast(
                    "Only donors can post food."
                );

                return;
            }


            const donorName =
                document
                    .getElementById("d_name")
                    .value
                    .trim();


            const donorType =
                document
                    .getElementById("d_type")
                    .value;


            const food =
                document
                    .getElementById("d_food")
                    .value
                    .trim();


            const quantity =
                parseInt(
                    document
                        .getElementById("d_qty")
                        .value
                );


            const location =
                document
                    .getElementById("d_loc")
                    .value
                    .trim();


            const expiryHrs =
                parseInt(
                    document
                        .getElementById("d_expiry")
                        .value
                );


            const notes =
                document
                    .getElementById("d_notes")
                    .value
                    .trim();


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/donations",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    loggedInUser.userId,

                                donor:
                                    donorName,

                                donorType:
                                    donorType,

                                food:
                                    food,

                                quantity:
                                    quantity,

                                location:
                                    location,

                                expiryHrs:
                                    expiryHrs,

                                notes:
                                    notes

                            })

                        }
                    );


                const savedDonation =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        savedDonation.message ||
                        "Donation failed"
                    );
                }


                donations.unshift(
                    savedDonation
                );


                donateForm.reset();


                showToast(
                    "Donation posted successfully!"
                );


                renderAll();

            } catch (error) {

                console.error(
                    "Donation error:",
                    error
                );


                showToast(
                    "Unable to post donation."
                );
            }

        }
    );
}


// ============================================================
// MY DONATIONS
// ============================================================

function renderMyDonations() {

    const container =
        document.getElementById(
            "myDonationsList"
        );


    if (!container) {
        return;
    }


    if (
        !loggedInUser ||
        loggedInUser.role !== "DONOR"
    ) {

        container.innerHTML = `
            <div class="empty">
                Login as a donor to view your donations.
            </div>
        `;

        return;
    }


    const myDonations =
        donations.filter(
            donation =>
                Number(
                    donation.userId
                ) === Number(
                    loggedInUser.userId
                )
        );


    if (myDonations.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Nothing posted yet — your donations
                will show up here.
            </div>
        `;

        return;
    }


    container.innerHTML =
        myDonations
            .map(donation => {

                return `

                    <div class="donation-card">

                        <div class="donation-main">

                            <h4>
                                ${escapeHtml(
                                    donation.food
                                )}
                            </h4>

                            <p>
                                ${escapeHtml(
                                    donation.quantity
                                )}
                                servings
                            </p>

                            <p>
                                📍
                                ${escapeHtml(
                                    donation.location
                                )}
                            </p>

                        </div>

                        <div class="donation-meta">

                            <strong>
                                ${statusLabel(
                                    donation.status
                                )}
                            </strong>

                            <br>

                            ${timeAgo(
                                donation.createdAt
                            )}

                        </div>

                    </div>

                `;

            })
            .join("");
}


// ============================================================
// FIND DONATIONS
// ============================================================

function renderFind() {

    const container =
        document.getElementById(
            "findList"
        );


    if (!container) {
        return;
    }


    if (
        !loggedInUser ||
        loggedInUser.role !== "VOLUNTEER"
    ) {

        container.innerHTML = `
            <div class="empty">
                Login as a volunteer to find and deliver donations.
            </div>
        `;

        return;
    }


    const searchInput =
        document.getElementById(
            "donationSearch"
        );


    const statusSelect =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusSelect
            ? statusSelect.value
            : "all";


    const filtered =
        donations.filter(
            donation => {

                const matchesSearch =

                    !search ||

                    String(
                        donation.food || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        donation.donor || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        donation.location || ""
                    )
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =

                    selectedStatus === "all" ||

                    donation.status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No matching donations found.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(
                donation =>
                    renderDonationCard(
                        donation
                    )
            )
            .join("");
}


// ============================================================
// DONATION CARD
// ============================================================

function renderDonationCard(
    donation
) {

    let actionButton = "";


    if (
        donation.status ===
        "available"
    ) {

        actionButton = `

            <button
                class="primary"
                onclick="acceptDonation(${Number(
                    donation.donationId
                )})"
            >
                Accept Donation
            </button>

        `;
    }


    else if (
        donation.status ===
        "accepted"
    ) {

        actionButton = `

            <button
                class="primary"
                onclick="advanceStatus(
                    ${Number(
                        donation.donationId
                    )},
                    'picked_up'
                )"
            >
                Mark Picked Up
            </button>

        `;
    }


    else if (
        donation.status ===
        "picked_up"
    ) {

        actionButton = `

            <button
                class="primary"
                onclick="advanceStatus(
                    ${Number(
                        donation.donationId
                    )},
                    'delivered'
                )"
            >
                Mark Delivered
            </button>

        `;
    }


    else {

        actionButton = `

            <span class="donation-meta">
                ✓ Successfully delivered
            </span>

        `;
    }


    return `

        <div class="donation-card">

            <div class="donation-main">

                <h3>
                    ${escapeHtml(
                        donation.food
                    )}
                </h3>

                <p>
                    🏪
                    ${escapeHtml(
                        donation.donor ||
                        "Unknown donor"
                    )}
                </p>

                <p>
                    🍽️
                    ${escapeHtml(
                        donation.quantity
                    )}
                    servings
                </p>

                <p>
                    📍
                    ${escapeHtml(
                        donation.location
                    )}
                </p>

                ${
                    donation.notes
                        ? `
                            <p>
                                📝
                                ${escapeHtml(
                                    donation.notes
                                )}
                            </p>
                        `
                        : ""
                }

            </div>


            <div class="donation-side">

                <div class="status">

                    ${statusLabel(
                        donation.status
                    )}

                </div>


                <div class="donation-meta">

                    Safe for
                    ${escapeHtml(
                        donation.expiryHrs
                    )}
                    hour(s)

                    <br>

                    ${timeAgo(
                        donation.createdAt
                    )}

                </div>


                <div style="margin-top:12px;">

                    ${actionButton}

                </div>

            </div>

        </div>

    `;
}


// ============================================================
// ACCEPT DONATION
// ============================================================

async function acceptDonation(
    donationId
) {

    if (
        !loggedInUser ||
        loggedInUser.role !== "VOLUNTEER"
    ) {

        showToast(
            "Only volunteers can accept donations."
        );

        return;
    }


    const volunteerName =
        prompt(
            "Enter your name or NGO name:"
        );


    if (!volunteerName) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:3000/api/donations/${donationId}/accept`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        acceptedBy:
                            loggedInUser.userId

                    })

                }
            );


        const updatedDonation =
            await response.json();


        if (!response.ok) {

            throw new Error(
                updatedDonation.message ||
                "Unable to accept donation"
            );
        }


        const index =
            donations.findIndex(
                donation =>
                    Number(
                        donation.donationId
                    ) ===
                    Number(donationId)
            );


        if (index !== -1) {

            donations[index] =
                updatedDonation;
        }


        showToast(
            "Donation accepted!"
        );


        renderAll();

    } catch (error) {

        console.error(
            "Accept donation error:",
            error
        );


        showToast(
            "Unable to accept donation."
        );
    }
}


// ============================================================
// ADVANCE STATUS
// ============================================================

async function advanceStatus(
    donationId,
    newStatus
) {

    if (
        !loggedInUser ||
        loggedInUser.role !== "VOLUNTEER"
    ) {

        showToast(
            "Only volunteers can update donation status."
        );

        return;
    }


    let endpoint = "";


    if (newStatus === "picked_up") {

        endpoint =
            `http://localhost:3000/api/donations/${donationId}/pickup`;
    }


    else if (newStatus === "delivered") {

        endpoint =
            `http://localhost:3000/api/donations/${donationId}/deliver`;
    }


    else {

        return;
    }


    try {

        const response =
            await fetch(
                endpoint,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
    volunteerId: loggedInUser.userId
})

                }
            );


        const updatedDonation =
            await response.json();


        if (!response.ok) {

            throw new Error(
                updatedDonation.message ||
                "Unable to update status"
            );
        }


        const index =
            donations.findIndex(
                donation =>
                    Number(
                        donation.donationId
                    ) ===
                    Number(donationId)
            );


        if (index !== -1) {

            donations[index] =
                updatedDonation;
        }


        showToast(
            "Donation status updated."
        );


        renderAll();

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showToast(
            "Unable to update donation."
        );
    }
}


// ============================================================
// IMPACT & RECORDS
// ============================================================

function renderImpact() {

    const totalElement =
        document.getElementById(
            "m_total"
        );


    const deliveredElement =
        document.getElementById(
            "m_delivered"
        );


    const weightElement =
        document.getElementById(
            "m_weight"
        );


    const recordsBody =
        document.getElementById(
            "recordsBody"
        );


    if (
        !totalElement ||
        !deliveredElement ||
        !weightElement ||
        !recordsBody
    ) {

        return;
    }


    let visibleDonations =
        donations;


    // Donors see their own records
    if (
        loggedInUser &&
        loggedInUser.role === "DONOR"
    ) {

        visibleDonations =
            donations.filter(
                donation =>
                    Number(
                        donation.userId
                    ) === Number(
                        loggedInUser.userId
                    )
            );
    }


    totalElement.textContent =
        visibleDonations.length;


    const delivered =
        visibleDonations.filter(
            donation =>
                donation.status ===
                "delivered"
        );


    deliveredElement.textContent =
        delivered.length;


    const totalWeight =
        visibleDonations.reduce(
            (
                total,
                donation
            ) => {

                return (
                    total +
                    (
                        Number(
                            donation.quantity
                        ) || 0
                    ) * 0.4
                );

            },
            0
        );


    weightElement.textContent =
        totalWeight.toFixed(1) +
        " kg";


    if (
        visibleDonations.length === 0
    ) {

        recordsBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        color:var(--text-muted);
                        text-align:center;
                        padding:30px;
                    "
                >
                    No records yet.
                </td>

            </tr>

        `;

        return;
    }


    recordsBody.innerHTML =
        visibleDonations
            .map(donation => {

                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                donation.food
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                donation.donor
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                donation.quantity
                            )}
                        </td>

                        <td>
                            ${statusLabel(
                                donation.status
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                donation.acceptedBy ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${timeAgo(
                                donation.createdAt
                            )}
                        </td>

                    </tr>

                `;

            })
            .join("");
}


// ============================================================
// GENERAL STATS
// ============================================================

function renderStats() {

    const statMeals =
        document.getElementById(
            "statMeals"
        );


    const statActive =
        document.getElementById(
            "statActive"
        );


    const statCO2 =
        document.getElementById(
            "statCO2"
        );


    if (
        !statMeals ||
        !statActive ||
        !statCO2
    ) {

        return;
    }


    const delivered =
        donations.filter(
            donation =>
                donation.status ===
                "delivered"
        );


    const active =
        donations.filter(
            donation =>
                donation.status !==
                "delivered"
        );


    // --------------------------------------------------------
    // FIXED SYNTAX HERE
    // --------------------------------------------------------

    const deliveredMeals =
        delivered.reduce(
            (
                total,
                donation
            ) => {

                return (
                    total +
                    (
                        Number(
                            donation.quantity
                        ) || 0
                    )
                );

            },
            0
        );


    const totalWeight =
        delivered.reduce(
            (
                total,
                donation
            ) => {

                return (
                    total +
                    (
                        Number(
                            donation.quantity
                        ) || 0
                    ) * 0.4
                );

            },
            0
        );


    const co2 =
        totalWeight * 2.5;


    statMeals.textContent =
        deliveredMeals;


    statActive.textContent =
        active.length;


    statCO2.textContent =
        co2.toFixed(1) +
        " kg";
}


// ============================================================
// DONOR DASHBOARD
// ============================================================

function renderDashboard() {

    const welcome =
        document.getElementById(
            "dashboardWelcome"
        );


    const totalElement =
        document.getElementById(
            "dashboardTotal"
        );


    const activeElement =
        document.getElementById(
            "dashboardActive"
        );


    const deliveredElement =
        document.getElementById(
            "dashboardDelivered"
        );


    const list =
        document.getElementById(
            "dashboardDonationList"
        );


    if (
        !welcome ||
        !totalElement ||
        !activeElement ||
        !deliveredElement ||
        !list
    ) {

        return;
    }


    if (
        !loggedInUser ||
        loggedInUser.role !== "DONOR"
    ) {

        welcome.textContent =
            "Login as a donor to access your dashboard.";

        totalElement.textContent =
            "0";

        activeElement.textContent =
            "0";

        deliveredElement.textContent =
            "0";


        list.innerHTML = `

            <div class="empty">
                Donor dashboard is available only
                to donor accounts.
            </div>

        `;

        return;
    }


    welcome.textContent =
        "Welcome, " +
        loggedInUser.name +
        "!";


    const myDonations =
        donations.filter(
            donation =>
                Number(
                    donation.userId
                ) === Number(
                    loggedInUser.userId
                )
        );


    const active =
        myDonations.filter(
            donation =>
                donation.status !==
                "delivered"
        );


    const delivered =
        myDonations.filter(
            donation =>
                donation.status ===
                "delivered"
        );


    totalElement.textContent =
        myDonations.length;


    activeElement.textContent =
        active.length;


    deliveredElement.textContent =
        delivered.length;


    if (
        myDonations.length === 0
    ) {

        list.innerHTML = `

            <div class="empty">
                No donations yet.
            </div>

        `;

        return;
    }


    list.innerHTML =
        myDonations
            .map(donation => {

                return `

                    <div class="donation-card">

                        <div class="donation-main">

                            <h3>
                                ${escapeHtml(
                                    donation.food
                                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    donation.quantity
                                )}
                                servings
                            </p>

                            <p>
                                📍
                                ${escapeHtml(
                                    donation.location
                                )}
                            </p>

                        </div>

                        <div class="donation-meta">

                            <strong>
                                ${statusLabel(
                                    donation.status
                                )}
                            </strong>

                            <br>

                            Accepted by:
                            ${
                                escapeHtml(
                                    donation.acceptedBy ||
                                    "Not yet accepted"
                                )
                            }

                        </div>

                    </div>

                `;

            })
            .join("");
}


// ============================================================
// VOLUNTEER DASHBOARD
// ============================================================

function renderVolunteerDashboard() {

    const availableElement =
        document.getElementById(
            "volAvailable"
        );

    const volunteerWelcome =
    document.getElementById(
        "volunteerWelcome"
    );    


    const acceptedElement =
        document.getElementById(
            "volAccepted"
        );


    const deliveredElement =
        document.getElementById(
            "volDelivered"
        );


    const list =
        document.getElementById(
            "volunteerDonationList"
        );


    if (
        !availableElement ||
        !acceptedElement ||
        !deliveredElement ||
        !list
    ) {

        return;
    }


    if (
        !loggedInUser ||
        loggedInUser.role !== "VOLUNTEER"
    ) {

        availableElement.textContent =
            "0";

        acceptedElement.textContent =
            "0";

        deliveredElement.textContent =
            "0";


        list.innerHTML = `

            <div class="empty">
                Volunteer dashboard is available
                only to volunteer accounts.
            </div>

        `;

        return;
    }

    volunteerWelcome.textContent =
    "Welcome, " +
    loggedInUser.name +
    "!";

    const available =
        donations.filter(
            donation =>
                donation.status ===
                "available"
        );


    const accepted =
        donations.filter(
            donation =>
                donation.status ===
                    "accepted" ||
                donation.status ===
                    "picked_up"
        );


    const delivered =
        donations.filter(
            donation =>
                donation.status ===
                "delivered"
        );


    availableElement.textContent =
        available.length;


    acceptedElement.textContent =
        accepted.length;


    deliveredElement.textContent =
        delivered.length;


    if (
        donations.length === 0
    ) {

        list.innerHTML = `

            <div class="empty">
                No donations available.
            </div>

        `;

        return;
    }


    list.innerHTML =
        donations
            .map(
                donation =>
                    renderVolunteerDonationCard(
                        donation
                    )
            )
            .join("");
}


// ============================================================
// VOLUNTEER DONATION CARD
// ============================================================

function renderVolunteerDonationCard(
    donation
) {

    let action = "";


    if (
        donation.status ===
        "available"
    ) {

        action = `

            <button
                class="primary"
                onclick="acceptDonation(${Number(
                    donation.donationId
                )})"
            >
                Accept
            </button>

        `;
    }


    else if (
        donation.status ===
        "accepted"
    ) {

        action = `

            <button
                class="primary"
                onclick="advanceStatus(
                    ${Number(
                        donation.donationId
                    )},
                    'picked_up'
                )"
            >
                Picked Up
            </button>

        `;
    }


    else if (
        donation.status ===
        "picked_up"
    ) {

        action = `

            <button
                class="primary"
                onclick="advanceStatus(
                    ${Number(
                        donation.donationId
                    )},
                    'delivered'
                )"
            >
                Delivered
            </button>

        `;
    }


    else {

        action = `

            <span class="donation-meta">
                ✓ Delivered
            </span>

        `;
    }


    return `

        <div class="donation-card">

            <div class="donation-main">

                <h3>
                    ${escapeHtml(
                        donation.food
                    )}
                </h3>

                <p>
                    🏪
                    ${escapeHtml(
                        donation.donor
                    )}
                </p>

                <p>
                    🍽️
                    ${escapeHtml(
                        donation.quantity
                    )}
                    servings
                </p>

                <p>
                    📍
                    ${escapeHtml(
                        donation.location
                    )}
                </p>

            </div>


            <div class="donation-side">

                <strong>
                    ${statusLabel(
                        donation.status
                    )}
                </strong>


                <div class="donation-meta">

                    ${timeAgo(
                        donation.createdAt
                    )}

                </div>


                <div style="margin-top:12px;">

                    ${action}

                </div>

            </div>

        </div>

    `;
}


// ============================================================
// SEARCH
// ============================================================

const donationSearch =
    document.getElementById(
        "donationSearch"
    );


if (donationSearch) {

    donationSearch.addEventListener(
        "input",
        renderFind
    );
}


const statusFilter =
    document.getElementById(
        "statusFilter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderFind
    );
}


// ============================================================
// REFRESH FIND
// ============================================================

const refreshFind =
    document.getElementById(
        "refreshFind"
    );


if (refreshFind) {

    refreshFind.addEventListener(
        "click",
        async function () {

            await loadDonations();

            showToast(
                "Donation list refreshed."
            );

        }
    );
}


// ============================================================
// REGISTER
// ============================================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "register_name"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "register_email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "register_password"
                    )
                    .value;


            const role =
                document
                    .getElementById(
                        "register_role"
                    )
                    .value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/users/register",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                password:
                                    password,

                                role:
                                    role

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    if (message) {

                        message.textContent =
                            data.message ||
                            "Registration failed.";
                    }

                    return;
                }


                if (message) {

                    message.textContent =
                        "Account created successfully! You can now login.";
                }


                registerForm.reset();


                showToast(
                    "Account created successfully."
                );

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                if (message) {

                    message.textContent =
                        "Unable to connect to the server.";
                }
            }

        }
    );
}


// ============================================================
// LOGIN POPUP ELEMENTS
// ============================================================

const loginOverlay =
    document.getElementById(
        "loginOverlay"
    );

const registerOverlay = document.getElementById("registerOverlay");
const openRegisterPopup = document.getElementById("openRegisterPopup");
const closeRegister = document.getElementById("closeRegister");

const profileOverlay = document.getElementById("profileOverlay");
const closeProfile = document.getElementById("closeProfile");
const profileLogoutButton =
    document.getElementById("profileLogoutButton");

openRegisterPopup.addEventListener("click", () => {
    registerOverlay.classList.add("active");
});

closeRegister.addEventListener("click", () => {
    registerOverlay.classList.remove("active");
});

closeProfile.addEventListener("click", () => {
    profileOverlay.classList.remove("active");
});

profileLogoutButton.addEventListener("click", () => {
    profileOverlay.classList.remove("active");
    logoutUser();
});

const openLoginPopup =
    document.getElementById(
        "openLoginPopup"
    );


const closeLogin =
    document.getElementById(
        "closeLogin"
    );


const emailNextButton =
    document.getElementById(
        "emailNextButton"
    );


const popupLoginButton =
    document.getElementById(
        "popupLoginButton"
    );


const loginBackButton =
    document.getElementById(
        "loginBackButton"
    );


const popupLoginEmail =
    document.getElementById(
        "popupLoginEmail"
    );


const popupLoginPassword =
    document.getElementById(
        "popupLoginPassword"
    );


const loginEmailDisplay =
    document.getElementById(
        "loginEmailDisplay"
    );


const loginStepEmail =
    document.getElementById(
        "loginStepEmail"
    );


const loginStepPassword =
    document.getElementById(
        "loginStepPassword"
    );


const popupLoginMessage =
    document.getElementById(
        "popupLoginMessage"
    );


// ============================================================
// OPEN LOGIN POPUP
// ============================================================

function openLoginWindow() {

    if (!loginOverlay) {
        return;
    }


    loginOverlay.classList.add(
        "open"
    );


    if (loginStepEmail) {

        loginStepEmail.style.display =
            "block";
    }


    if (loginStepPassword) {

        loginStepPassword.style.display =
            "none";
    }


    if (popupLoginMessage) {

        popupLoginMessage.textContent =
            "";
    }


    if (popupLoginPassword) {

        popupLoginPassword.value =
            "";
    }
}


// ============================================================
// OPEN LOGIN
// ============================================================

if (openLoginPopup) {

    openLoginPopup.addEventListener(
        "click",
        openLoginWindow
    );
}


// ============================================================
// CLOSE LOGIN
// ============================================================

if (closeLogin) {

    closeLogin.addEventListener(
        "click",
        function () {

            loginOverlay.classList.remove(
                "open"
            );

        }
    );
}


// ============================================================
// EMAIL NEXT
// ============================================================

if (emailNextButton) {

    emailNextButton.addEventListener(
        "click",
        function () {

            const email =
                popupLoginEmail
                    ? popupLoginEmail.value
                        .trim()
                    : "";


            if (!email) {

                if (popupLoginMessage) {

                    popupLoginMessage.textContent =
                        "Please enter your email.";
                }

                return;
            }


            loginEmail =
                email;


            if (loginEmailDisplay) {

                loginEmailDisplay.textContent =
                    email;
            }


            if (loginStepEmail) {

                loginStepEmail.style.display =
                    "none";
            }


            if (loginStepPassword) {

                loginStepPassword.style.display =
                    "block";
            }


            if (popupLoginMessage) {

                popupLoginMessage.textContent =
                    "";
            }


            if (popupLoginPassword) {

                popupLoginPassword.focus();
            }
        }
    );
}


// ============================================================
// LOGIN BACK
// ============================================================

if (loginBackButton) {

    loginBackButton.addEventListener(
        "click",
        function () {

            if (loginStepEmail) {

                loginStepEmail.style.display =
                    "block";
            }


            if (loginStepPassword) {

                loginStepPassword.style.display =
                    "none";
            }


            if (popupLoginMessage) {

                popupLoginMessage.textContent =
                    "";
            }
        }
    );
}


// ============================================================
// LOGIN
// ============================================================

if (popupLoginButton) {

    popupLoginButton.addEventListener(
        "click",
        async function () {

            const email =
                loginEmail ||
                (
                    popupLoginEmail
                        ? popupLoginEmail.value.trim()
                        : ""
                );


            const password =
                popupLoginPassword
                    ? popupLoginPassword.value
                    : "";


            if (!email) {

                if (popupLoginMessage) {

                    popupLoginMessage.textContent =
                        "Please enter your email.";
                }

                return;
            }


            if (!password) {

                if (popupLoginMessage) {

                    popupLoginMessage.textContent =
                        "Please enter your password.";
                }

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/users/login",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email:
                                    email,

                                password:
                                    password

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    if (popupLoginMessage) {

                        popupLoginMessage.textContent =
                            data.message ||
                            "Invalid email or password.";
                    }

                    return;
                }


                // ------------------------------------------------
                // LOGIN SUCCESS
                // ------------------------------------------------

                loggedInUser = {

                    userId:
                        data.userId,

                    name:
                        data.name,

                    email:
                        data.email,

                    role:
                        String(
                            data.role
                        ).toUpperCase()

                };
                sessionStorage.setItem(
    "loggedInUser",
    JSON.stringify(loggedInUser)
);


                // Close popup
                if (loginOverlay) {

                    loginOverlay.classList.remove(
                        "open"
                    );
                }


                if (popupLoginPassword) {

                    popupLoginPassword.value =
                        "";
                }


                if (popupLoginMessage) {

                    popupLoginMessage.textContent =
                        "";
                }


                // Update navigation
                updateNavigation();


                // ------------------------------------------------
                // DONOR
                // ------------------------------------------------

                if (
                    loggedInUser.role ===
                    "DONOR"
                ) {

                    showView(
                        "donate"
                    );

                    renderMyDonations();

                    showToast(
                        "Welcome, " +
                        loggedInUser.name +
                        "!"
                    );
                }


                // ------------------------------------------------
                // VOLUNTEER
                // ------------------------------------------------

                else if (
                    loggedInUser.role ===
                    "VOLUNTEER"
                ) {

                    showView(
                        "volunteer"
                    );

                    renderVolunteerDashboard();

                    showToast(
                        "Welcome, " +
                        loggedInUser.name +
                        "!"
                    );
                }


                // ------------------------------------------------
                // OTHER ROLE
                // ------------------------------------------------

                else {

                    showView(
                        "home"
                    );

                    showToast(
                        "Login successful."
                    );
                }


                renderAll();

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                if (popupLoginMessage) {

                    popupLoginMessage.textContent =
                        "Unable to connect to the server.";
                }
            }

        }
    );
}


// ============================================================
// HOME LOGIN BUTTON
// ============================================================

if (homeLoginButton) {

    homeLoginButton.addEventListener(
        "click",
        function () {

            showView(
                "login"
            );

        }
    );
}

// ============================================================
// HOME HERO BUTTONS
// ============================================================

const heroDonateButton =
    document.getElementById("heroDonateButton");

const heroVolunteerButton =
    document.getElementById("heroVolunteerButton");

const finalDonateButton =
    document.getElementById("finalDonateButton");

const finalVolunteerButton =
    document.getElementById("finalVolunteerButton");


function openDonateFromHome() {
    if (!loggedInUser) {
        openLoginWindow();
        return;
    }

    if (loggedInUser.role !== "DONOR") {
        showToast("Please login with a donor account.");
        return;
    }

    showView("donate");
}


function openVolunteerFromHome() {
    if (!loggedInUser) {
        openLoginWindow();
        return;
    }

    if (loggedInUser.role !== "VOLUNTEER") {
        showToast("Please login with a volunteer account.");
        return;
    }

    showView("volunteer");
}


if (heroDonateButton) {
    heroDonateButton.addEventListener(
        "click",
        openDonateFromHome
    );
}

if (heroVolunteerButton) {
    heroVolunteerButton.addEventListener(
        "click",
        openVolunteerFromHome
    );
}

if (finalDonateButton) {
    finalDonateButton.addEventListener(
        "click",
        openDonateFromHome
    );
}

if (finalVolunteerButton) {
    finalVolunteerButton.addEventListener(
        "click",
        openVolunteerFromHome
    );
}

// ============================================================
// GOOGLE LOGIN BUTTON
// ============================================================

if (googleLoginButton) {

    googleLoginButton.addEventListener(
        "click",
        function () {

            if (googleLoginMessage) {

                googleLoginMessage.textContent =
                    "Google login will be connected using Google OAuth.";
            }


            showToast(
                "Google login setup is coming next."
            );

        }
    );
}


// ============================================================
// INITIAL NAVIGATION
// ============================================================

updateNavigation();


// ============================================================
// INITIAL VIEW
// ============================================================

if (loggedInUser) {
    if (loggedInUser.role === "DONOR") {
        showView("donate");
    } else if (loggedInUser.role === "VOLUNTEER") {
        showView("volunteer");
    } else {
        showView("home");
    }
} else {
    showView("home");
}


// ============================================================
// LOAD DATABASE DATA
// ============================================================

loadDonations();


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.acceptDonation =
    acceptDonation;

window.advanceStatus =
    advanceStatus;

window.renderFind =
    renderFind;

window.showView =
    showView;

window.logoutUser =
    logoutUser;