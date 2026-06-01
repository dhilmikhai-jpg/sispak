-- ============================================================
-- DATABASE: Sistem Pakar Diagnosa Kerusakan Komputer
-- Metode: Case-Based Reasoning (CBR) + Certainty Factor (CF)
-- Sumber data: Skripsi Muhammad Rifai, UMM 2018
-- ============================================================

CREATE DATABASE IF NOT EXISTS diagnosa_komputer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE diagnosa_komputer;

-- ============================================================
-- 1. TABEL PAKAR (Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS pakar (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  username   VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  nama       VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. TABEL KERUSAKAN
-- ============================================================
CREATE TABLE IF NOT EXISTS kerusakan (
  kode_kerusakan VARCHAR(6)  PRIMARY KEY,
  nama_kerusakan VARCHAR(150) NOT NULL,
  keterangan     TEXT,
  solusi         TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. TABEL GEJALA
-- ============================================================
CREATE TABLE IF NOT EXISTS gejala (
  kode_gejala VARCHAR(6)   PRIMARY KEY,
  nama_gejala VARCHAR(350) NOT NULL,
  mb          DOUBLE       NOT NULL COMMENT 'Measure of Belief (0-1)',
  md          DOUBLE       NOT NULL COMMENT 'Measure of Disbelief (0-1)',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. TABEL RELASI GEJALA ↔ KERUSAKAN (Rule Base)
-- ============================================================
CREATE TABLE IF NOT EXISTS relasi_gejala_kerusakan (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  kode_kerusakan VARCHAR(6) NOT NULL,
  kode_gejala    VARCHAR(6) NOT NULL,
  UNIQUE KEY unique_relasi (kode_kerusakan, kode_gejala),
  FOREIGN KEY (kode_kerusakan) REFERENCES kerusakan(kode_kerusakan) ON DELETE CASCADE,
  FOREIGN KEY (kode_gejala)    REFERENCES gejala(kode_gejala)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. TABEL KASUS CBR (Basis Kasus)
-- ============================================================
CREATE TABLE IF NOT EXISTS kasus_cbr (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  nama_kasus     VARCHAR(200),
  kode_kerusakan VARCHAR(6)   NOT NULL,
  gejala_vektor  JSON         NOT NULL COMMENT 'Vektor biner semua gejala {"G01":1,"G02":0,...}',
  cf_nilai       DOUBLE       DEFAULT 0,
  status         ENUM('verified','unverified') DEFAULT 'unverified',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kode_kerusakan) REFERENCES kerusakan(kode_kerusakan) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. TABEL HASIL KONSULTASI
-- ============================================================
CREATE TABLE IF NOT EXISTS hasil_konsultasi (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  nama_user            VARCHAR(100) DEFAULT 'Anonim',
  gejala_dipilih       JSON         NOT NULL COMMENT 'Array kode gejala ["G01","G04",...]',
  kode_kerusakan_hasil VARCHAR(6),
  cf_hasil             DOUBLE,
  similarity_score     DOUBLE,
  kasus_referensi_id   INT,
  metode_diagnosis     VARCHAR(50)  DEFAULT 'CBR_CF',
  tanggal              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kode_kerusakan_hasil) REFERENCES kerusakan(kode_kerusakan) ON DELETE SET NULL,
  FOREIGN KEY (kasus_referensi_id)   REFERENCES kasus_cbr(id)            ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- ============================================================
-- SEED DATA
-- ============================================================
-- ============================================================

-- ============================================================
-- SEED: PAKAR (password = "admin123")
-- Hash bcrypt dari "admin123"
-- ============================================================
INSERT INTO pakar (username, password, nama) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator'),
('pakar1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pakar Reparasi Komputer');


-- ============================================================
-- SEED: KERUSAKAN (9 kerusakan hardware)
-- Sumber: Tabel 3.2 skripsi
-- ============================================================
INSERT INTO kerusakan (kode_kerusakan, nama_kerusakan, keterangan, solusi) VALUES
('K1', 'Kerusakan Power Supply',
 'Power supply merupakan perangkat keras yang mengatur bagian kelistrikan dalam sebuah PC. Di dalamnya terdapat komponen yang sering rusak: kapasitor, resistor, sekering, transistor regulator, sakelar, dioda, jalur tembaga di PCB putus, transformator.',
 '1. Ganti PSU dengan yang baru.\n2. Periksa kabel pada power supply, pastikan sudah terpasang dengan benar.\n3. Pasang stabilizer atau cek tegangan listrik.\n4. Cek kipas power supply apakah berputar dengan baik, jika tidak maka ganti power supply.\n5. Cek tegangan pada power supply apakah sudah sesuai dengan kebutuhan motherboard.\n6. Servis atau Replace PSU.'),

('K2', 'Kerusakan Processor',
 'Prosesor merupakan komponen komputer yang paling rumit dan paling kecil. Sebuah barang dengan ukuran kecil sekitar 3 cm mampu memuat jutaan transistor. Di dalamnya terdapat komponen yang sering rusak: unit control, register, CPU Interconnection.',
 '1. Pastikan kipas pada processor berfungsi dengan baik.\n2. Buka kipas pada processor, ambil processor dan bersihkan soket dari kotoran.\n3. Pasang kembali dan beri pasta di atas processor sebelum kipas dipasang.\n4. Jika kondisinya tidak berubah, kemungkinan besar processor rusak dan perlu diganti.'),

('K3', 'Kerusakan Motherboard',
 'Motherboard merupakan salah satu perangkat keras komputer yang sangat penting perannya dalam menyusun sebuah sistem komputer. Komponen yang sering rusak: chipset, CPU slots, BIOS chip, CMOS, Memory slots, expansion slots, Storage Drive Connector.',
 '1. Ganti motherboard dengan yang baru.\n2. Cek kabel soket kipas pada motherboard, cabut lalu masukkan kembali dan nyalakan PC.\n3. Cek memori mungkin tidak pas pada motherboard atau tidak terpasang, lalu pasang dengan baik.\n4. Matikan PC lalu diamkan beberapa menit agar tidak merambah pada kerusakan yang lain.'),

('K4', 'Kerusakan Harddisk',
 'Harddisk merupakan media penyimpanan utama yang masih sangat populer digunakan. Komponen yang sering rusak: spindle, kabel SATA, head, logic board, actual axis, ribbon cable, ide conector, sata conector, setting jumper, power conector.',
 '1. Cek pada setup BIOS apakah masih dapat mendeteksi harddisk (tekan DEL saat booting).\n2. Cek sambungan kabel harddisk di dalam casing, pastikan tidak ada yang longgar.\n3. Jika muncul "Invalid Partition Table", lakukan partisi ulang harddisk.\n4. Jika muncul "Missing Operating System", format harddisk dan install ulang sistem operasi.'),

('K5', 'Kerusakan CD/DVD ROM',
 'CD/DVD ROM merupakan salah satu perangkat peripheral penting pada sebuah perangkat komputer yang berfungsi sebagai penggerak atau pemutar pembaca keping-cakram CD/DVD. Kerusakan terjadi pada optik dan PSU yang kurang memberi daya kepada motor CD/DVD ROM.',
 '1. Cek pada setup BIOS apakah CD/DVD ROM masih terdeteksi.\n2. Hapus driver lama untuk CD/DVD Drive dan ganti dengan driver yang baru via Device Manager.\n3. Bongkar casing dan cek kabel-kabel yang terpasang pada CD/DVD Drive (kabel power, data, dan audio).\n4. Perhatikan setting jumper yang harus dipasang, lihat pada buku manual.'),

('K6', 'Kerusakan VGA (Monitor Blank)',
 'Video Graphic Adapter (VGA) merupakan salah satu komponen penting dalam perangkat komputer. Tanpa VGA, informasi yang diproses tidak akan ditampilkan secara visual. Kerusakan: artifact video memory, graphics processing unit (GPU) bermasalah, DVI corruption.',
 '1. Cek kabel VGA dan pastikan sudah masuk ke port VGA yang ada di casing komputer.\n2. Cek indikator pada monitor, apakah powernya berjalan normal atau tidak.\n3. Cabut VGA card dari slotnya (PCI/AGP) dari motherboard, bersihkan, dan pasang kembali atau ganti VGA card dengan yang baru.\n4. Coba booting ulang dan gunakan Windows Troubleshooter untuk Games and Multimedia.'),

('K7', 'Kerusakan RAM',
 'RAM (Random Access Memory) merupakan perangkat keras yang berfungsi untuk menyimpan memori sementara pada saat komputer diaktifkan. Komponen yang perlu diperhatikan: type, capacity, FSB (Front Side Bus), Bandwidth, jumlah IC.',
 '1. Cek terlebih dahulu pemasangan memory apakah sudah benar atau belum.\n2. Lakukan pembersihan kaki-kaki memory menggunakan penghapus.\n3. Bersihkan juga slot memory dan pasang kembali memory, kemudian hidupkan komputer.\n4. Jika masih bermasalah, kemungkinan RAM rusak dan perlu diganti.'),

('K8', 'Kerusakan Slot Memory',
 'Slot memori digunakan untuk memasang memori utama komputer. Apabila kondisi memory sudah dipastikan dapat bekerja dengan baik namun masih bermasalah, kemungkinan slot memory pada motherboard rusak, kotor, atau berkerak karena usia pemakaian.',
 '1. Pastikan kondisi slot memory bersih, tidak kotor atau berkerak.\n2. Lakukan pembersihan slot memory dan pasang kembali memory, kemudian hidupkan komputer.\n3. Coba pindahkan RAM ke slot memory yang lain pada motherboard.\n4. Jika semua slot bermasalah, kemungkinan motherboard perlu diganti.'),

('K9', 'Kerusakan Printer',
 'Printer merupakan perangkat hardware yang terhubung ke komputer untuk mencetak hasil kerja digital. Komponen yang sering rusak: mainboard, head dan cartridge, encoder, sensor paper, rol penarik kertas, power supply, kabel fleksibel, timing disk.',
 '1. Cek kabel USB printer apakah sudah terpasang dengan baik.\n2. Lakukan reset pada cartridge tinta untuk memuat ulang pengaturan awal printer.\n3. Bersihkan atau ganti cartridge jika hasil cetakan tidak bagus.\n4. Bersihkan rol penarik kertas dan pastikan posisi kertas terpasang dengan baik.\n5. Jika sensor kertas rusak, disarankan mengganti sensor printer dengan yang baru.');


-- ============================================================
-- SEED: GEJALA (39 gejala)
-- Sumber: Tabel 3.3 skripsi (nilai MB dan MD)
-- ============================================================
INSERT INTO gejala (kode_gejala, nama_gejala, mb, md) VALUES
-- K1: Power Supply (G01-G12)
('G01', 'Komputer hidup sering restart atau kadang mati sendiri.',                                                                               0.80, 0.02),
('G02', 'Setelah dihidupkan PC tidak bereaksi apa-apa, tidak ada tampilan di monitor ketika dipencet tombol on.',                               0.70, 0.03),
('G03', 'Komputer hang ketika memutar video dengan resolusi besar.',                                                                             0.60, 0.01),
('G04', 'Tidak berputarnya kipas pada power supply.',                                                                                           0.85, 0.04),
('G05', 'Lampu indikator di PC hidup tapi tidak tampil gambar di layar monitor.',                                                               0.60, 0.03),
('G06', 'Tercium bau hangus dari dalam PC.',                                                                                                    0.70, 0.01),
('G07', 'PC sering mati tiba-tiba.',                                                                                                            0.80, 0.10),
('G08', 'Suhu PC terasa sangat panas.',                                                                                                         0.85, 0.06),
('G09', 'Komputer saat digunakan sering mati mendadak.',                                                                                        0.80, 0.20),
('G10', 'Kabel power telah terpasang dengan benar namun tetap bermasalah.',                                                                     0.70, 0.15),
('G11', 'Setelah dihidupkan semua perangkat tidak terdeteksi sama sekali.',                                                                     0.80, 0.01),
('G12', 'Kipas motherboard tidak berjalan.',                                                                                                    0.55, 0.05),

-- K3: Motherboard tambahan (G13-G14)
('G13', 'Bunyi bip 3 kali selang 3 detik dan bunyi lagi saat komputer dinyalakan.',                                                             0.70, 0.02),
('G14', 'Bunyi bip panjang ketika komputer dinyalakan.',                                                                                        0.85, 0.04),

-- K4: Harddisk (G15-G19)
('G15', 'Harddisk tidak terdeteksi pada saat proses booting.',                                                                                  0.80, 0.07),
('G16', 'Koneksi kabel harddisk tidak benar atau longgar.',                                                                                     0.60, 0.01),
('G17', 'Pada saat proses booting muncul pesan kesalahan "Invalid Partition Table", booting gagal dan sistem tidak bisa diaktifkan.',            0.77, 0.15),
('G18', 'Pada saat booting muncul pesan kesalahan "Error Loading Operating System" atau "Missing Operating System".',                           0.75, 0.20),
('G19', 'CD/DVD ROM tidak terdeteksi pada saat proses booting.',                                                                                0.70, 0.03),

-- K5: CD/DVD ROM (G20-G22)
('G20', 'Driver CD/DVD rusak atau tidak terbaca.',                                                                                              0.80, 0.20),
('G21', 'Kabel-kabel yang terhubung ke CD/DVD Drive tidak terpasang dengan benar.',                                                             0.66, 0.03),
('G22', 'Setting Jumper CD/DVD Drive salah.',                                                                                                   0.80, 0.01),

-- K6: VGA (G23-G26)
('G23', 'Pada saat menyalakan monitor, layar monitor gelap dan hitam.',                                                                         0.80, 0.10),
('G24', 'Komputer menjadi macet atau hang ketika digunakan untuk bermain game 3D.',                                                              0.86, 0.02),
('G25', 'Ada titik-titik kecil atau artefak visual di layar monitor.',                                                                          0.65, 0.06),
('G26', 'Terdapat pesan kesalahan grafis pada layar monitor.',                                                                                  0.72, 0.12),

-- K7: RAM (G27-G32)
('G27', 'Monitor komputer blank (layar gelap total).',                                                                                          0.81, 0.08),
('G28', 'Lampu indikator pada monitor menyala tapi monitor tetap blank.',                                                                       0.76, 0.07),
('G29', 'CPU bekerja (lampu power menyala, kipas berputar) tapi monitor blank.',                                                                0.60, 0.15),
('G30', 'Kadang layar monitor tampak blue screen (BSOD).',                                                                                      0.85, 0.10),
('G31', 'Pada saat komputer dinyalakan, terdengar suara bip terus menerus.',                                                                    0.77, 0.03),
('G32', 'RAM sudah terpasang dengan benar namun tetap bermasalah.',                                                                             0.60, 0.02),

-- K8: Slot Memory (G33)
('G33', 'Pada saat blue screen terdapat pesan "Data_Bus_Error".',                                                                               0.80, 0.05),

-- K9: Printer (G34-G39)
('G34', 'Printer tidak terdeteksi di sistem komputer.',                                                                                         0.60, 0.04),
('G35', 'Printer memberikan peringatan tinta habis padahal tinta belum habis.',                                                                 0.75, 0.03),
('G36', 'Hasil cetakan printer tidak bagus atau buram.',                                                                                        0.70, 0.02),
('G37', 'Printer bekerja tetapi tidak ada hasil cetakan di kertas.',                                                                            0.60, 0.20),
('G38', 'Hasil cetakan printer tidak sempurna atau bergaris-garis.',                                                                            0.80, 0.09),
('G39', 'Printer gagal menarik kertas.',                                                                                                        0.60, 0.01);


-- ============================================================
-- SEED: RELASI GEJALA ↔ KERUSAKAN
-- Sumber: Tabel 3.1 (Kaidah Produksi) dan Tabel 3.5 (Matriks)
-- ============================================================

-- K1: Power Supply → G01,G02,G03,G04,G05,G06,G07,G08,G09,G10,G12
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K1','G01'),('K1','G02'),('K1','G03'),('K1','G04'),('K1','G05'),
('K1','G06'),('K1','G07'),('K1','G08'),('K1','G09'),('K1','G10'),('K1','G12');

-- K2: Processor → G09,G10,G27
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K2','G09'),('K2','G10'),('K2','G27');

-- K3: Motherboard → G08,G11,G12,G13,G14
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K3','G08'),('K3','G11'),('K3','G12'),('K3','G13'),('K3','G14');

-- K4: Harddisk → G15,G16,G17,G18,G19,G22
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K4','G15'),('K4','G16'),('K4','G17'),('K4','G18'),('K4','G19'),('K4','G22');

-- K5: CD/DVD ROM → G19,G20,G21,G22
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K5','G19'),('K5','G20'),('K5','G21'),('K5','G22');

-- K6: VGA → G14,G23,G24,G25,G26
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K6','G14'),('K6','G23'),('K6','G24'),('K6','G25'),('K6','G26');

-- K7: RAM → G08,G13,G14,G27,G28,G29,G30,G31,G32
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K7','G08'),('K7','G13'),('K7','G14'),('K7','G27'),('K7','G28'),
('K7','G29'),('K7','G30'),('K7','G31'),('K7','G32');

-- K8: Slot Memory → G27,G28,G29,G30,G31,G32,G33
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K8','G27'),('K8','G28'),('K8','G29'),('K8','G30'),('K8','G31'),
('K8','G32'),('K8','G33');

-- K9: Printer → G34,G35,G36,G37,G38,G39
INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES
('K9','G34'),('K9','G35'),('K9','G36'),('K9','G37'),('K9','G38'),('K9','G39');


-- ============================================================
-- SEED: KASUS CBR AWAL (9 kasus verified, 1 per kerusakan)
-- Vektor biner: 1 = gejala hadir, 0 = tidak hadir
-- Nilai CF dihitung dari skripsi (contoh K1 = 0.8999)
-- ============================================================

-- Kasus K1: Power Supply
-- Gejala aktif: G01,G02,G03,G04,G07,G08,G09,G10
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Power Supply (Restart & Mati Sendiri)',
 'K1',
 JSON_OBJECT(
   'G01',1,'G02',1,'G03',1,'G04',1,'G05',0,'G06',0,'G07',1,'G08',1,
   'G09',1,'G10',1,'G11',0,'G12',0,'G13',0,'G14',0,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.8999, 'verified');

-- Kasus K1 variasi 2: PSU mati total
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Power Supply (Mati Total & Bau Hangus)',
 'K1',
 JSON_OBJECT(
   'G01',0,'G02',1,'G03',0,'G04',1,'G05',1,'G06',1,'G07',1,'G08',1,
   'G09',0,'G10',1,'G11',0,'G12',1,'G13',0,'G14',0,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.8750, 'verified');

-- Kasus K2: Processor
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Processor (Mati Mendadak & Monitor Blank)',
 'K2',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',1,'G10',1,'G11',0,'G12',0,'G13',0,'G14',0,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',1,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.7920, 'verified');

-- Kasus K3: Motherboard
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Motherboard (Bip 3x & Perangkat Tidak Terdeteksi)',
 'K3',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',1,
   'G09',0,'G10',0,'G11',1,'G12',1,'G13',1,'G14',1,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.9140, 'verified');

-- Kasus K4: Harddisk
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Harddisk (Tidak Terdeteksi & Invalid Partition)',
 'K4',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',0,'G14',0,'G15',1,'G16',1,
   'G17',1,'G18',1,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.9380, 'verified');

-- Kasus K4 variasi 2: Harddisk Missing OS
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Harddisk (Missing Operating System)',
 'K4',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',0,'G14',0,'G15',1,'G16',0,
   'G17',0,'G18',1,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.8600, 'verified');

-- Kasus K5: CD/DVD ROM
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - CD/DVD ROM (Tidak Terdeteksi & Driver Rusak)',
 'K5',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',0,'G14',0,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',1,'G20',1,'G21',1,'G22',1,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.9560, 'verified');

-- Kasus K6: VGA
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - VGA (Monitor Gelap & Hang Saat Gaming)',
 'K6',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',0,'G14',1,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',1,'G24',1,
   'G25',1,'G26',1,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.9720, 'verified');

-- Kasus K7: RAM
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - RAM (BSOD & Monitor Blank)',
 'K7',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',1,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',1,'G14',1,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',1,'G28',1,'G29',1,'G30',1,'G31',1,'G32',1,
   'G33',0,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.9840, 'verified');

-- Kasus K8: Slot Memory
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Slot Memory (Data Bus Error)',
 'K8',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',0,'G14',0,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',1,'G28',1,'G29',1,'G30',1,'G31',1,'G32',1,
   'G33',1,'G34',0,'G35',0,'G36',0,'G37',0,'G38',0,'G39',0
 ),
 0.9620, 'verified');

-- Kasus K9: Printer
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Printer (Tidak Terdeteksi & Hasil Buruk)',
 'K9',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',0,'G14',0,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',1,'G35',1,'G36',1,'G37',1,'G38',1,'G39',1
 ),
 0.9430, 'verified');

-- Kasus K9 variasi 2: Printer kertas macet
INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status) VALUES
('Kasus Referensi - Printer (Kertas Tidak Masuk & Bergaris)',
 'K9',
 JSON_OBJECT(
   'G01',0,'G02',0,'G03',0,'G04',0,'G05',0,'G06',0,'G07',0,'G08',0,
   'G09',0,'G10',0,'G11',0,'G12',0,'G13',0,'G14',0,'G15',0,'G16',0,
   'G17',0,'G18',0,'G19',0,'G20',0,'G21',0,'G22',0,'G23',0,'G24',0,
   'G25',0,'G26',0,'G27',0,'G28',0,'G29',0,'G30',0,'G31',0,'G32',0,
   'G33',0,'G34',0,'G35',0,'G36',1,'G37',0,'G38',1,'G39',1
 ),
 0.8810, 'verified');


-- ============================================================
-- SEED: CONTOH HASIL KONSULTASI
-- Untuk demo tampilan laporan di admin
-- ============================================================
INSERT INTO hasil_konsultasi
  (nama_user, gejala_dipilih, kode_kerusakan_hasil, cf_hasil, similarity_score, kasus_referensi_id, metode_diagnosis)
VALUES
('Budi Santoso',
 JSON_ARRAY('G01','G02','G03','G04'),
 'K1', 0.8999, 0.8750, 1, 'CBR_CF_agree'),

('Siti Rahayu',
 JSON_ARRAY('G15','G16','G17','G18'),
 'K4', 0.9380, 0.9100, 5, 'CBR_dominant'),

('Ahmad Fauzi',
 JSON_ARRAY('G27','G28','G29','G30','G31','G32','G33'),
 'K8', 0.9620, 0.9500, 10, 'CBR_dominant'),

('Dewi Lestari',
 JSON_ARRAY('G19','G20','G21','G22'),
 'K5', 0.9560, 0.9200, 7, 'CBR_CF_agree'),

('Rizky Pratama',
 JSON_ARRAY('G34','G36','G38','G39'),
 'K9', 0.8810, 0.8600, 12, 'CBR_CF_agree');


-- ============================================================
-- INDEX untuk performa query
-- ============================================================
CREATE INDEX idx_relasi_kerusakan ON relasi_gejala_kerusakan(kode_kerusakan);
CREATE INDEX idx_relasi_gejala    ON relasi_gejala_kerusakan(kode_gejala);
CREATE INDEX idx_kasus_status     ON kasus_cbr(status);
CREATE INDEX idx_kasus_kerusakan  ON kasus_cbr(kode_kerusakan);
CREATE INDEX idx_hasil_tanggal    ON hasil_konsultasi(tanggal);
CREATE INDEX idx_hasil_kerusakan  ON hasil_konsultasi(kode_kerusakan_hasil);


-- ============================================================
-- VERIFIKASI DATA
-- ============================================================
SELECT '=== VERIFIKASI DATABASE ===' AS info;
SELECT CONCAT('Total Kerusakan : ', COUNT(*)) AS ringkasan FROM kerusakan
UNION ALL
SELECT CONCAT('Total Gejala    : ', COUNT(*)) FROM gejala
UNION ALL
SELECT CONCAT('Total Relasi    : ', COUNT(*)) FROM relasi_gejala_kerusakan
UNION ALL
SELECT CONCAT('Total Kasus CBR : ', COUNT(*)) FROM kasus_cbr
UNION ALL
SELECT CONCAT('Total Konsultasi: ', COUNT(*)) FROM hasil_konsultasi
UNION ALL
SELECT CONCAT('Total Pakar     : ', COUNT(*)) FROM pakar;
