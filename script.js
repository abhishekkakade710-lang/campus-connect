// =================================
// CAMPUSCONNECT JAVASCRIPT
// =================================

// DATABASE USING LOCAL STORAGE

let users = JSON.parse(localStorage.getItem("cc_users")) || [
    {
        id: 1,
        name: "Demo Student",
        email: "student@campus.com",
        password: "12345",
        role: "student"
    },
    {
        id: 2,
        name: "Admin",
        email: "admin@campus.com",
        password: "admin123",
        role: "admin"
    }
];

let items = JSON.parse(localStorage.getItem("cc_items")) || [
    {
        id: 1,
        userId: 1,
        name: "Black Backpack",
        type: "Lost",
        category: "Bags",
        location: "Library",
        date: "2026-11-02",
        description: "Black backpack lost near the library.",
        image: "",
        status: "Open"
    },
    {
        id: 2,
        userId: 1,
        name: "Scientific Calculator",
        type: "Found",
        category: "Electronics",
        location: "Computer Lab",
        date: "2026-11-03",
        description: "Calculator found in the computer lab.",
        image: "",
        status: "Open"
    }
];

let helpRequests = JSON.parse(localStorage.getItem("cc_help")) || [];

let currentUser = JSON.parse(localStorage.getItem("cc_currentUser")) || null;


// SAVE DATA

function saveData() {
    localStorage.setItem("cc_users", JSON.stringify(users));
    localStorage.setItem("cc_items", JSON.stringify(items));
    localStorage.setItem("cc_help", JSON.stringify(helpRequests));
    localStorage.setItem("cc_currentUser", JSON.stringify(currentUser));

    updateStats();
}


// =================================
// PAGE NAVIGATION
// =================================

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    let page = document.getElementById(pageName);

    if (page) {
        page.classList.add("active");
    }

    document.getElementById("navMenu").classList.remove("open");

    if (pageName === "browse") {
        displayItems();
    }

    if (pageName === "reports") {
        displayMyReports();
    }

    if (pageName === "dashboard") {
        displayDashboard();
    }

    if (pageName === "admin") {
        displayAdmin();
    }

    if (pageName === "home") {
        updateStats();
    }

    window.scrollTo(0, 0);
}


// MOBILE MENU

function toggleMenu() {
    document.getElementById("navMenu").classList.toggle("open");
}


// =================================
// NOTIFICATION
// =================================

function showMessage(message) {

    let toast = document.getElementById("toast");

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// =================================
// LOGIN CHECK
// =================================

function checkLogin(page) {

    if (!currentUser) {
        showMessage("Please login first!");
        showPage("login");
        return;
    }

    showPage(page);
}


// =================================
// REGISTRATION
// =================================

document.getElementById("registerForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    let name = document.getElementById("regName").value.trim();

    let email = document.getElementById("regEmail").value.trim().toLowerCase();

    let password = document.getElementById("regPassword").value;

    let confirmPassword = document.getElementById("regConfirm").value;

    if (password !== confirmPassword) {
        showMessage("Passwords do not match!");
        return;
    }

    let existingUser = users.find(user => user.email === email);

    if (existingUser) {
        showMessage("Email already registered!");
        return;
    }

    let newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        role: "student"
    };

    users.push(newUser);

    currentUser = newUser;

    saveData();

    showMessage("Registration successful!");

    this.reset();

    updateNavigation();

    showPage("dashboard");

});


// =================================
// LOGIN
// =================================

document.getElementById("loginForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    let email = document.getElementById("loginEmail").value.trim().toLowerCase();

    let password = document.getElementById("loginPassword").value;

    let user = users.find(u =>
        u.email === email && u.password === password
    );

    if (!user) {
        showMessage("Invalid email or password!");
        return;
    }

    currentUser = user;

    saveData();

    updateNavigation();

    this.reset();

    showMessage("Login successful!");

    if (user.role === "admin") {
        showPage("admin");
    } else {
        showPage("dashboard");
    }

});


// =================================
// NAVIGATION UPDATE
// =================================

function updateNavigation() {

    let loggedIn = currentUser !== null;

    document.getElementById("loginNav")
    .classList.toggle("hidden", loggedIn);

    document.getElementById("registerNav")
    .classList.toggle("hidden", loggedIn);

    document.getElementById("logoutNav")
    .classList.toggle("hidden", !loggedIn);

}


// =================================
// LOGOUT
// =================================

function logout() {

    currentUser = null;

    localStorage.removeItem("cc_currentUser");

    updateNavigation();

    showMessage("Logged out successfully!");

    showPage("home");

}


// =================================
// REPORT LOST / FOUND ITEM
// =================================

document.getElementById("itemForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    if (!currentUser) {
        showPage("login");
        return;
    }

    let newItem = {

        id: Date.now(),

        userId: currentUser.id,

        name: document.getElementById("itemName").value,

        type: document.getElementById("reportType").value,

        category: document.getElementById("itemCategory").value,

        location: document.getElementById("itemLocation").value,

        date: document.getElementById("itemDate").value,

        description: document.getElementById("itemDescription").value,

        image: document.getElementById("itemImage").value,

        status: "Open"

    };

    items.unshift(newItem);

    saveData();

    this.reset();

    showMessage("Item reported successfully!");

    showPage("reports");

});


// =================================
// DISPLAY LOST & FOUND ITEMS
// =================================

function displayItems() {

    let grid = document.getElementById("itemGrid");

    let search = document.getElementById("searchInput").value.toLowerCase();

    let type = document.getElementById("typeFilter").value;

    let category = document.getElementById("categoryFilter").value;

    let filteredItems = items.filter(item => {

        let matchName = item.name.toLowerCase().includes(search);

        let matchType = type === "All" || item.type === type;

        let matchCategory = category === "All" || item.category === category;

        return matchName && matchType && matchCategory &&
               item.status !== "Removed";

    });

    grid.innerHTML = "";

    if (filteredItems.length === 0) {

        grid.innerHTML = "<p>No items found!</p>";

        return;

    }

    filteredItems.forEach(item => {

        let imageContent = item.image
            ? `<img src="${escapeHTML(item.image)}" alt="Item image">`
            : "📦";

        grid.innerHTML += `

            <div class="item-card">

                <div class="item-image">
                    ${imageContent}
                </div>

                <div class="item-content">

                    <h3>${escapeHTML(item.name)}</h3>

                    <p>Type: ${escapeHTML(item.type)}</p>

                    <p>Category: ${escapeHTML(item.category)}</p>

                    <p>Location: ${escapeHTML(item.location)}</p>

                    <p>Date: ${escapeHTML(item.date)}</p>

                    <button class="btn primary-btn"
                    onclick="showDetails(${item.id})">

                        View Details

                    </button>

                </div>

            </div>

        `;

    });

}


// SEARCH AND FILTER

document.getElementById("searchInput")
.addEventListener("input", displayItems);

document.getElementById("typeFilter")
.addEventListener("change", displayItems);

document.getElementById("categoryFilter")
.addEventListener("change", displayItems);


// =================================
// ITEM DETAILS
// =================================

function showDetails(id) {

    let item = items.find(i => i.id === id);

    if (!item) return;

    let imageContent = item.image
        ? `<img src="${escapeHTML(item.image)}" alt="Item image">`
        : "📦";

    document.getElementById("itemDetails").innerHTML = `

        <div class="details-layout">

            <div class="details-image">

                ${imageContent}

            </div>

            <div class="details-content">

                <h2>${escapeHTML(item.name)}</h2>

                <p><b>Type:</b> ${escapeHTML(item.type)}</p>

                <p><b>Category:</b> ${escapeHTML(item.category)}</p>

                <p><b>Location:</b> ${escapeHTML(item.location)}</p>

                <p><b>Date:</b> ${escapeHTML(item.date)}</p>

                <p><b>Description:</b>
                ${escapeHTML(item.description)}</p>

                <p><b>Status:</b> ${escapeHTML(item.status)}</p>

                <button class="btn primary-btn"
                onclick="submitClaim(${item.id})">

                    Contact Reporter

                </button>

            </div>

        </div>

    `;

    showPage("details");

}


// =================================
// ITEM CLAIM
// =================================

function submitClaim(id) {

    if (!currentUser) {
        showPage("login");
        return;
    }

    let item = items.find(i => i.id === id);

    if (item.userId === currentUser.id) {
        showMessage("You cannot claim your own report!");
        return;
    }

    showMessage("Interest recorded in this demo.");

}


// =================================
// CAMPUS HELP REQUEST
// =================================

document.getElementById("helpForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    if (!currentUser) {
        showPage("login");
        return;
    }

    let request = {

        id: Date.now(),

        userId: currentUser.id,

        category: document.getElementById("helpCategory").value,

        location: document.getElementById("helpLocation").value,

        description: document.getElementById("helpDescription").value,

        date: new Date().toISOString().slice(0, 10),

        status: "Pending"

    };

    helpRequests.unshift(request);

    saveData();

    this.reset();

    showMessage("Help request submitted!");

    showPage("reports");

});


// =================================
// MY REPORTS
// =================================

function displayMyReports() {

    if (!currentUser) return;

    let myItems = items.filter(i => i.userId === currentUser.id);

    let myHelp = helpRequests.filter(h => h.userId === currentUser.id);

    let itemTable = document.getElementById("myItemsTable");

    let helpTable = document.getElementById("myHelpTable");

    itemTable.innerHTML = "";

    helpTable.innerHTML = "";

    myItems.forEach(item => {

        itemTable.innerHTML += `

            <tr>

                <td>${escapeHTML(item.name)}</td>

                <td>${escapeHTML(item.type)}</td>

                <td>${escapeHTML(item.location)}</td>

                <td>${escapeHTML(item.date)}</td>

                <td>${escapeHTML(item.status)}</td>

            </tr>

        `;

    });

    myHelp.forEach(help => {

        helpTable.innerHTML += `

            <tr>

                <td>${escapeHTML(help.category)}</td>

                <td>${escapeHTML(help.location)}</td>

                <td>${escapeHTML(help.date)}</td>

                <td>${escapeHTML(help.status)}</td>

            </tr>

        `;

    });

    if (myItems.length === 0) {
        itemTable.innerHTML =
        "<tr><td colspan='5'>No item reports available.</td></tr>";
    }

    if (myHelp.length === 0) {
        helpTable.innerHTML =
        "<tr><td colspan='4'>No help requests available.</td></tr>";
    }

}


// =================================
// STUDENT DASHBOARD
// =================================

function displayDashboard() {

    if (!currentUser) return;

    let myItems = items.filter(i => i.userId === currentUser.id);

    let myHelp = helpRequests.filter(h => h.userId === currentUser.id);

    let found = myItems.filter(i => i.type === "Found").length;

    let resolved = myItems.filter(i => i.status === "Returned").length
        + myHelp.filter(h => h.status === "Resolved").length;

    document.getElementById("welcomeName").innerText =
        "Welcome, " + currentUser.name + "!";

    document.getElementById("myTotal").innerText = myItems.length;

    document.getElementById("myFound").innerText = found;

    document.getElementById("myHelp").innerText = myHelp.length;

    document.getElementById("myResolved").innerText = resolved;

    document.getElementById("recentActivity").innerText =
        "You have submitted " + (myItems.length + myHelp.length)
        + " reports and requests.";

}


// =================================
// ADMIN DASHBOARD
// =================================

function displayAdmin() {

    if (!currentUser || currentUser.role !== "admin") {
        showPage("home");
        return;
    }

    document.getElementById("adminItems").innerText = items.length;

    document.getElementById("adminHelp").innerText = helpRequests.length;

    document.getElementById("adminUsers").innerText = users.length;

    document.getElementById("adminResolved").innerText =
        items.filter(i => i.status === "Returned").length
        + helpRequests.filter(h => h.status === "Resolved").length;

    let itemTable = document.getElementById("adminItemsTable");

    let helpTable = document.getElementById("adminHelpTable");

    itemTable.innerHTML = "";

    helpTable.innerHTML = "";

    items.forEach(item => {

        itemTable.innerHTML += `

            <tr>

                <td>${escapeHTML(item.name)}</td>

                <td>${escapeHTML(getUserName(item.userId))}</td>

                <td>${escapeHTML(item.type)}</td>

                <td>${escapeHTML(item.status)}</td>

                <td>

                    <select onchange="updateItemStatus(${item.id},this.value)">

                        <option ${item.status === "Open" ? "selected" : ""}>Open</option>

                        <option ${item.status === "In Progress" ? "selected" : ""}>In Progress</option>

                        <option ${item.status === "Returned" ? "selected" : ""}>Returned</option>

                        <option ${item.status === "Removed" ? "selected" : ""}>Removed</option>

                    </select>

                </td>

            </tr>

        `;

    });

    helpRequests.forEach(help => {

        helpTable.innerHTML += `

            <tr>

                <td>${escapeHTML(help.category)}</td>

                <td>${escapeHTML(getUserName(help.userId))}</td>

                <td>${escapeHTML(help.location)}</td>

                <td>${escapeHTML(help.status)}</td>

                <td>

                    <select onchange="updateHelpStatus(${help.id},this.value)">

                        <option ${help.status === "Pending" ? "selected" : ""}>Pending</option>

                        <option ${help.status === "In Progress" ? "selected" : ""}>In Progress</option>

                        <option ${help.status === "Resolved" ? "selected" : ""}>Resolved</option>

                    </select>

                </td>

            </tr>

        `;

    });

    if (items.length === 0) {
        itemTable.innerHTML = "<tr><td colspan='5'>No reports found.</td></tr>";
    }

    if (helpRequests.length === 0) {
        helpTable.innerHTML = "<tr><td colspan='5'>No requests found.</td></tr>";
    }

}


// =================================
// ADMIN UPDATE FUNCTIONS
// =================================

function getUserName(userId) {

    let user = users.find(u => u.id === userId);

    return user ? user.name : "Unknown";

}

function updateItemStatus(id, status) {

    let item = items.find(i => i.id === id);

    if (item) {

        item.status = status;

        saveData();

        displayAdmin();

        showMessage("Item status updated!");

    }

}

function updateHelpStatus(id, status) {

    let help = helpRequests.find(h => h.id === id);

    if (help) {

        help.status = status;

        saveData();

        displayAdmin();

        showMessage("Help request updated!");

    }

}


// =================================
// HOME PAGE STATISTICS
// =================================

function updateStats() {

    document.getElementById("totalItems").innerText = items.length;

    document.getElementById("totalFound").innerText =
        items.filter(i => i.type === "Found").length;

    document.getElementById("totalReturned").innerText =
        items.filter(i => i.status === "Returned").length;

    document.getElementById("totalHelp").innerText = helpRequests.length;

}


// =================================
// BASIC HTML ESCAPING
// =================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(char) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];

    });

}


// =================================
// INITIALIZATION
// =================================

document.addEventListener("DOMContentLoaded", function() {

    updateNavigation();

    updateStats();

    if (currentUser) {
        showPage(currentUser.role === "admin" ? "admin" : "home");
    } else {
        showPage("home");
    }

});