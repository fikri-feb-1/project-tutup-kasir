// ================= UTILITY =================
function format(num) {
  return num.toLocaleString("id-ID");
}

function getValue(id) {
  let el = document.getElementById(id);
  if (!el) return 0;
  let raw = el.value.replace(/\./g, "").replace(/\D/g, "");
  return parseInt(raw) || 0;
}

function formatRupiahInput(el) {
  let value = el.value.replace(/\D/g, "");
  if (!value) {
    el.value = "";
    return;
  }
  el.value = new Intl.NumberFormat("id-ID").format(value);
}

// ================= DATA KARYAWAN =================
const DAFTAR_KARYAWAN = ["Esa", "Fikri", "Rifki", "Gata", "Iqbal"];

function renderKaryawanChecklist() {
  const container = document.getElementById("karyawanContainer");
  if (!container) return;

  container.innerHTML = DAFTAR_KARYAWAN.map(
    (nama, index) => `
    <div class="karyawan-item">
      <input type="checkbox" id="karyawan_${index}" value="${nama}" checked>
      <label for="karyawan_${index}">${nama}</label>
    </div>
  `,
  ).join("");
}

function getActiveKaryawan() {
  const aktif = [];
  DAFTAR_KARYAWAN.forEach((_, index) => {
    const cb = document.getElementById(`karyawan_${index}`);
    if (cb && cb.checked) {
      aktif.push(cb.value);
    }
  });
  return aktif;
}

// ================= PENGELUARAN MOBILE (DIPERBAIKI TOTAL) =================
function tambahPengeluaran() {
  const container = document.getElementById("pengeluaranList");

  const div = document.createElement("div");
  div.classList.add("pengeluaran-item");

  div.innerHTML = `
    <select onchange="toggleModeLainLain(this)">
      <option value="Galon" data-type="pcs">Galon</option>
      <option value="Rinso" data-type="pcs">Rinso</option>
      <option value="Gas LPG" data-type="pcs">Gas LPG</option>
      <option value="Tisu" data-type="pcs">Tisu</option>
      <option value="Listrik" data-type="nonpcs">Listrik</option>
      <option value="Air PDAM" data-type="nonpcs">Air PDAM</option>
      <option value="Wifi" data-type="nonpcs">Wifi</option>
      <option value="Lain-lain" data-type="custom">Lain-lain</option>
    </select>

    <!-- Input khusus untuk mode Lain-lain (custom nama + harga) -->
    <div class="lainlain-group" style="display:none">
      <input type="text" class="custom-nama" placeholder="Nama pengeluaran (contoh: General Cleaning)">
      <input type="text" class="custom-harga" placeholder="Harga" oninput="formatRupiahInput(this); hitungTotal()">
    </div>

    <!-- Input untuk mode normal (barang dengan jumlah) -->
    <div class="normal-group">
      <div class="item-row">
        <input type="text" class="jumlah" value="1" placeholder="Jml" oninput="hitungTotal()" style="text-align:center">
        <input type="text" class="harga" placeholder="Harga" oninput="formatRupiahInput(this); hitungTotal()">
        <button type="button" class="delete-item" onclick="hapusPengeluaran(this)">✕</button>
      </div>
    </div>
  `;

  container.appendChild(div);
}

function hapusPengeluaran(btn) {
  const item = btn.closest(".pengeluaran-item");
  if (item) item.remove();
  hitungTotal();
}

function toggleModeLainLain(select) {
  const row = select.closest(".pengeluaran-item");
  const lainlainGroup = row.querySelector(".lainlain-group");
  const normalGroup = row.querySelector(".normal-group");
  const selectOption = select.options[select.selectedIndex];
  const type = selectOption.dataset.type;
  const isLainLain = select.value.toLowerCase() === "lain-lain";

  // Tampilkan/sembunyikan group berdasarkan pilihan
  if (isLainLain) {
    lainlainGroup.style.display = "block";
    normalGroup.style.display = "none";

    // Bersihkan input normal
    const jumlahInput = normalGroup.querySelector(".jumlah");
    const hargaInput = normalGroup.querySelector(".harga");
    if (jumlahInput) jumlahInput.value = "1";
    if (hargaInput) hargaInput.value = "";
  } else {
    lainlainGroup.style.display = "none";
    normalGroup.style.display = "block";

    // Bersihkan input custom
    const customNama = lainlainGroup.querySelector(".custom-nama");
    const customHarga = lainlainGroup.querySelector(".custom-harga");
    if (customNama) customNama.value = "";
    if (customHarga) customHarga.value = "";
  }

  // Untuk tipe nonpcs (Listrik, Air PDAM, Wifi) disable jumlah
  if (type === "nonpcs" && !isLainLain) {
    const jumlahInput = normalGroup.querySelector(".jumlah");
    if (jumlahInput) {
      jumlahInput.value = "1";
      jumlahInput.disabled = true;
    }
  } else if (type === "pcs" && !isLainLain) {
    const jumlahInput = normalGroup.querySelector(".jumlah");
    if (jumlahInput) {
      jumlahInput.disabled = false;
    }
  }

  hitungTotal();
}

function hitungTotal() {
  let total = 0;

  document.querySelectorAll("#pengeluaranList .pengeluaran-item").forEach((row) => {
    const select = row.querySelector("select");
    const isLainLain = select?.value.toLowerCase() === "lain-lain";

    if (isLainLain) {
      // Mode Lain-lain: ambil dari custom-harga
      const customHarga = row.querySelector(".custom-harga");
      if (customHarga) {
        let h = parseInt(customHarga.value.replace(/\./g, "")) || 0;
        total += h;
      }
    } else {
      // Mode normal: ambil dari input harga
      const hargaInput = row.querySelector(".normal-group .harga");
      if (hargaInput) {
        let h = parseInt(hargaInput.value.replace(/\./g, "")) || 0;
        total += h;
      }
    }
  });

  document.getElementById("totalPengeluaran").innerText = format(total);
}

function getPengeluaranText() {
  let text = "";
  let total = 0;

  document.querySelectorAll("#pengeluaranList .pengeluaran-item").forEach((row) => {
    const select = row.querySelector("select");
    const isLainLain = select?.value.toLowerCase() === "lain-lain";
    const type = select?.options[select.selectedIndex]?.dataset.type;

    if (isLainLain) {
      // Mode Lain-lain: ambil custom nama dan harga
      const customNama = row.querySelector(".custom-nama")?.value.trim();
      const customHarga = row.querySelector(".custom-harga");
      let h = parseInt(customHarga?.value.replace(/\./g, "")) || 0;

      if (h > 0 && customNama && customNama !== "") {
        total += h;
        text += ` ${customNama} ${format(h)}\n`;
      } else if (h > 0 && (!customNama || customNama === "")) {
        total += h;
        text += ` Lain-lain ${format(h)}\n`;
      }
    } else {
      // Mode normal
      const nama = select?.value || "";
      const jumlah = row.querySelector(".normal-group .jumlah");
      const harga = row.querySelector(".normal-group .harga");

      let j = parseInt(jumlah?.value) || 0;
      let h = parseInt(harga?.value.replace(/\./g, "")) || 0;

      if (h === 0) return;
      total += h;

      if (type === "nonpcs") {
        // Listrik, Air PDAM, Wifi: tanpa pcs
        text += ` ${nama} ${format(h)}\n`;
      } else {
        // Barang dengan pcs
        if (j > 0) {
          text += ` ${nama} ${j} pcs ${format(h)}\n`;
        } else {
          text += ` ${nama} ${format(h)}\n`;
        }
      }
    }
  });

  return { text, total };
}

// ================= GENERATE LAPORAN =================
function generate() {
  //Pengambilan data dari Input User
  let pengeluaranData = getPengeluaranText();
  let totalSalesLama = getValue("totalSalesLama");
  let totalCULama = getValue("totalCULama");
  let today = new Date();
  let tanggal = today.getDate();
  let bulan = today.getMonth() + 1;
  let tahun = today.getFullYear();

  let salesHariIni = getValue("salesHarian");
  let cuHariIni = getValue("cuHarian");

  //Rumus AVG Omset dan Total CU
  let totalSalesBaru = totalSalesLama + salesHariIni;
  let totalCUBaru = totalCULama + cuHariIni;
  let avgOmset = Math.round(totalSalesBaru / tanggal);
  let avgCU = (totalCUBaru / tanggal).toFixed(2);
  let avgHarian = Math.round(salesHariIni / (cuHariIni || 1));

  //Ambil nilai dari E-COMMERCE
  let shopeefood = getValue("sf1") + getValue("sf2");
  let gofood = getValue("gf1") + getValue("gf2");
  let grab = getValue("gr1") + getValue("gr2");
  let qris = getValue("qris1") + getValue("qris2");
  let qpon = getValue("qpon1") + getValue("qpon2");
  let tiktok = getValue("Tt1") + getValue("Tt2");

  // Ambil nilai waste dan minuman
  let wasteCB = getNumberValue("wasteCB");
  let wasteCK = getNumberValue("wasteCK");
  let leMineral = getNumberValue("leMineral");
  let tehPucuk = getNumberValue("tehPucuk");

  let timBertugas = getActiveKaryawan();
  let timText = "";
  if (timBertugas.length === 0) {
    timText = "Tidak ada tim yang bertugas";
  } else {
    timBertugas.forEach((nama, idx) => {
      timText += `${idx + 1}. ${nama}\n`;
    });
  }

  let laporan = `
_*🪽🐣TUTUP KASIR S Parman🐥🪽*_

*Laporan Sales Geprekin S Parman,Ngawi*
*${tanggal}/${bulan}/${tahun}*
______________________
 *Laporan Sales Bulanan*

• Estimasi Sales Bulanan: 137.791.460
• Target Sales Harian: 3.862.142
______________________

*• Target Sales Bulanan: Rp130.085.430,20*
*• Total Sales Bulanan : ${format(totalSalesBaru)}*
*• Avg Omset : ${format(avgOmset)}*
*• Total CU : ${format(totalCUBaru)}*
*• Avg CU : ${avgCU}*
______________________
*Laporan Harian:*
*Sales  : ${format(salesHariIni)}*
*CU     : ${cuHariIni}*
*AVG    : ${format(avgHarian)}*
______________________
*MENU BARU*
- Gangnam Jumbo : 13
- Gangnam Hemat : 5
- Gangnam double :
- Extra Gangnam : 8
______________________
*E-commerce :*
*Go-Food : ${format(gofood)}*
*Grab : ${format(grab)}*
*Qris: ${format(qris)}*
*Qpon: ${format(qpon)}*
*Tiktok shop: ${format(tiktok)}*
*Shopeefood: ${format(shopeefood)}*
_______________________

*_Pengeluaran_ :*
${pengeluaranData.text || "- Tidak ada pengeluaran -"}
*Total: ${format(pengeluaranData.total)}*
_______________________
*Ayam Waste*
*CB: ${wasteCB}*
*CK: ${wasteCK}*
________________________

*Le mineral*
*Terjual : ${leMineral}*

*Teh pucuk*
*Terjual : ${tehPucuk}*

tim yang bertugas
${timText}
`;

  document.getElementById("result").value = laporan;
}

// ================= FORMAT ANGKA BIASA (TANPA RUPIAH) =================
function formatNumberInput(el) {
  let value = el.value.replace(/\D/g, "");
  if (!value) {
    el.value = "";
    return;
  }
  el.value = new Intl.NumberFormat("id-ID").format(parseInt(value));
}

function getNumberValue(id) {
  let el = document.getElementById(id);
  if (!el) return 0;
  let raw = el.value.replace(/\./g, "").replace(/\D/g, "");
  return parseInt(raw) || 0;
}

// ================= COPY LAPORAN =================
async function copyText() {
  const textarea = document.getElementById("result");
  const laporanText = textarea.value;

  if (!laporanText || laporanText.trim() === "") {
    showToast("⚠️ Tidak ada laporan untuk di copy!", "warning");
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(laporanText);
      showToast("✅ Laporan berhasil disalin ke clipboard!", "success");
      textarea.style.backgroundColor = "#e6f7e6";
      setTimeout(() => {
        textarea.style.backgroundColor = "#fefce8";
      }, 500);
    } catch (err) {
      console.error("Clipboard failed:", err);
      fallbackCopy(textarea);
    }
  } else {
    fallbackCopy(textarea);
  }
}

function fallbackCopy(textarea) {
  textarea.select();
  textarea.setSelectionRange(0, 99999);

  try {
    const success = document.execCommand("copy");
    if (success) {
      showToast("✅ Laporan disalin!", "success");
    } else {
      showToast("❌ Gagal menyalin, silakan copy manual", "error");
    }
  } catch (err) {
    showToast("❌ Gagal menyalin: " + err.message, "error");
  }

  textarea.blur();
}

function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "success" ? "#10b981" : type === "warning" ? "#f59e0b" : "#ef4444"};
    color: white;
    padding: 12px 20px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    white-space: nowrap;
    max-width: 90%;
    white-space: normal;
    text-align: center;
    font-family: system-ui, -apple-system, sans-serif;
    pointer-events: none;
    animation: slideUp 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
document.head.appendChild(style);

// ================= INIT =================
window.onload = () => {
  renderKaryawanChecklist();
  if (document.querySelectorAll("#pengeluaranList .pengeluaran-item").length === 0) {
    tambahPengeluaran();
  }
  hitungTotal();
};
