function format(num) {
  return num.toLocaleString("id-ID");
}
function format(num) {
  return num.toLocaleString("id-ID");
}

function getValue(id) {
  return parseInt(document.getElementById(id).value) || 0;
}

function formatRupiahInput(el) {
  let value = el.value.replace(/\D/g, ""); // hapus selain angka

  if (!value) {
    el.value = "";
    return;
  }

  el.value = new Intl.NumberFormat("id-ID").format(value);
}

function getJenis(selectId, customId) {
  let jenis = document.getElementById(selectId).value;
  let custom = document.getElementById(customId).value;

  if (jenis === "Lainnya" && custom !== "") {
    return custom;
  }

  return jenis;
}

function tambahPengeluaran() {
  const container = document.getElementById("pengeluaranList");

  const div = document.createElement("div");
  div.classList.add("row");

  div.innerHTML = `
    <select onchange="toggleCustom(this); toggleMode(this)">
      <option value="Galon" data-type="pcs">Galon</option>
      <option value="Rinso" data-type="pcs">Rinso</option>
      <option value="Gas LPG" data-type="pcs">Gas LPG</option>
      <option value="Tisu" data-type="pcs">Tisu</option>

      <option value="Listrik" data-type="nonpcs">Listrik</option>
      <option value="Air PDAM" data-type="nonpcs">Air PDAM</option>
      <option value="Wifi" data-type="nonpcs">Wifi</option>
      
      <option value="Lain-lain" data-type="pcs">Lain-lain</option>
    </select>

    <input type="text" class="custom" placeholder="Nama barang" style="display:none">

    <input type="number" class="jumlah" min="1" value="1" oninput="hitungTotal()">
    <input type="number" class="harga" placeholder="Harga" oninput="formatRupiahInput(this); hitungTotal()">
  `;

  container.appendChild(div);
}

function toggleCustom(select) {
  const row = select.parentElement;
  const custom = row.querySelector(".custom");
  const number = row.querySelector(".jumlah");

  const isOther = select.value.toLowerCase() === "lain-lain";

  custom.style.display = isOther ? "block" : "none";
  number.style.display = isOther ? "none" : "block";
}

function toggleMode(select) {
  const row = select.parentElement;
  const jumlah = row.querySelector(".jumlah");

  const type = select.options[select.selectedIndex].dataset.type;

  if (type === "nonpcs") {
    jumlah.value = 1;
    jumlah.disabled = true;
  } else {
    jumlah.disabled = false;
  }

  hitungTotal();
}

function getValue(id) {
  let el = document.getElementById(id);
  let value = el.value.replace(/\./g, ""); // hapus titik
  return parseInt(value) || 0;
}

function hitungTotal() {
  let total = 0;

  document.querySelectorAll("#pengeluaranList .row").forEach((row) => {
    const select = row.querySelector("select");
    const jumlah = row.querySelector(".jumlah");
    const harga = row.querySelector(".harga");

    const type = select.options[select.selectedIndex].dataset.type;

    const j = parseInt(jumlah.value) || 0;
    let h = parseInt(harga.value.replace(/\./g, "")) || 0;

    let subtotal = 0;

    if (type === "nonpcs") {
      subtotal = h; // langsung harga
    } else {
      subtotal = h;
    }

    total += subtotal;
  });

  document.getElementById("totalPengeluaran").innerText = format(total);
}

function getPengeluaranText() {
  let text = "";
  let total = 0;

  document.querySelectorAll("#pengeluaranList .row").forEach((row) => {
    const select = row.querySelector("select");
    const custom = row.querySelector(".custom").value;
    const jumlah = row.querySelector(".jumlah");
    const harga = row.querySelector(".harga");

    const type = select.options[select.selectedIndex].dataset.type;

    const j = parseInt(jumlah.value) || 0;
    let h = parseInt(harga.value.replace(/\./g, "")) || 0;

    const jenis = select.value === "Lain-lain" && custom ? custom : select.value;

    let subtotal = 0;

    if (type === "nonpcs") {
      subtotal = h;
    } else {
      subtotal = h;
    }

    if (subtotal > 0) {
      total += subtotal;

      if (type === "nonpcs") {
        text += ` ${jenis} ${format(h)}\n`;
      } else {
        text += ` ${jenis} ${j} pcs ${format(h)}\n`;
      }
    }
  });

  return { text, total };
}

function generate() {
  console.log(new Date());
  let pengeluaranData = getPengeluaranText();
  // ambil data lama
  let totalSalesLama = getValue("totalSalesLama");
  let totalCULama = getValue("totalCULama");
  let today = new Date();
  let tanggal = today.getDate();
  let bulan = today.getMonth() + 1;
  let tahun = today.getFullYear();

  // ambil data hari ini
  let salesHariIni = getValue("salesHarian");
  let cuHariIni = getValue("cuHarian");

  // hitung total baru
  let totalSalesBaru = totalSalesLama + salesHariIni;
  let totalCUBaru = totalCULama + cuHariIni;

  // hitung rata-rata
  let avgOmset = Math.round(totalSalesBaru / tanggal);
  let avgCU = (totalCUBaru / tanggal).toFixed(2);

  // avg harian
  let avgHarian = Math.round(salesHariIni / (cuHariIni || 1));

  // hitung semua
  let shopeefood = getValue("sf1") + getValue("sf2");
  let gofood = getValue("gf1") + getValue("gf2");
  let grab = getValue("gr1") + getValue("gr2");
  let qris = getValue("qris1") + getValue("qris2");
  let qpon = getValue("qpon1") + getValue("qpon2");
  let tiktok = getValue("Tt1") + getValue("Tt2");

  // template
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
*Dana:*
*Transfer bank :*
*Go-Food : ${format(gofood)}*
*Grab : ${format(grab)}*
*Qris: ${format(qris)}*
*Qpon: ${format(qpon)}*
*Tiktok shop: ${format(tiktok)}*
*Shopeefood: ${format(shopeefood)}*
_______________________

*_Pengeluaran_ :*
${pengeluaranData.text}pcs
*Total: ${format(pengeluaranData.total)}*
_______________________
*Ayam Waste*
*CB: 0*
*CK: 0*
________________________
*Le mineral*
*Terjual : *

*Teh pucuk*
*Terjual : * 

*Cuaca*
*pagi : Cerah*
*siang : cerah*
*sore : cerah*
*malam : Hujan*

tim yang bertugas
1. esa
2. Fikri
4. Rifki
5. Gata
6. iqbal
`;

  document.getElementById("result").value = laporan;
}

function copyText() {
  let text = document.getElementById("result");
  text.select();
  document.execCommand("copy");
  alert("Sudah di copy!");
}
