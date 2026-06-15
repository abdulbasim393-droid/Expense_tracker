const API = "";

let editingExpenseId = null;

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



/* =========================
   ANALYTICS LOAD
========================= */


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

        loadCategoryChart();
        loadMonthlyChart();
        loadDailyChart();

    } catch (err) {
        console.error(err);
    }
}



/* =========================
   LOAD CATEGORY CHART
========================= */

async function loadCategoryChart() {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/analytics/category", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error(await res.text());
            return;
        }

        const data = await res.json();

        const labels = data.map(item => item.category);
        const amounts = data.map(item => item.total);

        const ctx = document.getElementById("categoryChart").getContext("2d");

        new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#06B6D4",
                        "#EC4899",
                        "#84CC16"
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "white"
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error(err);
    }
}


/* =========================
   LOAD MONTHLY CHART
========================= */

async function loadMonthlyChart() {

    const token = localStorage.getItem("token");

    try {

        const res = await fetch("/analytics/monthly", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error(await res.text());
            return;
        }

        const data = await res.json();

        const labels = data.map(item => {
            const date = new Date(item.month);
            return date.toLocaleString("default", {
                month: "short",
                year: "numeric"
            });
        });

        const totals = data.map(item => item.total);

        const ctx = document
            .getElementById("monthlyChart")
            .getContext("2d");

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Monthly Expenses",
                    data: totals
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: "white"
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: "white"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "white"
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error(err);
    }

}


/* =========================
   LOAD DAILY CHART
========================= */


async function loadDailyChart() {

    const token = localStorage.getItem("token");

    try {

        const res = await fetch("/analytics/last-30-days", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error(await res.text());
            return;
        }

        const data = await res.json();

        const labels = data.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
            });
        });

        const totals = data.map(item => item.total);

        const ctx = document
            .getElementById("dailyChart")
            .getContext("2d");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Daily Expenses",
                    data: totals,
                    fill: false,
                    borderColor: "#3B82F6",
                    backgroundColor: "#3B82F6",
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: "white"
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: "white"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "white"
                        }
                    }
                }
            }
        });

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

        <div class="actions">

            <button
                class="edit-btn"
                onclick="editExpense(${e.id})">
                Edit
            </button>

            <button
                class="delete-btn"
                onclick="deleteExpense(${e.id})">
                Delete
            </button>
        </div>
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

  const url = editingExpenseId
    ? `/expenses/${editingExpenseId}`
    : `${API}/expenses`;

  const method = editingExpenseId
    ? "PUT"
    : "POST";

  const res = await fetch(url, {
    method: method,
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
    alert(data.message);
    const titleField = document.getElementById("title");
    const amountField = document.getElementById("amount");
    const categoryField = document.getElementById("category");

    if (titleField) titleField.value = "";
    if (amountField) amountField.value = "";
    if (categoryField) categoryField.value = "";


    editingExpenseId = null;
    document.getElementById("modalTitle").innerText = "Add Expense";
    document.getElementById("saveButton").innerText = "Save Expense";

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

    // Reset edit mode
    editingExpenseId = null;

    // Reset modal title and button
    document.getElementById("modalTitle").innerText = "Add Expense";
    document.getElementById("saveButton").innerText = "Save Expense";

    // Clear the form
    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";

    // Show the modal
    document.getElementById("modal").style.display = "flex";

    showModal();
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}


function showModal() {
    document.getElementById("modal").style.display = "flex";
}




// DELETE FUNCTION


async function deleteExpense(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`/expenses/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    if (res.ok) {

        alert(data.message);

        loadDashboard();

    } else {

        alert(data.message);

    }

}


//EDIT FUNCTION

async function editExpense(id) {
    console.log("editingExpenseId in addExpense:", editingExpenseId);

    const token = localStorage.getItem("token");

    const res = await fetch(`/expenses/${id}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const expense = await res.json();

    if (!res.ok) {
        alert(expense.message || "Failed to load expense.");
        return;
    }

    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;

    editingExpenseId = id;

    console.log("Editing expense:", editingExpenseId);

    document.getElementById("modalTitle").innerText = "Edit Expense";
    document.getElementById("saveButton").innerText = "Update Expense";

    showModal();
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