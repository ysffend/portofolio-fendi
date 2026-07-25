// --- STATE MANAGEMENT ---
let goals = [];
let logs = [];

// --- DOM ELEMENTS ---
const goalForm = document.getElementById("goal-form");
const goalNameInput = document.getElementById("goal-name");
const goalAmountInput = document.getElementById("goal-amount");
const goalPlanetInput = document.getElementById("goal-planet");
const goalsContainer = document.getElementById("goals-container");
const historyContainer = document.getElementById("history-container");
const overallBalanceEl = document.getElementById("overall-balance");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// --- HELPER FUNCTIONS ---
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

function getFormattedDate() {
  const now = new Date();
  return now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- STORAGE ---
function saveToLocalStorage() {
  localStorage.setItem("nebula_goals", JSON.stringify(goals));
  localStorage.setItem("nebula_logs", JSON.stringify(logs));
}

function loadData() {
  const storedGoals = localStorage.getItem("nebula_goals");
  const storedLogs = localStorage.getItem("nebula_logs");

  if (storedGoals) goals = JSON.parse(storedGoals);
  if (storedLogs) logs = JSON.parse(storedLogs);

  render();
}

// --- FORM SUBMIT ---
goalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = goalNameInput.value.trim();
  const targetAmount = parseFloat(goalAmountInput.value);
  const planet = goalPlanetInput.value;

  if (!name || isNaN(targetAmount) || targetAmount <= 0) return;

  const newGoal = {
    id: "goal_" + Date.now(),
    name: name,
    targetAmount: targetAmount,
    savedAmount: 0,
    planet: planet,
  };

  goals.push(newGoal);
  addLog(`Orbit Target "${name}" diluncurkan!`, "system", 0);
  goalForm.reset();

  saveToLocalStorage();
  render();
});

// --- LOG SYSTEM ---
function addLog(message, type, amount) {
  const newLog = {
    id: "log_" + Date.now(),
    message: message,
    type: type,
    amount: amount,
    date: getFormattedDate(),
  };

  logs.unshift(newLog);
  if (logs.length > 15) logs.pop();
}

function hapusLogSatu(logId) {
  logs = logs.filter((log) => log.id !== logId);
  saveToLocalStorage();
  render();
}

// --- RENDER ENGINE ---
function render() {
  const totalBalance = goals.reduce(
    (acc, current) => acc + current.savedAmount,
    0,
  );
  overallBalanceEl.textContent = formatRupiah(totalBalance);

  // Render Target
  goalsContainer.innerHTML = "";
  if (goals.length === 0) {
    goalsContainer.innerHTML = `
      <div class="card glass" style="text-align: center; padding: 3rem;">
        <i class="fa-solid fa-satellite-dish" style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1rem;"></i>
        <p style="color: #a1a1aa;">Belum ada target aktif di radar luar angkasa Anda. Silakan tambahkan di form kiri!</p>
      </div>
    `;
  } else {
    goals.forEach((goal) => {
      let progress = (goal.savedAmount / goal.targetAmount) * 100;
      progress = Math.min(progress, 100);

      const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);
      const remainingText =
        remainingAmount > 0
          ? `Kurang: ${formatRupiah(remainingAmount)}`
          : `🎉 Terpenuhi!`;

      const card = document.createElement("div");
      card.className = "card glass goal-card";
      card.innerHTML = `
        <div class="goal-header">
          <span class="planet-icon">${goal.planet}</span>
          <div>
            <h4>${goal.name}</h4>
            <p>Target: ${formatRupiah(goal.targetAmount)}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar-wrapper">
            <div class="progress-bar" style="width: ${progress}%;"></div>
            <i class="fa-solid fa-shuttle-space rocket-progress" style="left: calc(${progress}% - 10px);"></i>
          </div>
          <span class="progress-percentage">${Math.floor(progress)}%</span>
        </div>
        <div class="goal-footer">
          <div class="amount-info">
            <p class="saved-amount">Terkumpul: ${formatRupiah(goal.savedAmount)}</p>
            <p class="remaining-amount">${remainingText}</p>
          </div>
          <div class="action-buttons">
            <button class="btn-action deposit-btn" title="Setor Uang" data-id="${goal.id}"><i class="fa-solid fa-plus"></i></button>
            <button class="btn-action withdraw-btn" title="Tarik Uang" data-id="${goal.id}"><i class="fa-solid fa-minus"></i></button>
            <button class="btn-action delete-btn" title="Hapus Target" data-id="${goal.id}"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      `;
      goalsContainer.appendChild(card);
    });

    document.querySelectorAll(".deposit-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleDeposit(btn.getAttribute("data-id")),
      );
    });

    document.querySelectorAll(".withdraw-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleWithdraw(btn.getAttribute("data-id")),
      );
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleDelete(btn.getAttribute("data-id")),
      );
    });
  }

  // Render Log
  historyContainer.innerHTML = "";
  if (logs.length === 0) {
    historyContainer.innerHTML =
      '<p class="empty-text">Belum ada aktivitas finansial di orbit.</p>';
  } else {
    logs.forEach((log) => {
      const logItem = document.createElement("div");
      logItem.className = "history-item";

      let badgeClass = "system-text";
      let icon = "🚀";
      if (log.type === "deposit") {
        badgeClass = "deposit-text";
        icon = "📥";
      } else if (log.type === "withdraw") {
        badgeClass = "withdraw-text";
        icon = "📤";
      }

      logItem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span>${icon} ${log.message}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="${badgeClass}" style="font-size: 0.75rem;">${log.date}</span>
            <button class="btn-delete-log" data-id="${log.id}" title="Hapus Log" style="background: none; border: none; color: #ef4444; cursor: pointer;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      `;
      historyContainer.appendChild(logItem);
    });

    document.querySelectorAll(".btn-delete-log").forEach((btn) => {
      btn.addEventListener("click", () => {
        hapusLogSatu(btn.getAttribute("data-id"));
      });
    });
  }
}

loadData();

// --- MODAL DEPOSIT / WITHDRAW ---
const transactionModal = document.getElementById("transaction-modal");
const modalTitle = document.getElementById("modal-title");
const modalTargetInfo = document.getElementById("modal-target-info");
const transactionAmountInput = document.getElementById("transaction-amount");
const submitModalBtn = document.getElementById("submit-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");

let activeTransaction = { goalId: null, type: null };

function openModal(goalId, type) {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  activeTransaction.goalId = goalId;
  activeTransaction.type = type;

  if (type === "deposit") {
    modalTitle.innerHTML = `<i class="fa-solid fa-circle-down" style="color: #34d399"></i> Setor Tabungan`;
    modalTargetInfo.innerHTML = `Setor ke orbit target <strong>"${goal.name}"</strong>.<br>Kekurangan: <strong>${formatRupiah(goal.targetAmount - goal.savedAmount)}</strong>`;
    submitModalBtn.textContent = "Setor Uang";
    submitModalBtn.style.background =
      "linear-gradient(135deg, #10b981, #34d399)";
  } else {
    modalTitle.innerHTML = `<i class="fa-solid fa-circle-up" style="color: #fbbf24"></i> Tarik Tabungan`;
    modalTargetInfo.innerHTML = `Tarik dari orbit target <strong>"${goal.name}"</strong>.<br>Saldo saat ini: <strong>${formatRupiah(goal.savedAmount)}</strong>`;
    submitModalBtn.textContent = "Tarik Uang";
    submitModalBtn.style.background =
      "linear-gradient(135deg, #f59e0b, #fbbf24)";
  }

  transactionAmountInput.value = "";
  transactionModal.classList.add("active");
  transactionAmountInput.focus();
}

function closeModal() {
  transactionModal.classList.remove("active");
  activeTransaction = { goalId: null, type: null };
}

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
transactionModal.addEventListener("click", (e) => {
  if (e.target === transactionModal) closeModal();
});

submitModalBtn.addEventListener("click", () => {
  const amount = parseFloat(transactionAmountInput.value);
  const goal = goals.find((g) => g.id === activeTransaction.goalId);

  if (!goal || isNaN(amount) || amount <= 0) return;

  if (activeTransaction.type === "deposit") {
    goal.savedAmount += amount;
    addLog(
      `Setor ${formatRupiah(amount)} ke target "${goal.name}"`,
      "deposit",
      amount,
    );
  } else if (activeTransaction.type === "withdraw") {
    if (amount > goal.savedAmount) return;
    goal.savedAmount -= amount;
    addLog(
      `Tarik ${formatRupiah(amount)} dari target "${goal.name}"`,
      "withdraw",
      amount,
    );
  }

  saveToLocalStorage();
  render();
  closeModal();
});

function handleDeposit(goalId) {
  openModal(goalId, "deposit");
}
function handleWithdraw(goalId) {
  openModal(goalId, "withdraw");
}

// --- CUSTOM MODAL HAPUS (TARGET & LOGS) ---
const deleteModal = document.getElementById("delete-modal");
const deleteModalInfo = document.getElementById("delete-modal-info");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const closeDeleteModalBtn = document.getElementById("close-delete-modal-btn");

let pendingDeleteType = null; // 'goal' atau 'clear_logs'
let pendingDeleteGoalId = null;

function openDeleteGoalModal(goalId) {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  pendingDeleteType = "goal";
  pendingDeleteGoalId = goalId;
  deleteModalInfo.innerHTML = `Apakah Anda yakin ingin menghapus orbit target <strong>"${goal.name}"</strong>? Sisa saldo <strong>${formatRupiah(goal.savedAmount)}</strong> di dalamnya akan hilang.`;
  deleteModal.classList.add("active");
}

function openClearLogsModal() {
  if (logs.length === 0) return;

  pendingDeleteType = "clear_logs";
  pendingDeleteGoalId = null;
  deleteModalInfo.innerHTML = `Apakah Anda yakin ingin menghapus <strong>seluruh riwayat log transaksi</strong>?`;
  deleteModal.classList.add("active");
}

function closeDeleteModal() {
  deleteModal.classList.remove("active");
  pendingDeleteType = null;
  pendingDeleteGoalId = null;
}

closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

// Aksi Tombol Hapus pada Custom Modal
confirmDeleteBtn.addEventListener("click", () => {
  if (pendingDeleteType === "goal") {
    const goal = goals.find((g) => g.id === pendingDeleteGoalId);
    if (goal) {
      goals = goals.filter((g) => g.id !== pendingDeleteGoalId);
      addLog(`Orbit "${goal.name}" dihapus`, "system", 0);
    }
  } else if (pendingDeleteType === "clear_logs") {
    logs = []; // Hapus semua log
  }

  saveToLocalStorage();
  render();
  closeDeleteModal();
});

function handleDelete(goalId) {
  openDeleteGoalModal(goalId);
}

// Event listener Bersihkan Log (Pakai Modal Custom)
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    openClearLogsModal();
  });
}
