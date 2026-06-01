/**
 * ============================================================
 * SYNONYM DICTIONARY
 * Mapping kata/frasa ke kode gejala
 * ============================================================
 */

const synonyms = {
  // ── G01: Komputer hidup sering restart atau kadang mati sendiri
  G01: [
    'restart', 'mati sendiri', 'mati tiba', 'reboot', 'nyala mati',
    'hidup mati', 'sering mati', 'tiba-tiba mati', 'mati mendadak',
    'restart sendiri', 'sering restart', 'auto restart', 'mati lagi nyala lagi',
    'nyala sebentar mati', 'hidup sebentar mati', 'mati terus',
  ],

  // ── G02: Tidak ada tampilan di monitor ketika dipencet tombol on
  G02: [
    'tidak bereaksi', 'tidak ada tampilan', 'tidak menyala', 'tidak hidup',
    'tombol on tidak', 'tidak ada respon', 'ditekan tidak',
    'mati total', 'blank total', 'gelap total', 'tidak bisa nyala',
    'tidak mau nyala', 'dinyalakan tidak', 'pencet power tidak',
    'tombol power tidak', 'tidak ada reaksi', 'sama sekali tidak nyala',
    'matot', 'mati sama sekali', 'tidak ada tanda kehidupan',
  ],

  // ── G03: Komputer hang ketika memutar video resolusi besar
  G03: [
    'hang video', 'lag video', 'macet video', 'nonton video hang',
    'putar video', 'video besar', 'resolusi tinggi',
    'nonton film hang', 'streaming lag', 'video macet', 'buffering terus',
    'youtube lag', 'video tidak lancar',
  ],

  // ── G04: Tidak berputarnya kipas pada power supply
  G04: [
    'kipas tidak berputar', 'kipas mati', 'kipas psu', 'kipas power supply',
    'fan tidak jalan', 'fan mati',
    'kipas tidak jalan', 'kipas diam', 'fan tidak berputar', 'fan diam',
    'kipas tidak nyala', 'fan tidak nyala',
  ],

  // ── G05: Lampu indikator hidup tapi tidak tampil gambar
  G05: [
    'lampu hidup tidak ada gambar', 'indikator nyala tapi', 'lampu nyala monitor mati',
    'power nyala layar mati',
    'lampu nyala tapi layar mati', 'indikator hidup layar gelap',
    'power hidup tapi tidak ada gambar', 'lampu power nyala monitor blank',
  ],

  // ── G06: Tercium bau hangus dari dalam PC
  G06: [
    'bau hangus', 'bau terbakar', 'bau gosong', 'bau aneh', 'tercium bau',
    'bau dari pc', 'bau dari komputer',
    'bau asap', 'bau seperti terbakar', 'ada bau', 'bau tidak enak',
    'bau plastik terbakar', 'bau karet terbakar', 'keluar asap',
    'kena air', 'terkena air', 'kemasukan air', 'basah', 'kena cairan',
  ],

  // ── G07: PC sering mati tiba-tiba
  G07: [
    'mati tiba-tiba', 'tiba tiba mati', 'mendadak mati', 'langsung mati',
    'sering mati', 'mati sendiri',
    'mati tanpa peringatan', 'shutdown sendiri', 'mati dadakan',
    'mati waktu dipakai', 'mati pas lagi dipakai', 'mati saat digunakan',
    'mati ketika dipakai', 'mati waktu kerja',
  ],

  // ── G08: Suhu PC terasa sangat panas
  G08: [
    'panas', 'overheat', 'suhu tinggi', 'sangat panas', 'kepanasan',
    'terlalu panas', 'panas banget',
    'panas sekali', 'suhu panas', 'terasa panas', 'body panas',
    'casing panas', 'bawah laptop panas', 'bagian bawah panas',
    'kipas bunyi keras', 'kipas berisik', 'fan berisik', 'fan bunyi keras',
    'suara kipas kencang', 'kipas kencang',
  ],

  // ── G09: Komputer saat digunakan sering mati mendadak
  G09: [
    'mati saat dipakai', 'mati waktu digunakan', 'mati ketika dipakai',
    'mati pas digunakan',
    'mati waktu kerja', 'mati pas ngetik', 'mati pas browsing',
    'mati pas main', 'mati pas buka aplikasi',
  ],

  // ── G10: Kabel power terpasang benar namun tetap bermasalah
  G10: [
    'kabel sudah benar', 'kabel terpasang masih', 'kabel oke tapi',
    'sudah dicek kabel',
    'kabel sudah dipasang', 'sudah colok tapi', 'sudah dicolok masih',
    'charger sudah dicolok', 'adaptor sudah dipasang',
  ],

  // ── G11: Setelah dihidupkan semua perangkat tidak terdeteksi
  G11: [
    'tidak terdeteksi semua', 'semua perangkat tidak', 'tidak ada yang terdeteksi',
    'perangkat tidak dikenali',
    'semua tidak terbaca', 'tidak ada perangkat', 'semua hilang',
    'tidak ada hardware', 'semua komponen tidak terdeteksi',
  ],

  // ── G12: Kipas motherboard tidak berjalan
  G12: [
    'kipas motherboard', 'fan motherboard', 'kipas mobo', 'fan mobo tidak jalan',
    'kipas mobo mati', 'fan mobo diam', 'kipas board tidak jalan',
  ],

  // ── G13: Bunyi bip 3 kali selang 3 detik
  G13: [
    'bip 3 kali', 'bunyi 3 kali', 'beep 3', 'bunyi tiga kali', 'bip tiga',
    'bunyi tiga', 'beep tiga kali', 'bip tiga kali',
    'bunyi bip tiga', 'suara bip 3',
  ],

  // ── G14: Bunyi bip panjang ketika dinyalakan
  G14: [
    'bip panjang', 'beep panjang', 'bunyi panjang', 'suara panjang saat nyala',
    'bunyi bip panjang', 'suara beep panjang', 'bip satu panjang',
  ],

  // ── G15: Harddisk tidak terdeteksi saat booting
  G15: [
    'harddisk tidak terdeteksi', 'hdd tidak terbaca', 'hard disk tidak',
    'harddisk hilang', 'hdd tidak terdeteksi',
    'harddisk tidak terbaca', 'disk tidak terdeteksi', 'storage tidak terbaca',
    'ssd tidak terdeteksi', 'ssd tidak terbaca', 'drive tidak terdeteksi',
  ],

  // ── G16: Koneksi kabel harddisk longgar
  G16: [
    'kabel harddisk longgar', 'kabel hdd tidak benar', 'kabel sata longgar',
    'koneksi hdd',
    'kabel disk longgar', 'kabel storage longgar', 'kabel sata tidak terpasang',
  ],

  // ── G17: Muncul pesan "Invalid Partition Table"
  G17: [
    'invalid partition', 'partition table', 'booting gagal', 'gagal booting',
    'tidak bisa booting',
    'tidak bisa masuk windows', 'gagal masuk windows', 'windows tidak bisa masuk',
    'tidak bisa boot', 'boot gagal', 'error saat booting',
  ],

  // ── G18: Muncul pesan "Missing Operating System"
  G18: [
    'missing operating system', 'error loading os', 'os tidak ditemukan',
    'sistem operasi hilang', 'operating system tidak',
    'windows hilang', 'tidak ada os', 'sistem operasi tidak ditemukan',
    'windows tidak ada', 'os hilang',
  ],

  // ── G19: CD/DVD ROM tidak terdeteksi saat booting
  G19: [
    'dvd tidak terdeteksi', 'cd rom tidak', 'dvd rom tidak', 'optical drive tidak',
    'dvd drive tidak terbaca', 'cd drive hilang', 'optical tidak terdeteksi',
  ],

  // ── G20: Driver CD/DVD rusak atau tidak terbaca
  G20: [
    'driver dvd rusak', 'cd tidak terbaca', 'dvd tidak terbaca', 'driver cd rusak',
    'dvd tidak bisa baca', 'cd tidak bisa dibaca', 'disk tidak terbaca',
  ],

  // ── G21: Kabel CD/DVD tidak terpasang benar
  G21: [
    'kabel dvd tidak', 'kabel cd tidak', 'kabel optical drive',
    'kabel dvd longgar', 'kabel cd longgar',
  ],

  // ── G22: Setting Jumper CD/DVD salah
  G22: [
    'jumper salah', 'setting jumper', 'jumper cd', 'jumper dvd',
    'jumper tidak benar', 'konfigurasi jumper',
  ],

  // ── G23: Layar monitor gelap dan hitam saat dinyalakan
  G23: [
    'layar gelap', 'layar hitam', 'monitor gelap', 'monitor hitam',
    'blank hitam', 'layar blank', 'monitor blank',
    'layar tidak ada gambar', 'monitor tidak ada gambar', 'layar kosong',
    'monitor kosong', 'tidak ada gambar di layar', 'layar mati',
    'monitor tidak nyala', 'layar tidak nyala',
  ],

  // ── G24: Komputer hang saat main game 3D
  G24: [
    'hang game', 'lag game', 'macet game', 'game hang', 'game 3d hang',
    'main game hang', 'gaming hang',
    'game crash', 'game keluar sendiri', 'fps drop', 'game tidak lancar',
    'game lemot', 'game macet', 'game freeze',
  ],

  // ── G25: Ada titik-titik atau artefak visual di layar
  G25: [
    'titik titik', 'artefak', 'artifact', 'bintik layar', 'noise layar',
    'gangguan visual', 'layar berbintik',
    'layar ada titik', 'ada bintik', 'layar kotor', 'tampilan aneh',
    'gambar aneh di layar', 'layar glitch', 'glitch layar',
  ],

  // ── G26: Pesan kesalahan grafis di layar
  G26: [
    'error grafis', 'pesan grafis', 'kesalahan grafis', 'error display',
    'error layar',
    'tampilan error', 'display error', 'grafis error', 'vga error',
  ],

  // ── G27: Monitor blank (layar gelap total)
  G27: [
    'monitor blank', 'layar blank', 'gelap total', 'tidak ada tampilan',
    'layar mati', 'monitor mati',
    'layar tidak menyala', 'monitor tidak menyala', 'layar hitam total',
    'monitor hitam total', 'tidak ada gambar sama sekali',
  ],

  // ── G28: Lampu indikator monitor menyala tapi blank
  G28: [
    'lampu monitor nyala tapi blank', 'indikator monitor nyala blank',
    'monitor nyala tapi gelap',
    'lampu monitor hidup tapi layar gelap', 'power monitor nyala tapi blank',
    'monitor ada lampu tapi tidak ada gambar',
  ],

  // ── G29: CPU bekerja tapi monitor blank
  G29: [
    'cpu nyala monitor mati', 'komputer nyala layar mati',
    'kipas jalan layar blank', 'pc hidup monitor blank',
    'cpu hidup tapi layar mati', 'komputer hidup layar tidak ada gambar',
    'pc nyala tapi monitor mati', 'lampu power nyala layar blank',
  ],

  // ── G30: Blue screen (BSOD)
  G30: [
    'blue screen', 'bsod', 'layar biru', 'bluescreen', 'blue screen of death',
    'layar biru tiba-tiba', 'muncul layar biru', 'tiba-tiba biru',
    'error biru', 'windows blue screen',
  ],

  // ── G31: Suara bip terus menerus saat dinyalakan
  G31: [
    'bip terus', 'beep terus', 'bunyi terus', 'suara bip terus', 'beep berulang',
    'bunyi bip terus menerus', 'beep tidak berhenti', 'bunyi tidak berhenti',
    'suara beep terus', 'bip tidak berhenti',
  ],

  // ── G32: RAM terpasang benar tapi tetap bermasalah
  G32: [
    'ram sudah benar', 'memori sudah terpasang', 'ram oke tapi',
    'ram terpasang masih',
    'ram sudah dipasang masih', 'memori sudah benar tapi', 'ram sudah dicek',
  ],

  // ── G33: Blue screen dengan pesan "Data_Bus_Error"
  G33: [
    'data bus error', 'data_bus_error', 'error data bus',
    'bsod data bus', 'blue screen data bus',
  ],

  // ── G34: Printer tidak terdeteksi
  G34: [
    'printer tidak terdeteksi', 'printer tidak dikenali', 'printer tidak muncul',
    'printer tidak terbaca',
    'printer tidak ada', 'printer hilang', 'printer tidak connect',
    'printer offline', 'printer tidak konek', 'printer tidak terhubung',
    'printer tidak bisa dipakai',
  ],

  // ── G35: Printer peringatan tinta habis padahal belum
  G35: [
    'tinta habis padahal', 'peringatan tinta', 'ink habis tapi',
    'tinta masih ada tapi',
    'notif tinta habis', 'warning tinta', 'tinta penuh tapi error',
    'tinta masih tapi bilang habis',
  ],

  // ── G36: Hasil cetakan tidak bagus atau buram
  G36: [
    'cetakan buram', 'hasil cetak buram', 'print buram', 'cetakan tidak bagus',
    'hasil print jelek',
    'cetakan pudar', 'print pudar', 'hasil cetak jelek', 'cetakan tidak jelas',
    'print tidak jelas', 'hasil cetak tidak bagus', 'cetakan rusak',
  ],

  // ── G37: Printer bekerja tapi tidak ada hasil cetakan
  G37: [
    'printer jalan tidak ada hasil', 'cetak tidak keluar', 'print tidak ada hasil',
    'printer bunyi tapi tidak cetak',
    'printer bunyi tapi kertas kosong', 'cetak tapi tidak ada tulisan',
    'print tapi kosong', 'printer jalan tapi tidak ada cetakan',
  ],

  // ── G38: Hasil cetakan bergaris-garis
  G38: [
    'cetakan bergaris', 'print bergaris', 'hasil cetak bergaris',
    'garis garis di cetakan',
    'ada garis di print', 'cetakan ada garis', 'print ada garis',
    'hasil cetak ada garis', 'cetakan tidak rata',
  ],

  // ── G39: Printer gagal menarik kertas
  G39: [
    'kertas tidak masuk', 'printer tidak tarik kertas', 'gagal tarik kertas',
    'kertas nyangkut', 'paper jam',
    'kertas macet', 'kertas tidak bisa masuk', 'kertas tidak ditarik',
    'printer tidak bisa tarik kertas', 'kertas tersangkut',
    'paper jam printer', 'kertas jam',
  ],
};

module.exports = synonyms;
