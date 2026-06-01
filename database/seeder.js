/**
 * ============================================================
 * SEEDER SCRIPT
 * Jalankan: node database/seeder.js
 * Fungsi  : Generate password hash yang benar lalu isi DB
 * ============================================================
 */

require("dotenv").config({ path: "../backend/.env" });
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "diagnosa_komputer",
  multipleStatements: true,
};

// ── Data Pakar ───────────────────────────────────────────────
const PAKAR_DATA = [
  { username: "admin", password: "admin123", nama: "Administrator" },
  {
    username: "pakar1",
    password: "pakar1234",
    nama: "Pakar Reparasi Komputer",
  },
  { username: "fikri", password: "fikri123", nama: "Administrator" },
];

// ── Data Kerusakan ───────────────────────────────────────────
const KERUSAKAN_DATA = [
  {
    kode_kerusakan: "K1",
    nama_kerusakan: "Kerusakan Power Supply",
    keterangan:
      "Power supply merupakan perangkat keras yang mengatur bagian kelistrikan dalam sebuah PC. Di dalamnya terdapat komponen yang sering rusak: kapasitor, resistor, sekering, transistor regulator, sakelar, dioda, jalur tembaga di PCB putus, transformator.",
    solusi:
      "1. Ganti PSU dengan yang baru.\n2. Periksa kabel pada power supply, pastikan sudah terpasang dengan benar.\n3. Pasang stabilizer atau cek tegangan listrik.\n4. Cek kipas power supply apakah berputar dengan baik.\n5. Servis atau Replace PSU.",
  },
  {
    kode_kerusakan: "K2",
    nama_kerusakan: "Kerusakan Processor",
    keterangan:
      "Prosesor merupakan komponen komputer yang paling rumit. Komponen yang sering rusak: unit control, register, CPU Interconnection.",
    solusi:
      "1. Pastikan kipas pada processor berfungsi dengan baik.\n2. Buka kipas, ambil processor, bersihkan soket dari kotoran.\n3. Pasang kembali dan beri pasta processor.\n4. Jika masih bermasalah, processor perlu diganti.",
  },
  {
    kode_kerusakan: "K3",
    nama_kerusakan: "Kerusakan Motherboard",
    keterangan:
      "Motherboard merupakan perangkat keras komputer yang sangat penting. Komponen yang sering rusak: chipset, CPU slots, BIOS chip, CMOS, Memory slots, expansion slots, Storage Drive Connector.",
    solusi:
      "1. Ganti motherboard dengan yang baru.\n2. Cek kabel soket kipas pada motherboard.\n3. Cek memori apakah terpasang dengan baik.\n4. Matikan PC dan diamkan beberapa menit.",
  },
  {
    kode_kerusakan: "K4",
    nama_kerusakan: "Kerusakan Harddisk",
    keterangan:
      "Harddisk merupakan media penyimpanan utama. Komponen yang sering rusak: spindle, kabel SATA, head, logic board, ribbon cable, ide/sata conector, setting jumper.",
    solusi:
      "1. Cek pada setup BIOS apakah harddisk masih terdeteksi.\n2. Cek sambungan kabel harddisk di dalam casing.\n3. Jika 'Invalid Partition Table', lakukan partisi ulang.\n4. Jika 'Missing Operating System', format dan install ulang.",
  },
  {
    kode_kerusakan: "K5",
    nama_kerusakan: "Kerusakan CD/DVD ROM",
    keterangan:
      "CD/DVD ROM berfungsi sebagai pemutar keping CD/DVD. Kerusakan terjadi pada optik dan PSU yang kurang memberi daya kepada motor CD/DVD ROM.",
    solusi:
      "1. Cek pada setup BIOS apakah CD/DVD ROM masih terdeteksi.\n2. Hapus driver lama dan ganti dengan yang baru via Device Manager.\n3. Cek kabel-kabel yang terpasang pada CD/DVD Drive.\n4. Periksa setting jumper berdasarkan buku manual.",
  },
  {
    kode_kerusakan: "K6",
    nama_kerusakan: "Kerusakan VGA (Monitor Blank)",
    keterangan:
      "VGA (Video Graphic Adapter) memproses tampilan grafis ke monitor. Kerusakan: artifact video memory, GPU bermasalah, DVI corruption.",
    solusi:
      "1. Cek dan pastikan kabel VGA sudah terpasang ke port VGA di casing.\n2. Cek indikator monitor apakah power berjalan normal.\n3. Cabut VGA card, bersihkan, dan pasang kembali atau ganti yang baru.\n4. Gunakan Windows Troubleshooter untuk Games and Multimedia.",
  },
  {
    kode_kerusakan: "K7",
    nama_kerusakan: "Kerusakan RAM",
    keterangan:
      "RAM (Random Access Memory) berfungsi menyimpan memori sementara saat komputer aktif. Parameter penting: type, capacity, FSB, Bandwidth, jumlah IC.",
    solusi:
      "1. Cek apakah pemasangan memory sudah benar.\n2. Bersihkan kaki-kaki memory menggunakan penghapus.\n3. Bersihkan slot memory dan pasang kembali.\n4. Jika masih bermasalah, RAM perlu diganti.",
  },
  {
    kode_kerusakan: "K8",
    nama_kerusakan: "Kerusakan Slot Memory",
    keterangan:
      "Slot memori digunakan untuk memasang RAM. Apabila RAM sudah dipastikan baik namun masih bermasalah, kemungkinan slot memory rusak, kotor, atau berkerak.",
    solusi:
      "1. Pastikan slot memory bersih, tidak kotor atau berkerak.\n2. Bersihkan slot memory dan pasang kembali RAM.\n3. Coba pindahkan RAM ke slot memory yang berbeda.\n4. Jika semua slot bermasalah, motherboard perlu diganti.",
  },
  {
    kode_kerusakan: "K9",
    nama_kerusakan: "Kerusakan Printer",
    keterangan:
      "Printer merupakan perangkat untuk mencetak hasil kerja digital. Komponen yang sering rusak: mainboard, head dan cartridge, encoder, sensor paper, rol penarik kertas, power supply, kabel fleksibel.",
    solusi:
      "1. Cek kabel USB printer apakah terpasang dengan baik.\n2. Lakukan reset pada cartridge tinta.\n3. Bersihkan atau ganti cartridge jika hasil cetakan buruk.\n4. Bersihkan rol penarik kertas dan pastikan posisi kertas benar.\n5. Jika sensor kertas rusak, ganti sensor printer yang baru.",
  },
];

// ── Data Gejala ──────────────────────────────────────────────
const GEJALA_DATA = [
  {
    kode_gejala: "G01",
    nama_gejala: "Komputer hidup sering restart atau kadang mati sendiri.",
    mb: 0.8,
    md: 0.02,
  },
  {
    kode_gejala: "G02",
    nama_gejala:
      "Setelah dihidupkan PC tidak bereaksi apa-apa, tidak ada tampilan di monitor ketika dipencet tombol on.",
    mb: 0.7,
    md: 0.03,
  },
  {
    kode_gejala: "G03",
    nama_gejala: "Komputer hang ketika memutar video dengan resolusi besar.",
    mb: 0.6,
    md: 0.01,
  },
  {
    kode_gejala: "G04",
    nama_gejala: "Tidak berputarnya kipas pada power supply.",
    mb: 0.85,
    md: 0.04,
  },
  {
    kode_gejala: "G05",
    nama_gejala:
      "Lampu indikator di PC hidup tapi tidak tampil gambar di layar monitor.",
    mb: 0.6,
    md: 0.03,
  },
  {
    kode_gejala: "G06",
    nama_gejala: "Tercium bau hangus dari dalam PC.",
    mb: 0.7,
    md: 0.01,
  },
  {
    kode_gejala: "G07",
    nama_gejala: "PC sering mati tiba-tiba.",
    mb: 0.8,
    md: 0.1,
  },
  {
    kode_gejala: "G08",
    nama_gejala: "Suhu PC terasa sangat panas.",
    mb: 0.85,
    md: 0.06,
  },
  {
    kode_gejala: "G09",
    nama_gejala: "Komputer saat digunakan sering mati mendadak.",
    mb: 0.8,
    md: 0.2,
  },
  {
    kode_gejala: "G10",
    nama_gejala:
      "Kabel power telah terpasang dengan benar namun tetap bermasalah.",
    mb: 0.7,
    md: 0.15,
  },
  {
    kode_gejala: "G11",
    nama_gejala:
      "Setelah dihidupkan semua perangkat tidak terdeteksi sama sekali.",
    mb: 0.8,
    md: 0.01,
  },
  {
    kode_gejala: "G12",
    nama_gejala: "Kipas motherboard tidak berjalan.",
    mb: 0.55,
    md: 0.05,
  },
  {
    kode_gejala: "G13",
    nama_gejala:
      "Bunyi bip 3 kali selang 3 detik dan bunyi lagi saat komputer dinyalakan.",
    mb: 0.7,
    md: 0.02,
  },
  {
    kode_gejala: "G14",
    nama_gejala: "Bunyi bip panjang ketika komputer dinyalakan.",
    mb: 0.85,
    md: 0.04,
  },
  {
    kode_gejala: "G15",
    nama_gejala: "Harddisk tidak terdeteksi pada saat proses booting.",
    mb: 0.8,
    md: 0.07,
  },
  {
    kode_gejala: "G16",
    nama_gejala: "Koneksi kabel harddisk tidak benar atau longgar.",
    mb: 0.6,
    md: 0.01,
  },
  {
    kode_gejala: "G17",
    nama_gejala:
      'Pada saat proses booting muncul pesan "Invalid Partition Table", booting gagal dan sistem tidak bisa diaktifkan.',
    mb: 0.77,
    md: 0.15,
  },
  {
    kode_gejala: "G18",
    nama_gejala:
      'Pada saat booting muncul pesan "Error Loading Operating System" atau "Missing Operating System".',
    mb: 0.75,
    md: 0.2,
  },
  {
    kode_gejala: "G19",
    nama_gejala: "CD/DVD ROM tidak terdeteksi pada saat proses booting.",
    mb: 0.7,
    md: 0.03,
  },
  {
    kode_gejala: "G20",
    nama_gejala: "Driver CD/DVD rusak atau tidak terbaca.",
    mb: 0.8,
    md: 0.2,
  },
  {
    kode_gejala: "G21",
    nama_gejala:
      "Kabel-kabel yang terhubung ke CD/DVD Drive tidak terpasang dengan benar.",
    mb: 0.66,
    md: 0.03,
  },
  {
    kode_gejala: "G22",
    nama_gejala: "Setting Jumper CD/DVD Drive salah.",
    mb: 0.8,
    md: 0.01,
  },
  {
    kode_gejala: "G23",
    nama_gejala: "Pada saat menyalakan monitor, layar monitor gelap dan hitam.",
    mb: 0.8,
    md: 0.1,
  },
  {
    kode_gejala: "G24",
    nama_gejala:
      "Komputer menjadi macet atau hang ketika digunakan untuk bermain game 3D.",
    mb: 0.86,
    md: 0.02,
  },
  {
    kode_gejala: "G25",
    nama_gejala: "Ada titik-titik kecil atau artefak visual di layar monitor.",
    mb: 0.65,
    md: 0.06,
  },
  {
    kode_gejala: "G26",
    nama_gejala: "Terdapat pesan kesalahan grafis pada layar monitor.",
    mb: 0.72,
    md: 0.12,
  },
  {
    kode_gejala: "G27",
    nama_gejala: "Monitor komputer blank (layar gelap total).",
    mb: 0.81,
    md: 0.08,
  },
  {
    kode_gejala: "G28",
    nama_gejala:
      "Lampu indikator pada monitor menyala tapi monitor tetap blank.",
    mb: 0.76,
    md: 0.07,
  },
  {
    kode_gejala: "G29",
    nama_gejala:
      "CPU bekerja (lampu power menyala, kipas berputar) tapi monitor blank.",
    mb: 0.6,
    md: 0.15,
  },
  {
    kode_gejala: "G30",
    nama_gejala: "Kadang layar monitor tampak blue screen (BSOD).",
    mb: 0.85,
    md: 0.1,
  },
  {
    kode_gejala: "G31",
    nama_gejala:
      "Pada saat komputer dinyalakan, terdengar suara bip terus menerus.",
    mb: 0.77,
    md: 0.03,
  },
  {
    kode_gejala: "G32",
    nama_gejala: "RAM sudah terpasang dengan benar namun tetap bermasalah.",
    mb: 0.6,
    md: 0.02,
  },
  {
    kode_gejala: "G33",
    nama_gejala: 'Pada saat blue screen terdapat pesan "Data_Bus_Error".',
    mb: 0.8,
    md: 0.05,
  },
  {
    kode_gejala: "G34",
    nama_gejala: "Printer tidak terdeteksi di sistem komputer.",
    mb: 0.6,
    md: 0.04,
  },
  {
    kode_gejala: "G35",
    nama_gejala:
      "Printer memberikan peringatan tinta habis padahal tinta belum habis.",
    mb: 0.75,
    md: 0.03,
  },
  {
    kode_gejala: "G36",
    nama_gejala: "Hasil cetakan printer tidak bagus atau buram.",
    mb: 0.7,
    md: 0.02,
  },
  {
    kode_gejala: "G37",
    nama_gejala: "Printer bekerja tetapi tidak ada hasil cetakan di kertas.",
    mb: 0.6,
    md: 0.2,
  },
  {
    kode_gejala: "G38",
    nama_gejala: "Hasil cetakan printer tidak sempurna atau bergaris-garis.",
    mb: 0.8,
    md: 0.09,
  },
  {
    kode_gejala: "G39",
    nama_gejala: "Printer gagal menarik kertas.",
    mb: 0.6,
    md: 0.01,
  },
];

// ── Relasi Gejala ↔ Kerusakan ────────────────────────────────
const RELASI_DATA = [
  // K1: Power Supply
  ...[
    "G01",
    "G02",
    "G03",
    "G04",
    "G05",
    "G06",
    "G07",
    "G08",
    "G09",
    "G10",
    "G12",
  ].map((g) => ({ kode_kerusakan: "K1", kode_gejala: g })),
  // K2: Processor
  ...["G09", "G10", "G27"].map((g) => ({
    kode_kerusakan: "K2",
    kode_gejala: g,
  })),
  // K3: Motherboard
  ...["G08", "G11", "G12", "G13", "G14"].map((g) => ({
    kode_kerusakan: "K3",
    kode_gejala: g,
  })),
  // K4: Harddisk
  ...["G15", "G16", "G17", "G18", "G19", "G22"].map((g) => ({
    kode_kerusakan: "K4",
    kode_gejala: g,
  })),
  // K5: CD/DVD ROM
  ...["G19", "G20", "G21", "G22"].map((g) => ({
    kode_kerusakan: "K5",
    kode_gejala: g,
  })),
  // K6: VGA
  ...["G14", "G23", "G24", "G25", "G26"].map((g) => ({
    kode_kerusakan: "K6",
    kode_gejala: g,
  })),
  // K7: RAM
  ...["G08", "G13", "G14", "G27", "G28", "G29", "G30", "G31", "G32"].map(
    (g) => ({ kode_kerusakan: "K7", kode_gejala: g }),
  ),
  // K8: Slot Memory
  ...["G27", "G28", "G29", "G30", "G31", "G32", "G33"].map((g) => ({
    kode_kerusakan: "K8",
    kode_gejala: g,
  })),
  // K9: Printer
  ...["G34", "G35", "G36", "G37", "G38", "G39"].map((g) => ({
    kode_kerusakan: "K9",
    kode_gejala: g,
  })),
];

// ── Buat vektor biner untuk kasus CBR ────────────────────────
const semuaKodeGejala = GEJALA_DATA.map((g) => g.kode_gejala);

const buatVektor = (gejalaDipilih) => {
  const vektor = {};
  for (const kode of semuaKodeGejala) {
    vektor[kode] = gejalaDipilih.includes(kode) ? 1 : 0;
  }
  return vektor;
};

// ── Data Kasus CBR Awal ──────────────────────────────────────
const KASUS_DATA = [
  {
    nama: "K1 - PSU Restart & Mati Sendiri",
    kerusakan: "K1",
    gejala: ["G01", "G02", "G03", "G04", "G07", "G08", "G09", "G10"],
    cf: 0.8999,
  },
  {
    nama: "K1 - PSU Mati Total & Bau Hangus",
    kerusakan: "K1",
    gejala: ["G02", "G04", "G05", "G06", "G07", "G08", "G10", "G12"],
    cf: 0.875,
  },
  {
    nama: "K2 - Processor Mati Mendadak",
    kerusakan: "K2",
    gejala: ["G09", "G10", "G27"],
    cf: 0.792,
  },
  {
    nama: "K3 - Motherboard Bip 3x",
    kerusakan: "K3",
    gejala: ["G08", "G11", "G12", "G13", "G14"],
    cf: 0.914,
  },
  {
    nama: "K4 - Harddisk Tidak Terdeteksi",
    kerusakan: "K4",
    gejala: ["G15", "G16", "G17", "G18"],
    cf: 0.938,
  },
  {
    nama: "K4 - Harddisk Missing OS",
    kerusakan: "K4",
    gejala: ["G15", "G18"],
    cf: 0.86,
  },
  {
    nama: "K5 - CD/DVD ROM Tidak Terbaca",
    kerusakan: "K5",
    gejala: ["G19", "G20", "G21", "G22"],
    cf: 0.956,
  },
  {
    nama: "K6 - VGA Monitor Gelap & Hang Gaming",
    kerusakan: "K6",
    gejala: ["G14", "G23", "G24", "G25", "G26"],
    cf: 0.972,
  },
  {
    nama: "K7 - RAM BSOD & Monitor Blank",
    kerusakan: "K7",
    gejala: ["G08", "G13", "G14", "G27", "G28", "G29", "G30", "G31", "G32"],
    cf: 0.984,
  },
  {
    nama: "K8 - Slot Memory Data Bus Error",
    kerusakan: "K8",
    gejala: ["G27", "G28", "G29", "G30", "G31", "G32", "G33"],
    cf: 0.962,
  },
  {
    nama: "K9 - Printer Tidak Terdeteksi",
    kerusakan: "K9",
    gejala: ["G34", "G35", "G36", "G37", "G38", "G39"],
    cf: 0.943,
  },
  {
    nama: "K9 - Printer Kertas Macet & Bergaris",
    kerusakan: "K9",
    gejala: ["G36", "G38", "G39"],
    cf: 0.881,
  },
];

// ── Main Seeder Function ─────────────────────────────────────
async function runSeeder() {
  let conn;
  try {
    console.log("🔌 Menghubungkan ke database...");
    conn = await mysql.createConnection(DB_CONFIG);
    console.log("✅ Terhubung ke database!\n");

    // Disable foreign key checks sementara
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");

    // ── Truncate semua tabel ──────────────────────────────────
    console.log("🗑️  Menghapus data lama...");
    const tables = [
      "hasil_konsultasi",
      "kasus_cbr",
      "relasi_gejala_kerusakan",
      "gejala",
      "kerusakan",
      "pakar",
    ];
    for (const tabel of tables) {
      await conn.execute(`TRUNCATE TABLE ${tabel}`);
    }
    console.log("✅ Data lama berhasil dihapus\n");

    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");

    // ── Seed Pakar ────────────────────────────────────────────
    console.log("👤 Seeding data pakar...");
    for (const p of PAKAR_DATA) {
      const hash = await bcrypt.hash(p.password, 10);
      await conn.execute(
        "INSERT INTO pakar (username, password, nama) VALUES (?, ?, ?)",
        [p.username, hash, p.nama],
      );
      console.log(`   ✓ Pakar: ${p.username} (password: ${p.password})`);
    }

    // ── Seed Kerusakan ────────────────────────────────────────
    console.log("\n🔧 Seeding data kerusakan...");
    for (const k of KERUSAKAN_DATA) {
      await conn.execute(
        "INSERT INTO kerusakan (kode_kerusakan, nama_kerusakan, keterangan, solusi) VALUES (?, ?, ?, ?)",
        [k.kode_kerusakan, k.nama_kerusakan, k.keterangan, k.solusi],
      );
      console.log(`   ✓ ${k.kode_kerusakan}: ${k.nama_kerusakan}`);
    }

    // ── Seed Gejala ───────────────────────────────────────────
    console.log("\n🩺 Seeding data gejala...");
    for (const g of GEJALA_DATA) {
      await conn.execute(
        "INSERT INTO gejala (kode_gejala, nama_gejala, mb, md) VALUES (?, ?, ?, ?)",
        [g.kode_gejala, g.nama_gejala, g.mb, g.md],
      );
    }
    console.log(`   ✓ ${GEJALA_DATA.length} gejala berhasil dimasukkan`);

    // ── Seed Relasi ───────────────────────────────────────────
    console.log("\n🔗 Seeding data relasi gejala-kerusakan...");
    for (const r of RELASI_DATA) {
      await conn.execute(
        "INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES (?, ?)",
        [r.kode_kerusakan, r.kode_gejala],
      );
    }
    console.log(`   ✓ ${RELASI_DATA.length} relasi berhasil dimasukkan`);

    // ── Seed Kasus CBR ────────────────────────────────────────
    console.log("\n📁 Seeding data kasus CBR...");
    for (const k of KASUS_DATA) {
      const vektor = buatVektor(k.gejala);
      await conn.execute(
        "INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES (?, ?, ?, ?, ?)",
        [k.nama, k.kerusakan, JSON.stringify(vektor), k.cf, "verified"],
      );
      console.log(`   ✓ ${k.nama} (CF: ${(k.cf * 100).toFixed(1)}%)`);
    }

    // ── Verifikasi ────────────────────────────────────────────
    console.log("\n📊 Verifikasi data...");
    const checks = [
      ["pakar", "Total Pakar       "],
      ["kerusakan", "Total Kerusakan   "],
      ["gejala", "Total Gejala      "],
      ["relasi_gejala_kerusakan", "Total Relasi      "],
      ["kasus_cbr", "Total Kasus CBR   "],
    ];

    for (const [tabel, label] of checks) {
      const [[{ total }]] = await conn.execute(
        `SELECT COUNT(*) AS total FROM ${tabel}`,
      );
      console.log(`   ${label}: ${total}`);
    }

    console.log("\n🎉 Seeding selesai! Database siap digunakan.");
    console.log("\n📌 Akun login:");
    for (const p of PAKAR_DATA) {
      console.log(`   Username: ${p.username}  |  Password: ${p.password}`);
    }
  } catch (err) {
    console.error("\n❌ Error saat seeding:", err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

runSeeder();
