/* ══════════════════════════════════════
   Sistem Presensi Kuliah — app.js
   ══════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────
   STORAGE
   ───────────────────────────────────── */
const STORAGE_KEY = "presensi_app_v2";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultData();
  } catch (e) {
    console.warn("Gagal memuat data, menggunakan data default.", e);
    return defaultData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function defaultData() {
  return {
    matkul: "Nama Mata Kuliah",
    kode: "MK001",
    semester: "Genap 2024/2025",
    mahasiswa: [],
    presensi: {},
  };
}

/* ─────────────────────────────────────
   STATE
   ───────────────────────────────────── */
let appData = loadData();
let currentStatus = {}; // { [nim]: 'hadir' | 'izin' | 'alpha' }
let toastTimer = null;

/* ─────────────────────────────────────
   INIT
   ───────────────────────────────────── */
function init() {
  setDefaultDate();
  updateInfoMatkul();
  resetCurrentStatus();
  renderAttendance();
  renderRiwayat();
}

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("tgl-presensi").value = today;
}

function resetCurrentStatus() {
  currentStatus = {};
  appData.mahasiswa.forEach((m) => {
    currentStatus[m.nim] = "hadir";
  });
}

/* ─────────────────────────────────────
   PENGATURAN MATA KULIAH
   ───────────────────────────────────── */
function openMatkul() {
  const mk = prompt("Nama Mata Kuliah:", appData.matkul);
  if (mk === null) return;

  const kd = prompt("Kode MK:", appData.kode);
  if (kd === null) return;

  const sm = prompt("Semester:", appData.semester);
  if (sm === null) return;

  appData.matkul = mk.trim() || appData.matkul;
  appData.kode = kd.trim() || appData.kode;
  appData.semester = sm.trim() || appData.semester;

  saveData();
  updateInfoMatkul();
  showToast("Pengaturan berhasil disimpan");
}

function updateInfoMatkul() {
  document.getElementById("info-matkul").textContent =
    `${appData.matkul} · ${appData.kode} · ${appData.semester}`;
}

/* ─────────────────────────────────────
   TABS
   ───────────────────────────────────── */
function switchTab(id, el) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));

  document.getElementById("tab-" + id).classList.add("active");
  el.classList.add("active");

  if (id === "presensi") {
    renderAttendance();
    renderRiwayat();
  }
  if (id === "mahasiswa") renderMhsList("");
  if (id === "rekap") renderRekap();
}

// Pindah tab via nama (dipakai dari tombol CTA di presensi)
function switchTabByName(id) {
  const tabEl = document.querySelector(`.tab[onclick*="'${id}'"]`);
  if (tabEl) switchTab(id, tabEl);
}

/* ─────────────────────────────────────
   PRESENSI — INPUT
   ───────────────────────────────────── */
function getNextPertemuan() {
  return Object.keys(appData.presensi).length + 1;
}

function renderAttendance() {
  const list = document.getElementById("attendance-list");
  const toolbar = document.getElementById("presensi-toolbar");
  const mhs = appData.mahasiswa;

  document.getElementById("pertemuan-label").textContent = getNextPertemuan();

  if (!mhs.length) {
    // Sembunyikan toolbar simpan & tandai semua
    if (toolbar) toolbar.style.display = "none";
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="ti ti-user-plus"></i>
        </div>
        <div class="empty-state-title">Belum ada mahasiswa terdaftar</div>
        <div class="empty-state-desc">
          Tambahkan data mahasiswa terlebih dahulu sebelum melakukan presensi.
        </div>
        <button class="btn primary" onclick="switchTabByName('mahasiswa')">
          <i class="ti ti-plus"></i> Tambah Mahasiswa Sekarang
        </button>
      </div>`;
    updateStats();
    return;
  }

  // Tampilkan toolbar jika ada mahasiswa
  if (toolbar) toolbar.style.display = "";
  list.innerHTML = mhs.map((m) => buildMhsRow(m)).join("");
  updateStats();
}

function buildMhsRow(m) {
  const st = currentStatus[m.nim] || "hadir";
  const initials = getInitials(m.nama);
  return `
    <div class="mhs-row">
      <div class="avatar">${initials}</div>
      <div class="mhs-info">
        <div class="mhs-name">${m.nama}</div>
        <div class="mhs-nim">${m.nim} · Kelas ${m.kelas}</div>
      </div>
      <div class="status-btns">
        <button class="sbtn hadir ${st === "hadir" ? "sel" : ""}"
                onclick="setStatus('${m.nim}', 'hadir', this)">Hadir</button>
        <button class="sbtn izin  ${st === "izin" ? "sel" : ""}"
                onclick="setStatus('${m.nim}', 'izin',  this)">Izin</button>
        <button class="sbtn alpha ${st === "alpha" ? "sel" : ""}"
                onclick="setStatus('${m.nim}', 'alpha', this)">Alpha</button>
      </div>
    </div>`;
}

function setStatus(nim, status, el) {
  currentStatus[nim] = status;
  const row = el.closest(".mhs-row");
  row.querySelectorAll(".sbtn").forEach((b) => b.classList.remove("sel"));
  el.classList.add("sel");
  updateStats();
}

function allStatus(status) {
  appData.mahasiswa.forEach((m) => {
    currentStatus[m.nim] = status;
  });
  renderAttendance();
}

function updateStats() {
  let h = 0,
    iz = 0,
    al = 0;
  appData.mahasiswa.forEach((m) => {
    const st = currentStatus[m.nim] || "hadir";
    if (st === "hadir") h++;
    else if (st === "izin") iz++;
    else al++;
  });

  document.getElementById("s-total").textContent = appData.mahasiswa.length;
  document.getElementById("s-hadir").textContent = h;
  document.getElementById("s-izin").textContent = iz;
  document.getElementById("s-alpha").textContent = al;
}

function simpanPresensi() {
  const tgl = document.getElementById("tgl-presensi").value;

  if (!tgl) {
    showToast("Pilih tanggal terlebih dahulu", "err");
    return;
  }
  if (!appData.mahasiswa.length) {
    showToast("Tidak ada mahasiswa terdaftar", "err");
    return;
  }
  if (appData.presensi[tgl]) {
    if (!confirm(`Presensi tanggal ${tgl} sudah ada.\nTimpa data lama?`))
      return;
  }

  const data = {};
  appData.mahasiswa.forEach((m) => {
    data[m.nim] = currentStatus[m.nim] || "hadir";
  });
  appData.presensi[tgl] = data;

  saveData();
  resetCurrentStatus();
  renderAttendance();
  renderRiwayat();
  showToast(`Presensi ${tgl} berhasil disimpan!`);
}

/* ─────────────────────────────────────
   PRESENSI — RIWAYAT
   ───────────────────────────────────── */
function renderRiwayat() {
  const tbody = document.getElementById("riwayat-tbody");
  const tgls = Object.keys(appData.presensi).sort();

  if (!tgls.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">Belum ada riwayat presensi</td></tr>`;
    return;
  }

  tbody.innerHTML = tgls
    .map((tgl, i) => {
      const data = appData.presensi[tgl];
      let h = 0,
        iz = 0,
        al = 0;
      Object.values(data).forEach((st) => {
        if (st === "hadir") h++;
        else if (st === "izin") iz++;
        else al++;
      });
      return `
      <tr>
        <td style="font-weight:500">Pertemuan ${i + 1}</td>
        <td>${tgl}</td>
        <td style="color:var(--green)">${h}</td>
        <td style="color:var(--amber)">${iz}</td>
        <td style="color:var(--red)">${al}</td>
        <td>
          <button class="btn sm danger" onclick="hapusPresensi('${tgl}')">
            <i class="ti ti-trash"></i>
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

function hapusPresensi(tgl) {
  if (!confirm(`Hapus presensi tanggal ${tgl}?`)) return;
  delete appData.presensi[tgl];
  saveData();
  renderRiwayat();
  renderAttendance();
  showToast(`Presensi ${tgl} dihapus`);
}

/* ─────────────────────────────────────
   MAHASISWA
   ───────────────────────────────────── */
function tambahMahasiswa() {
  const nim = document.getElementById("inp-nim").value.trim();
  const nama = document.getElementById("inp-nama").value.trim();
  const kelas = document.getElementById("inp-kelas").value.trim();

  if (!nim || !nama) {
    showToast("NIM dan Nama wajib diisi", "err");
    return;
  }
  if (appData.mahasiswa.find((m) => m.nim === nim)) {
    showToast(`NIM ${nim} sudah terdaftar`, "err");
    return;
  }

  appData.mahasiswa.push({ nim, nama, kelas: kelas || "-" });
  currentStatus[nim] = "hadir";

  saveData();
  clearMhsForm();
  renderMhsList("");
  showToast(`${nama} berhasil ditambahkan`);
}

function hapusMahasiswa(nim) {
  const mhs = appData.mahasiswa.find((m) => m.nim === nim);
  if (!confirm(`Hapus mahasiswa ${mhs.nama} (${nim})?`)) return;

  appData.mahasiswa = appData.mahasiswa.filter((m) => m.nim !== nim);
  Object.keys(appData.presensi).forEach((tgl) => {
    delete appData.presensi[tgl][nim];
  });
  delete currentStatus[nim];

  saveData();
  renderMhsList("");
  showToast("Mahasiswa berhasil dihapus");
}

function renderMhsList(query) {
  const tbody = document.getElementById("mhs-tbody");
  const q = query.toLowerCase();
  const mhs = appData.mahasiswa.filter(
    (m) => m.nim.includes(q) || m.nama.toLowerCase().includes(q),
  );

  document.getElementById("jml-mhs").textContent =
    `${appData.mahasiswa.length} mahasiswa`;

  if (!mhs.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">Tidak ditemukan</td></tr>`;
    return;
  }

  const tgls = Object.keys(appData.presensi);

  tbody.innerHTML = mhs
    .map((m) => {
      const { h, iz, al } = getKehadiranStat(m.nim, tgls);
      const total = tgls.length;
      const pct = total ? Math.round((h / total) * 100) : 100;
      const fill = pctColor(pct);

      return `
      <tr>
        <td style="font-weight:500">${m.nim}</td>
        <td>${m.nama}</td>
        <td>${m.kelas}</td>
        <td style="min-width:130px">
          <div style="font-size:11px;color:var(--text-secondary)">
            ${total ? `${pct}% (${h}/${total} pertemuan)` : "Belum ada presensi"}
          </div>
          <div class="percent-bar">
            <div class="percent-fill" style="width:${total ? pct : 100}%;background:${fill}"></div>
          </div>
        </td>
        <td>
          <button class="btn sm danger" onclick="hapusMahasiswa('${m.nim}')">
            <i class="ti ti-trash"></i>
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

function clearMhsForm() {
  ["inp-nim", "inp-nama", "inp-kelas"].forEach((id) => {
    document.getElementById(id).value = "";
  });
}

/* ─────────────────────────────────────
   REKAP
   ───────────────────────────────────── */
function renderRekap() {
  const tgls = Object.keys(appData.presensi).sort();
  const filterKelas = document.getElementById("filter-kelas").value;

  updateKelasFilter();

  const mhs = appData.mahasiswa.filter(
    (m) => !filterKelas || m.kelas === filterKelas,
  );

  renderRekapTable(mhs, tgls);
  renderRingkasan(mhs, tgls);
}

function updateKelasFilter() {
  const kelasList = [...new Set(appData.mahasiswa.map((m) => m.kelas))].sort();
  const sel = document.getElementById("filter-kelas");
  const curVal = sel.value;

  sel.innerHTML =
    '<option value="">Semua Kelas</option>' +
    kelasList
      .map(
        (k) =>
          `<option value="${k}" ${k === curVal ? "selected" : ""}>${k}</option>`,
      )
      .join("");
}

function renderRekapTable(mhs, tgls) {
  const head = document.getElementById("rekap-head");
  const tbody = document.getElementById("rekap-tbody");

  head.innerHTML =
    "<th>NIM</th><th>Nama</th><th>Kls</th>" +
    tgls
      .map((t, i) => `<th title="${t}" style="min-width:38px">P${i + 1}</th>`)
      .join("") +
    "<th>H</th><th>I</th><th>A</th><th>%</th>";

  if (!mhs.length) {
    tbody.innerHTML = `<tr><td colspan="${4 + tgls.length}" class="empty">Tidak ada mahasiswa</td></tr>`;
    return;
  }

  tbody.innerHTML = mhs
    .map((m) => {
      let h = 0,
        iz = 0,
        al = 0;
      const cells = tgls
        .map((tgl) => {
          const st = appData.presensi[tgl]?.[m.nim] || "-";
          if (st === "hadir") h++;
          else if (st === "izin") iz++;
          else if (st === "alpha") al++;
          const cls =
            st === "hadir"
              ? "hadir"
              : st === "izin"
                ? "izin"
                : st === "alpha"
                  ? "alpha"
                  : "";
          const label =
            st === "hadir"
              ? "H"
              : st === "izin"
                ? "I"
                : st === "alpha"
                  ? "A"
                  : "-";
          return `<td><span class="badge ${cls}">${label}</span></td>`;
        })
        .join("");

      const tot = h + iz + al;
      const pct = tot ? Math.round((h / tot) * 100) : null;
      const clr = pct !== null ? pctColor(pct) : "var(--text-secondary)";

      return `
      <tr>
        <td style="font-weight:500;font-size:12px">${m.nim}</td>
        <td>${m.nama}</td>
        <td>${m.kelas}</td>
        ${cells}
        <td style="color:var(--green);font-weight:500">${h}</td>
        <td style="color:var(--amber)">${iz}</td>
        <td style="color:var(--red)">${al}</td>
        <td style="font-weight:500;color:${clr}">${pct !== null ? pct + "%" : "-"}</td>
      </tr>`;
    })
    .join("");
}

function renderRingkasan(mhs, tgls) {
  const container = document.getElementById("ringkasan-list");

  if (!mhs.length) {
    container.innerHTML = '<div class="empty">Tidak ada data</div>';
    return;
  }

  container.innerHTML = mhs
    .map((m) => {
      const { h, iz, al } = getKehadiranStat(m.nim, tgls);
      const tot = h + iz + al;
      const pct = tot ? Math.round((h / tot) * 100) : 100;
      const fill = pctColor(pct);
      const clr = pct >= 80 ? "#0F6E56" : pct >= 60 ? "#BA7517" : "#A32D2D";

      return `
      <div class="ringkasan-row">
        <div class="avatar">${getInitials(m.nama)}</div>
        <div class="ringkasan-info">
          <div class="ringkasan-name">
            ${m.nama}
            <span style="font-size:11px;color:var(--text-secondary);font-weight:400">${m.nim}</span>
          </div>
          <div class="percent-bar" style="margin-top:6px">
            <div class="percent-fill" style="width:${pct}%;background:${fill}"></div>
          </div>
        </div>
        <div class="ringkasan-stat">
          <div class="ringkasan-pct" style="color:${clr}">${pct}%</div>
          <div class="ringkasan-detail">${h}H ${iz}I ${al}A</div>
        </div>
      </div>`;
    })
    .join("");
}

/* ─────────────────────────────────────
   EXPORT CSV
   ───────────────────────────────────── */
function exportCSV() {
  const tgls = Object.keys(appData.presensi).sort();
  const mhs = appData.mahasiswa;

  const pertemuanHeaders = tgls.map((t, i) => `P${i + 1} (${t})`);
  const header = [
    "NIM",
    "Nama",
    "Kelas",
    ...pertemuanHeaders,
    "Hadir",
    "Izin",
    "Alpha",
    "Persentase (%)",
  ];

  const rows = mhs.map((m) => {
    let h = 0,
      iz = 0,
      al = 0;
    const cells = tgls.map((tgl) => {
      const st = appData.presensi[tgl]?.[m.nim] || "-";
      if (st === "hadir") h++;
      else if (st === "izin") iz++;
      else if (st === "alpha") al++;
      return st;
    });
    const tot = h + iz + al;
    const pct = tot ? Math.round((h / tot) * 100) : "-";
    return [m.nim, `"${m.nama}"`, m.kelas, ...cells, h, iz, al, pct];
  });

  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM untuk Excel
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `presensi_${appData.kode}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast("CSV berhasil diunduh");
}

/* ─────────────────────────────────────
   HELPERS
   ───────────────────────────────────── */
function getInitials(nama) {
  return nama
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getKehadiranStat(nim, tgls) {
  let h = 0,
    iz = 0,
    al = 0;
  tgls.forEach((tgl) => {
    const st = appData.presensi[tgl]?.[nim];
    if (st === "hadir") h++;
    else if (st === "izin") iz++;
    else if (st === "alpha") al++;
  });
  return { h, iz, al };
}

function pctColor(pct) {
  if (pct >= 80) return "#1D9E75";
  if (pct >= 60) return "#EF9F27";
  return "#E24B4A";
}

/* ─────────────────────────────────────
   TOAST NOTIFICATION
   ───────────────────────────────────── */
function showToast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = type === "err" ? "#A32D2D" : "#0F6E56";
  t.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

/* ─────────────────────────────────────
   KEYBOARD SHORTCUT
   ───────────────────────────────────── */
document.addEventListener("keydown", (e) => {
  const tabMhs = document.getElementById("tab-mahasiswa");
  if (e.key === "Enter" && tabMhs.classList.contains("active")) {
    tambahMahasiswa();
  }
});

/* ─────────────────────────────────────
   BOOT
   ───────────────────────────────────── */
init();
