// =========================================================
// COSMIC SPEND — app logic
// Data persisted in localStorage. No backend needed.
// =========================================================

const STORAGE_KEY = "cosmicspend_transactions";
const BUDGET_KEY = "cosmicspend_budgets";
const SALDO_KEY = "cosmicspend_saldo";

const CATEGORIES = [
  { id: "makan", label: "Makan & minum", color: "#F4715C" },
  { id: "transport", label: "Transportasi", color: "#F4B740" },
  { id: "hiburan", label: "Hiburan", color: "#8B7CF6" },
  { id: "tagihan", label: "Tagihan & kos", color: "#2DE2E6" },
  { id: "belanja", label: "Belanja", color: "#F45CA0" },
  { id: "kuliah", label: "Kuliah & buku", color: "#4ADE9C" },
  { id: "lainnya", label: "Lainnya", color: "#9794AD" },
];

const INCOME_CATEGORY = { id: "income", label: "Pemasukan", color: "#4ADE9C" };

let transactions = loadTransactions();
let budgets = loadBudgets();
let saldo = loadSaldo();
let currentType = "expense";
let categoryChart = null;
let trendChart = null;

// ---------- Storage helpers ----------
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadBudgets() {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBudgets() {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

function loadSaldo() {
  const raw = localStorage.getItem(SALDO_KEY);
  const n = raw !== null ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function saveSaldo(value) {
  localStorage.setItem(SALDO_KEY, String(value));
}

// ---------- Formatting ----------
function formatRupiah(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCategory(id) {
  if (id === "income") return INCOME_CATEGORY;
  return (
    CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
  );
}

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isThisMonth(dateStr) {
  // Bandingkan string "YYYY-MM" langsung, tanpa parsing Date object
  // (hindari bug pergeseran tanggal akibat UTC vs waktu lokal)
  const nowPrefix = getLocalDateString().slice(0, 7);
  return dateStr.slice(0, 7) === nowPrefix;
}

// ---------- Populate selects ----------
function populateCategorySelects() {
  const txSelect = document.getElementById("txCategory");
  const budgetSelect = document.getElementById("budgetCategory");
  const filterSelect = document.getElementById("filterCategory");

  txSelect.innerHTML = CATEGORIES.map(
    (c) => `<option value="${c.id}">${c.label}</option>`,
  ).join("");

  budgetSelect.innerHTML = CATEGORIES.map(
    (c) => `<option value="${c.id}">${c.label}</option>`,
  ).join("");

  filterSelect.innerHTML =
    '<option value="all">Semua kategori</option>' +
    CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join(
      "",
    ) +
    `<option value="income">${INCOME_CATEGORY.label}</option>`;
}

// ---------- Type toggle (income/expense/saldo) ----------
function setupTypeToggle() {
  const buttons = document.querySelectorAll("#typeToggle .seg-btn");
  const categoryRow = document
    .getElementById("txCategory")
    .closest(".form-row");
  const noteRow = document.getElementById("txNoteRow");
  const dateRow = document.getElementById("txDateRow");
  const amountLabel = document.getElementById("txAmountLabel");
  const amountInput = document.getElementById("txAmount");
  const submitBtn = document.getElementById("txSubmitBtn");
  const dateInput = document.getElementById("txDate");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentType = btn.dataset.type;

      const isSaldo = currentType === "saldo";
      categoryRow.style.display =
        currentType === "income" || isSaldo ? "none" : "flex";
      noteRow.style.display = isSaldo ? "none" : "flex";
      dateRow.style.display = isSaldo ? "none" : "flex";
      dateInput.required = !isSaldo;

      if (isSaldo) {
        amountLabel.textContent = "Saldo saat ini";
        amountInput.value = saldo;
        submitBtn.textContent = "Update saldo";
      } else {
        amountLabel.textContent = "Jumlah";
        amountInput.value = "";
        submitBtn.textContent = "Simpan transaksi";
      }
    });
  });
}

// ---------- Form submit ----------
function setupForm() {
  const form = document.getElementById("transactionForm");
  const dateInput = document.getElementById("txDate");
  dateInput.value = getLocalDateString();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("txAmount").value);
    if (amount === undefined || isNaN(amount) || amount < 0) {
      showToast("Jumlah tidak valid");
      return;
    }

    if (currentType === "saldo") {
      saldo = amount;
      saveSaldo(saldo);
      renderSummary();
      showToast("Saldo diperbarui");
      return;
    }

    if (!amount || amount <= 0) {
      showToast("Jumlah harus lebih dari 0");
      return;
    }

    const tx = {
      id: Date.now().toString(),
      type: currentType,
      category:
        currentType === "income"
          ? "income"
          : document.getElementById("txCategory").value,
      amount: amount,
      note: document.getElementById("txNote").value.trim(),
      date: dateInput.value,
    };

    transactions.unshift(tx);
    saveTransactions();
    renderAll();
    form.reset();
    dateInput.value = getLocalDateString();
    showToast("Transaksi disimpan");
  });
}

// ---------- Summary cards ----------
function renderSummary() {
  const monthTx = transactions.filter((t) => isThisMonth(t.date));
  const income = monthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = monthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  // Saldo = uang di rekening, diinput manual oleh user (tidak dihitung dari transaksi)
  document.getElementById("balanceValue").textContent = formatRupiah(saldo);
  document.getElementById("incomeValue").textContent = formatRupiah(income);
  document.getElementById("expenseValue").textContent = formatRupiah(expense);
  document.getElementById("incomeCount").textContent =
    `${monthTx.filter((t) => t.type === "income").length} transaksi`;
  document.getElementById("expenseCount").textContent =
    `${monthTx.filter((t) => t.type === "expense").length} transaksi`;
}

// ---------- History list ----------
function renderHistory() {
  const list = document.getElementById("historyList");
  const filter = document.getElementById("filterCategory").value;

  let filtered = transactions;
  if (filter !== "all") {
    filtered = transactions.filter((t) => t.category === filter);
  }

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">Belum ada transaksi${filter !== "all" ? " di kategori ini" : ""}.</div>`;
    return;
  }

  list.innerHTML = filtered
    .slice(0, 50)
    .map((t) => {
      const cat = getCategory(t.category);
      const sign = t.type === "income" ? "+" : "−";
      return `
      <div class="history-item" data-id="${t.id}">
        <div class="history-row-main">
          <div class="history-left">
            <span class="cat-dot" style="background:${cat.color}"></span>
            <div class="history-info">
              <span class="history-note">${t.note || cat.label}</span>
              <span class="history-meta">${cat.label} · ${formatDate(t.date)}</span>
            </div>
          </div>
          <span class="history-amount ${t.type}">${sign} ${formatRupiah(t.amount)}</span>
          <button class="history-delete" data-delete="${t.id}" aria-label="Hapus transaksi">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.delete;
      transactions = transactions.filter((t) => t.id !== id);
      saveTransactions();
      renderAll();
      showToast("Transaksi dihapus");
    });
  });
}

// ---------- Category pie chart ----------
function renderCategoryChart() {
  const monthExpenses = transactions.filter(
    (t) => t.type === "expense" && isThisMonth(t.date),
  );
  const totals = {};
  monthExpenses.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals).map((id) => getCategory(id).label);
  const data = Object.values(totals);
  const colors = Object.keys(totals).map((id) => getCategory(id).color);

  const canvas = document.getElementById("categoryChart");
  const emptyState = document.getElementById("chartEmpty");

  if (data.length === 0) {
    canvas.style.display = "none";
    emptyState.classList.remove("hidden");
    if (categoryChart) {
      categoryChart.destroy();
      categoryChart = null;
    }
    return;
  }

  canvas.style.display = "block";
  emptyState.classList.add("hidden");

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#9794AD",
            font: { size: 11, family: "Inter" },
            boxWidth: 10,
            padding: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatRupiah(ctx.raw)}`,
          },
        },
      },
    },
  });
}

// ---------- Trend bar chart (last 6 months) ----------
function renderTrendChart() {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      prefix: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("id-ID", { month: "short" }),
    });
  }

  const incomeData = months.map((m) =>
    transactions
      .filter((t) => t.type === "income" && t.date.slice(0, 7) === m.prefix)
      .reduce((s, t) => s + t.amount, 0),
  );
  const expenseData = months.map((m) =>
    transactions
      .filter((t) => t.type === "expense" && t.date.slice(0, 7) === m.prefix)
      .reduce((s, t) => s + t.amount, 0),
  );

  const canvas = document.getElementById("trendChart");
  if (trendChart) trendChart.destroy();

  trendChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Pemasukan",
          data: incomeData,
          backgroundColor: "#4ADE9C",
          borderRadius: 4,
          maxBarThickness: 18,
        },
        {
          label: "Pengeluaran",
          data: expenseData,
          backgroundColor: "#F4715C",
          borderRadius: 4,
          maxBarThickness: 18,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#9794AD",
            font: { size: 11, family: "Inter" },
            boxWidth: 10,
            padding: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatRupiah(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#5F5C76", font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "#5F5C76",
            font: { size: 10 },
            callback: (v) => (v >= 1000 ? v / 1000 + "k" : v),
          },
        },
      },
    },
  });
}

// ---------- Budget tracking ----------
function renderBudgets() {
  const list = document.getElementById("budgetList");
  const budgetIds = Object.keys(budgets);

  if (budgetIds.length === 0) {
    list.innerHTML = `<div class="budget-empty-cta">Belum ada budget diatur. Klik "Atur budget" untuk mulai.</div>`;
    return;
  }

  const monthExpenses = transactions.filter(
    (t) => t.type === "expense" && isThisMonth(t.date),
  );

  list.innerHTML = budgetIds
    .map((catId) => {
      const cat = getCategory(catId);
      const limit = budgets[catId];
      const spent = monthExpenses
        .filter((t) => t.category === catId)
        .reduce((s, t) => s + t.amount, 0);
      const pct = Math.min((spent / limit) * 100, 100);
      const isOver = spent > limit;

      return `
      <div class="budget-item">
        <div class="budget-top">
          <span class="budget-name"><span class="cat-dot" style="background:${cat.color}"></span>${cat.label}</span>
          <span class="budget-figures ${isOver ? "over" : ""}">${formatRupiah(spent)} / ${formatRupiah(limit)}</span>
        </div>
        <div class="budget-track">
          <div class="budget-fill" style="width:${pct}%; background:${isOver ? "#F4715C" : cat.color}"></div>
        </div>
      </div>
    `;
    })
    .join("");
}

// ---------- Budget modal ----------
function setupBudgetModal() {
  const overlay = document.getElementById("budgetModalOverlay");
  const openBtn = document.getElementById("addBudgetBtn");
  const cancelBtn = document.getElementById("cancelBudgetBtn");
  const form = document.getElementById("budgetForm");

  openBtn.addEventListener("click", () => overlay.classList.remove("hidden"));
  cancelBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const catId = document.getElementById("budgetCategory").value;
    const amount = parseFloat(document.getElementById("budgetAmount").value);
    if (!amount || amount <= 0) return;

    budgets[catId] = amount;
    saveBudgets();
    renderBudgets();
    overlay.classList.add("hidden");
    form.reset();
    showToast("Budget disimpan");
  });
}

// ---------- CSV export ----------
function exportCSV() {
  if (transactions.length === 0) {
    showToast("Belum ada transaksi untuk diekspor");
    return;
  }

  const header = ["Tanggal", "Tipe", "Kategori", "Catatan", "Jumlah"];
  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    getCategory(t.category).label,
    `"${(t.note || "").replace(/"/g, '""')}"`,
    t.amount,
  ]);

  // BOM (\uFEFF) so Excel reads UTF-8 correctly instead of mojibake-ing accented characters
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cosmic-spend-${getLocalDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("CSV berhasil diunduh");
}

// ---------- Toast ----------
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add("hidden"), 2400);
}

// ---------- Starfield background (decorative canvas) ----------
function setupStarfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.85 ? "139,124,246" : "45,226,230",
    }));
  }

  let frame = 0;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      const twinkle = prefersReducedMotion
        ? 0.7
        : 0.4 + 0.4 * Math.sin(frame * s.twinkleSpeed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.hue},${twinkle})`;
      ctx.fill();
    });
    frame++;
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

// ---------- Render orchestration ----------
function renderAll() {
  renderSummary();
  renderHistory();
  renderCategoryChart();
  renderTrendChart();
  renderBudgets();
}

// ---------- Init ----------
function init() {
  setupStarfield();
  populateCategorySelects();
  setupTypeToggle();
  setupForm();
  setupBudgetModal();
  setupSaldoEdit();

  document
    .getElementById("filterCategory")
    .addEventListener("change", renderHistory);
  document.getElementById("exportBtn").addEventListener("click", exportCSV);

  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

// ---------- Saldo manual (edit inline) ----------
function setupSaldoEdit() {
  const valueEl = document.getElementById("balanceValue");
  valueEl.style.cursor = "pointer";
  valueEl.title = "Klik untuk edit saldo";

  valueEl.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.value = saldo;
    input.className = "saldo-edit-input";
    input.style.cssText = `
      font: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 8px;
      padding: 2px 8px;
      width: 100%;
      max-width: 220px;
      outline: none;
    `;

    valueEl.replaceWith(input);
    input.focus();
    input.select();

    const commit = () => {
      const newValue = Number(input.value);
      saldo = Number.isFinite(newValue) && newValue >= 0 ? newValue : saldo;
      saveSaldo(saldo);
      input.replaceWith(valueEl);
      renderSummary();
      showToast("Saldo diperbarui");
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") {
        input.value = saldo;
        input.blur();
      }
    });
    input.addEventListener("blur", commit);
  });
}
