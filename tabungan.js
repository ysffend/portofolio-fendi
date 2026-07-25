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

// --- HELPER FUNCTIONS ---
// Format angka ke format Rupiah (IDR)
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// Mendapatkan tanggal & waktu saat ini dengan format ringkas
function getFormattedDate() {
  const now = new Date();
  return now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- CORE FUNCTIONS ---

// 1. Simpan data ke LocalStorage
function saveToLocalStorage() {
  localStorage.setItem("nebula_goals", JSON.stringify(goals));
  localStorage.setItem("nebula_logs", JSON.stringify(logs));
}

// 2. Load data saat pertama kali aplikasi dibuka
function loadData() {
  const storedGoals = localStorage.getItem("nebula_goals");
  const storedLogs = localStorage.getItem("nebula_logs");

  if (storedGoals) goals = JSON.parse(storedGoals);
  if (storedLogs) logs = JSON.parse(storedLogs);

  render();
}

// 3. Menambahkan Goal Baru
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

  // Catat ke log aktivitas
  addLog(`Orbit Target "${name}" diluncurkan!`, "system", 0);

  // Reset Form
  goalForm.reset();

  saveToLocalStorage();
  render();
});

// 4. Tambah Log Transaksi
function addLog(message, type, amount) {
  const newLog = {
    id: "log_" + Date.now(),
    message: message,
    type: type, // 'deposit', 'withdraw', atau 'system'
    amount: amount,
    date: getFormattedDate(),
  };

  // Batasi log maksimal 15 item teratas saja
  logs.unshift(newLog);
  if (logs.length > 15) logs.pop();
}

// 5. Fitur Setor Uang (Deposit)
function handleDeposit(goalId) {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  const amountInput = prompt(
    `Masukkan jumlah setoran untuk "${goal.name}":\n(Target: ${formatRupiah(goal.targetAmount)})`,
  );
  const amount = parseFloat(amountInput);

  if (isNaN(amount) || amount <= 0) {
    alert("Jumlah setoran tidak valid!");
    return;
  }

  // Tambahkan ke tabungan target
  goal.savedAmount += amount;

  // Beri notifikasi jika sudah melampaui target (Tercapai!)
  if (goal.savedAmount >= goal.targetAmount) {
    alert(`🎉 Selamat! Target tabungan "${goal.name}" Anda telah tercapai!`);
  }

  addLog(
    `Setor ${formatRupiah(amount)} ke target "${goal.name}"`,
    "deposit",
    amount,
  );
  saveToLocalStorage();
  render();
}

// 6. Fitur Tarik Uang (Withdraw)
function handleWithdraw(goalId) {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  const amountInput = prompt(
    `Masukkan jumlah penarikan dari "${goal.name}":\n(Saldo saat ini: ${formatRupiah(goal.savedAmount)})`,
  );
  const amount = parseFloat(amountInput);

  if (isNaN(amount) || amount <= 0) {
    alert("Jumlah penarikan tidak valid!");
    return;
  }

  if (amount > goal.savedAmount) {
    alert("Saldo tabungan ini tidak mencukupi untuk melakukan penarikan!");
    return;
  }

  goal.savedAmount -= amount;

  addLog(
    `Tarik ${formatRupiah(amount)} dari target "${goal.name}"`,
    "withdraw",
    amount,
  );
  saveToLocalStorage();
  render();
}

// 7. Fitur Hapus Target (Delete)
function handleDelete(goalId) {
  openDeleteModal(goalId);
}

// --- RENDER ENGINE (UI UPDATE) ---
function render() {
  // A. Hitung & Tampilkan Total Saldo Keseluruhan
  const totalBalance = goals.reduce(
    (acc, current) => acc + current.savedAmount,
    0,
  );
  overallBalanceEl.textContent = formatRupiah(totalBalance);

  // B. Render Daftar Target (Goals Grid)
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
      // Hitung persentase progres
      let progress = (goal.savedAmount / goal.targetAmount) * 100;
      progress = Math.min(progress, 100); // Batasi maksimal 100% secara visual

      // Hitung sisa kekurangan uang (selisih target vs terkumpul)
      const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);
      const remainingText =
        remainingAmount > 0
          ? `Kurang: ${formatRupiah(remainingAmount)}`
          : `🚀 Terpenuhi!`;

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

    // Pasang Event Listener untuk tombol di dalam card secara dinamis
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

  // C. Render Log Transaksi
  historyContainer.innerHTML = "";

  if (logs.length === 0) {
    historyContainer.innerHTML =
      '<p class="empty-text">Belum ada aktivitas finansial di orbit.</p>';
  } else {
    logs.forEach((log) => {
      const logItem = document.createElement("div");
      logItem.className = "history-item";

      let badgeClass = "system-text";
      let icon = "🛰️";
      if (log.type === "deposit") {
        badgeClass = "deposit-text";
        icon = "📥";
      } else if (log.type === "withdraw") {
        badgeClass = "withdraw-text";
        icon = "📤";
      }

      logItem.innerHTML = `
        <span>${icon} ${log.message}</span>
        <span class="${badgeClass}" style="font-size: 0.75rem; margin-left: 10px;">${log.date}</span>
      `;
      historyContainer.appendChild(logItem);
    });
  }
}

// Jalankan Load Data pertama kali aplikasi di-render
loadData();

// --- DOM ELEMENTS UNTUK MODAL ---
const transactionModal = document.getElementById("transaction-modal");
const modalTitle = document.getElementById("modal-title");
const modalTargetInfo = document.getElementById("modal-target-info");
const transactionAmountInput = document.getElementById("transaction-amount");
const submitModalBtn = document.getElementById("submit-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");

// State sementara untuk melacak transaksi aktif di modal
let activeTransaction = {
  goalId: null,
  type: null, // 'deposit' atau 'withdraw'
};

// --- MODAL FUNCTIONS ---

function openModal(goalId, type) {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  activeTransaction.goalId = goalId;
  activeTransaction.type = type;

  // Sesuaikan tulisan modal berdasarkan aksi
  if (type === "deposit") {
    modalTitle.innerHTML = `<i class="fa-solid fa-circle-down" style="color: #34d399"></i> Setor Tabungan`;
    modalTargetInfo.innerHTML = `Setor ke orbit target <strong>"${goal.name}"</strong>.<br>Kekurangan: <strong>${formatRupiah(goal.targetAmount - goal.savedAmount)}</strong>`;
    submitModalBtn.textContent = "Setor Uang";
    submitModalBtn.style.background =
      "linear-gradient(135deg, #10b981, #34d399)"; // Hijau neon
  } else {
    modalTitle.innerHTML = `<i class="fa-solid fa-circle-up" style="color: #fbbf24"></i> Tarik Tabungan`;
    modalTargetInfo.innerHTML = `Tarik dari orbit target <strong>"${goal.name}"</strong>.<br>Saldo saat ini: <strong>${formatRupiah(goal.savedAmount)}</strong>`;
    submitModalBtn.textContent = "Tarik Uang";
    submitModalBtn.style.background =
      "linear-gradient(135deg, #f59e0b, #fbbf24)"; // Oranye/Kuning
  }

  transactionAmountInput.value = ""; // Reset input nominal
  transactionModal.classList.add("active");
  transactionAmountInput.focus();
}

function closeModal() {
  transactionModal.classList.remove("active");
  activeTransaction = { goalId: null, type: null };
}

// Event Listener Penutup Modal
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
transactionModal.addEventListener("click", (e) => {
  if (e.target === transactionModal) closeModal();
});

// Proses Transaksi Saat Konfirmasi Di-klik
submitModalBtn.addEventListener("click", () => {
  const amount = parseFloat(transactionAmountInput.value);
  const goal = goals.find((g) => g.id === activeTransaction.goalId);

  if (!goal) return;

  if (isNaN(amount) || amount <= 0) {
    alert("Masukkan nominal yang valid!");
    return;
  }

  if (activeTransaction.type === "deposit") {
    // Jalankan Setor
    goal.savedAmount += amount;
    addLog(
      `Setor ${formatRupiah(amount)} ke target "${goal.name}"`,
      "deposit",
      amount,
    );

    if (goal.savedAmount >= goal.targetAmount) {
      alert(`🎉 Selamat! Target tabungan "${goal.name}" Anda telah tercapai!`);
    }
  } else if (activeTransaction.type === "withdraw") {
    // Jalankan Tarik
    if (amount > goal.savedAmount) {
      alert("Saldo tidak mencukupi untuk ditarik!");
      return;
    }
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

// Ganti fungsi handler lama agar membuka modal custom
function handleDeposit(goalId) {
  openModal(goalId, "deposit");
}

function handleWithdraw(goalId) {
  openModal(goalId, "withdraw");
}

// --- DOM ELEMENTS UNTUK MODAL HAPUS ---
const deleteModal = document.getElementById("delete-modal");
const deleteModalInfo = document.getElementById("delete-modal-info");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const closeDeleteModalBtn = document.getElementById("close-delete-modal-btn");

// State sementara untuk melacak target yang akan dihapus
let pendingDeleteGoalId = null;

function openDeleteModal(goalId) {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  pendingDeleteGoalId = goalId;
  deleteModalInfo.innerHTML = `Apakah Anda yakin ingin menghapus orbit target <strong>"${goal.name}"</strong>? Sisa saldo <strong>${formatRupiah(goal.savedAmount)}</strong> di dalamnya akan hilang.`;

  deleteModal.classList.add("active");
}

function closeDeleteModal() {
  deleteModal.classList.remove("active");
  pendingDeleteGoalId = null;
}

closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

confirmDeleteBtn.addEventListener("click", () => {
  const goal = goals.find((g) => g.id === pendingDeleteGoalId);
  if (!goal) return;

  goals = goals.filter((g) => g.id !== pendingDeleteGoalId);
  addLog(`Orbit "${goal.name}" dihapus`, "system", 0);
  saveToLocalStorage();
  render();
  closeDeleteModal();
});

function hapusLog(id) {
  // 1. Hapus dari database via API
  fetch(`/api/log/${id}`, { method: "DELETE" });

  // 2. Hapus elemen dari tampilan
  document.querySelector(`[data-id="${id}"]`).closest(".log-item").remove();
}
