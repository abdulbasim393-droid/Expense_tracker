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
    window.location.href = "/dashboard";
  } else {
    alert(data.message || "Login failed");
  }
}

/* =========================
   DASHBOARD LOAD
========================= */
async function loadDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  try {
    const res = await fetch(`/analytics/summary`, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    const data = await res.json();

    const summary = document.getElementById("summary");
  if (summary) {
    summary.innerHTML = `
      <div class="card">
        <h3>Total Spent</h3>
        <p>₹${data.total_expenses || 0}</p>
      </div>
      <div class="card">
        <h3>Top Category</h3>
        <p>${data.top_category?.category || "-"}</p>
        <small>₹${data.top_category?.total || 0}</small>
      </div>
      <div class="card">
        <h3>Daily Average</h3>
        <p>₹${(data.average_daily || 0).toFixed(2)}</p>
      </div>
    `;
  }

  loadExpenses();
  } catch (error) {
    console.error(error);
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}

/* =========================
   EXPENSE LIST
========================= */
async function loadExpenses() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/expenses`, {
    headers: { "Authorization": "Bearer " + token }
  });

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