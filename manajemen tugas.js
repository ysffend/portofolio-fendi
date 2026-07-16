// ============ STATE ============
const STORAGE_KEY = "orbit_tasks_v1";
let tasks = loadTasks();
let currentFilter = "all";
let currentCourseFilter = null;
let laprakFilterActive = false;
let editingId = null;
let selectedStatus = "todo";

// ============ DOM REFS ============
const board = document.getElementById("board");
const emptyState = document.getElementById("emptyState");
const modalBackdrop = document.getElementById("modalBackdrop");
const taskForm = document.getElementById("taskForm");
const modalTitle = document.getElementById("modalTitle");
const courseFiltersNav = document.getElementById("courseFilters");
const courseSuggestions = document.getElementById("courseSuggestions");
const statusToggle = document.getElementById("statusToggle");
const btnDelete = document.getElementById("btnDelete");

// ============ STORAGE ============
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Gagal membaca data tersimpan", e);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ============ HELPERS ============
function uid() {
  return "t_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function msUntil(deadline) {
  return new Date(deadline).getTime() - Date.now();
}

function urgencyLevel(task) {
  if (task.status === "done") return "done";
  const ms = msUntil(task.deadline);
  const hours = ms / (1000 * 60 * 60);
  if (hours < 0) return "critical"; // sudah lewat deadline
  if (hours <= 24) return "critical";
  if (hours <= 72) return "high";
  return "normal";
}

function formatDeadline(deadline) {
  const d = new Date(deadline);
  const now = new Date();
  const diffMs = d - now;
  const diffH = diffMs / (1000 * 60 * 60);

  const dateStr = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  const timeStr = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMs < 0) {
    const overdueH = Math.abs(diffH);
    if (overdueH < 24)
      return `Lewat ${Math.round(overdueH)} jam — ${dateStr} ${timeStr}`;
    return `Lewat deadline — ${dateStr} ${timeStr}`;
  }
  if (diffH < 1) return `${Math.round(diffMs / 60000)} menit lagi`;
  if (diffH < 24) return `${Math.round(diffH)} jam lagi — ${timeStr}`;
  return `${dateStr}, ${timeStr}`;
}

function getCourses() {
  return [
    ...new Set(tasks.filter((t) => !t.isLaprak).map((t) => t.course)),
  ].sort();
}

// ============ RENDER ============
function render() {
  renderCourseFilters();
  renderCounts();
  renderBoard();
  renderRing();
  renderSummary();
  document
    .getElementById("filterLaprak")
    .classList.toggle("active", laprakFilterActive);
}

function renderCourseFilters() {
  const courses = getCourses();
  courseFiltersNav.innerHTML = '<span class="filters-label">Mata kuliah</span>';
  courses.forEach((course) => {
    const btn = document.createElement("button");
    btn.className =
      "filter-item" + (currentCourseFilter === course ? " active" : "");
    btn.textContent = course;
    btn.addEventListener("click", () => {
      laprakFilterActive = false;
      currentCourseFilter = currentCourseFilter === course ? null : course;
      render();
    });
    courseFiltersNav.appendChild(btn);
  });

  // update datalist for the form too
  courseSuggestions.innerHTML = courses
    .map((c) => `<option value="${escapeHtml(c)}">`)
    .join("");
}

function renderCounts() {
  document.getElementById("countAll").textContent = tasks.length;
  document.getElementById("countTodo").textContent = tasks.filter(
    (t) => t.status === "todo",
  ).length;
  document.getElementById("countDoing").textContent = tasks.filter(
    (t) => t.status === "doing",
  ).length;
  document.getElementById("countDone").textContent = tasks.filter(
    (t) => t.status === "done",
  ).length;
  document.getElementById("countLaprak").textContent = tasks.filter(
    (t) => t.isLaprak,
  ).length;
}

function getFilteredTasks() {
  let list = tasks;
  if (currentFilter !== "all")
    list = list.filter((t) => t.status === currentFilter);
  if (laprakFilterActive) {
    list = list.filter((t) => t.isLaprak);
  } else if (currentCourseFilter) {
    list = list.filter((t) => t.course === currentCourseFilter);
  }
  // sort: belum selesai dulu, lalu berdasar deadline terdekat
  return list.slice().sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (b.status === "done" && a.status !== "done") return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
}

function renderBoard() {
  const list = getFilteredTasks();
  board.innerHTML = "";

  if (list.length === 0) {
    emptyState.classList.add("show");
    return;
  }
  emptyState.classList.remove("show");

  list.forEach((task) => {
    const urgency = urgencyLevel(task);
    const card = document.createElement("div");
    card.className = `card urgency-${urgency}`;
    card.innerHTML = `
      <div class="card-top">
        <span class="card-course">${escapeHtml(task.course)}${task.isLaprak ? ' <span class="laprak-badge">LAPRAK</span>' : ""}</span>
        <span class="priority-dot ${task.priority}" title="Prioritas ${task.priority}"></span>
      </div>
      <h3 class="card-title">${escapeHtml(task.title)}</h3>
      <div class="card-deadline ${urgency === "critical" ? "critical" : ""}">⏱ ${formatDeadline(task.deadline)}</div>
      <div class="card-footer">
        <span class="status-badge ${task.status}">${statusLabel(task.status)}</span>
      </div>
    `;
    card.addEventListener("click", () => openModal(task.id));
    board.appendChild(card);
  });
}

function statusLabel(status) {
  return (
    { todo: "Belum", doing: "Dikerjakan", done: "Selesai" }[status] || status
  );
}

function renderRing() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const circumference = 2 * Math.PI * 52; // ~327
  const offset = circumference - (pct / 100) * circumference;
  const ringProgress = document.getElementById("ringProgress");
  ringProgress.style.strokeDasharray = circumference;
  ringProgress.style.strokeDashoffset = offset;

  // warna ring berubah jika ada tugas kritis
  const hasCritical = tasks.some(
    (t) => t.status !== "done" && urgencyLevel(t) === "critical",
  );
  ringProgress.style.stroke = hasCritical ? "var(--urgent)" : "var(--done)";

  document.getElementById("ringPercent").textContent = pct + "%";
}

function renderSummary() {
  const total = tasks.length;
  const critical = tasks.filter(
    (t) => t.status !== "done" && urgencyLevel(t) === "critical",
  ).length;
  const summaryLine = document.getElementById("summaryLine");
  const greeting = document.getElementById("greeting");

  greeting.textContent = "Halo, Mahasiswa!";

  if (total === 0) {
    summaryLine.textContent = "Belum ada tugas. Yuk tambahkan yang pertama.";
  } else if (critical > 0) {
    summaryLine.textContent = `${critical} tugas mendekati atau melewati deadline. Perlu perhatian sekarang.`;
  } else {
    summaryLine.textContent = `Kamu punya ${total} tugas terlacak. Semua masih dalam kendali.`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============ MODAL ============
function openModal(taskId = null, prefill = null) {
  editingId = taskId;
  taskForm.reset();
  selectedStatus = "todo";
  setStatusToggle("todo");

  const deadlineLabel = document.getElementById("deadlineLabel");

  if (taskId) {
    const task = tasks.find((t) => t.id === taskId);
    modalTitle.textContent = task.isLaprak ? "Edit laprak" : "Edit tugas";
    deadlineLabel.textContent = task.isLaprak ? "Tanggal & Jam" : "Deadline";
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskCourse").value = task.course;
    document.getElementById("taskDeadline").value = toLocalInputValue(
      task.deadline,
    );
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskNotes").value = task.notes || "";
    setStatusToggle(task.status);
    btnDelete.style.display = "inline-block";
    btnDelete.textContent = task.isLaprak ? "Hapus laprak" : "Hapus tugas";
    taskForm.dataset.isLaprak = task.isLaprak ? "true" : "false";
  } else {
    modalTitle.textContent = prefill?.modalTitle || "Tugas baru";
    deadlineLabel.textContent = prefill?.isLaprak
      ? "Tanggal & Jam"
      : "Deadline";
    btnDelete.style.display = "none";
    taskForm.dataset.isLaprak = prefill?.isLaprak ? "true" : "false";
    // default tanggal: besok jam 23:59
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    document.getElementById("taskDeadline").value = toLocalInputValue(
      tomorrow.toISOString(),
    );

    if (prefill) {
      if (prefill.title)
        document.getElementById("taskTitle").value = prefill.title;
      if (prefill.course)
        document.getElementById("taskCourse").value = prefill.course;
      if (prefill.priority)
        document.getElementById("taskPriority").value = prefill.priority;
    }
  }

  modalBackdrop.classList.add("show");
  document.getElementById("taskTitle").focus();
}

function closeModal() {
  modalBackdrop.classList.remove("show");
  editingId = null;
}

function toLocalInputValue(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function setStatusToggle(status) {
  selectedStatus = status;
  [...statusToggle.children].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.status === status);
  });
}

// ============ EVENTS ============
document.getElementById("btnAdd").addEventListener("click", () => openModal());

document.getElementById("btnAddLaprak").addEventListener("click", () => {
  openModal(null, {
    modalTitle: "Laprak baru",
    course: "Laprak",
    priority: "medium",
    isLaprak: true,
  });
});
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("btnCancel").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalBackdrop.classList.contains("show"))
    closeModal();
});

statusToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".status-opt");
  if (btn) setStatusToggle(btn.dataset.status);
});

document.getElementById("filterLaprak").addEventListener("click", () => {
  currentCourseFilter = null;
  laprakFilterActive = !laprakFilterActive;
  render();
});

document.querySelectorAll(".filter-item[data-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document
      .querySelectorAll(".filter-item[data-filter]")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const course = document.getElementById("taskCourse").value.trim();
  const deadline = new Date(
    document.getElementById("taskDeadline").value,
  ).toISOString();
  const priority = document.getElementById("taskPriority").value;
  const notes = document.getElementById("taskNotes").value.trim();
  const isLaprak = taskForm.dataset.isLaprak === "true";

  if (editingId) {
    const task = tasks.find((t) => t.id === editingId);
    Object.assign(task, {
      title,
      course,
      deadline,
      priority,
      notes,
      status: selectedStatus,
    });
  } else {
    tasks.push({
      id: uid(),
      title,
      course,
      deadline,
      priority,
      notes,
      status: selectedStatus,
      isLaprak,
      createdAt: new Date().toISOString(),
    });
  }

  saveTasks();
  closeModal();
  render();
});

btnDelete.addEventListener("click", () => {
  if (!editingId) return;
  if (confirm("Hapus tugas ini? Tindakan ini tidak bisa dibatalkan.")) {
    tasks = tasks.filter((t) => t.id !== editingId);
    saveTasks();
    closeModal();
    render();
  }
});

// ============ INIT ============
render();

// refresh tampilan tiap menit biar status "X jam lagi" & urgency tetap update
setInterval(render, 60000);
