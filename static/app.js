const API = "";

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
    setTimeout(() => {
    window.location.href = "/dashboard";
}, 100);
  } else {
    alert(data.message || "Login failed");
  }
}

/* =========================
   DASHBOARD LOAD
========================= */
async function loadDashboard() {
    const token = localStorage.getItem("token");

    if (!token || token === "null" || token === "undefined") {
        window.location.replace("/login");
        return;
    }

    try {
        const res = await fetch(`${API}/analytics/summary`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 422) {
                localStorage.removeItem("token");
            }
            console.error("Dashboard auth fail", res.status, await res.text());
            window.location.replace("/login");
            return;
        }

        const data = await res.json();

        document.getElementById("summary").innerHTML = `
            <div class="card">Total : ₹${data.total_expenses}</div>
            <div class="card">
                Top : ${data.top_category?.category || "-"}
            </div>
            <div class="card">
                Avg : ₹${(data.average_daily || 0).toFixed(2)}
            </div>
        `;

        loadExpenses();
    } catch (error) {
        console.error("Dashboard load error", error);
        localStorage.removeItem("token");
        window.location.replace("/login");
    }
}




async function loadAnalytics() {
    console.log("Loading analytics...");
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.replace("/login");
        return;
    }

    try {
        const res = await fetch("/analytics/summary", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error(await res.text());
            return;
        }

        const data = await res.json();
        console.log("Analytics data:", data);

        document.getElementById("totalExpense").textContent =
            "₹" + data.total_expenses;

        document.getElementById("averageDaily").textContent =
            "₹" + Number(data.average_daily).toFixed(2);

        document.getElementById("topCategory").textContent =
            data.top_category
                ? data.top_category.category
                : "-";

    } catch (err) {
        console.error(err);
    }
}




/* =========================
   EXPENSE LIST
========================= */
async function loadExpenses() {
  const token = localStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") {
    window.location.replace("/login");
    return;
  }

  try {
    const res = await fetch(`${API}/expenses`, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 422) {
        localStorage.removeItem("token");
      }
      console.error("Expenses auth fail", res.status, await res.text());
      window.location.replace("/login");
      return;
    }

    const data = await res.json();
    const expensesContainer = document.getElementById("expenses");
    if (!expensesContainer) return;

    expensesContainer.innerHTML = data.map(e => `
      <div class="expense">
        <span>${e.title || "-"}</span>
        <span>${e.category}</span>
        <span>₹${e.amount}</span>
        <span>${formatDate(e.created_at)}</span>
      </div>
    `).join("");
  } catch (error) {
    console.error("Expenses load error", error);
    localStorage.removeItem("token");
    window.location.replace("/login");
  }
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

/* =========================
   ADD EXPENSE
========================= */
async function addExpense() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("title")?.value;
  const amount = document.getElementById("amount")?.value;
  const category = document.getElementById("category")?.value;

  if (!title || !amount || !category) {
    alert("Please add a title, amount, and category.");
    return;
  }

  const res = await fetch(`${API}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      title,
      amount,
      category
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Expense added successfully.");
    const titleField = document.getElementById("title");
    const amountField = document.getElementById("amount");
    const categoryField = document.getElementById("category");

    if (titleField) titleField.value = "";
    if (amountField) amountField.value = "";
    if (categoryField) categoryField.value = "";

    if (document.getElementById("modal")) {
      closeModal();
      loadDashboard();
    } else {
      window.location.href = "/dashboard";
    }
  } else {
    alert(data.message || "Failed to add expense");
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}


/* =========================
   PAGE INITIALIZER
========================= */
document.addEventListener("DOMContentLoaded", () => {

    // Dashboard page
    if (document.getElementById("summary")) {
        loadDashboard();
    }

    // Analytics page
    if (document.getElementById("totalExpense")) {
        loadAnalytics();
    }

});