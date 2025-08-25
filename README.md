
# WhatsApp TikTok Downloader Bot

Bot WhatsApp berbasis **Node.js** menggunakan **Baileys** yang dapat mendeteksi link TikTok secara otomatis, mendownload video, mengompres jika ukurannya terlalu besar, dan mengirim kembali ke user. Bot ini hanya menerima chat **private**, sementara group akan diabaikan.

---

## Fitur

- 🔹 **Deteksi otomatis link TikTok** tanpa command tambahan  
- 🔹 Hanya merespons **private chat**, abaikan group  
- 🔹 **Download video TikTok** menggunakan `yt-dlp-exec`  
- 🔹 **Kompres video** jika ukuran >64MB menggunakan `ffmpeg`  
- 🔹 **Hapus file** di VPS setelah terkirim  
- 🔹 **Auto reconnect** jika koneksi WhatsApp terputus  
- 🔹 **QR code ditampilkan di terminal** untuk login WhatsApp  

---

## Persiapan

Pastikan server/VPS kamu memiliki:

- Node.js v18+ (rekomendasi Node.js v22 LTS)  
- Python3 (`yt-dlp-exec` membutuhkan Python)  
- ffmpeg (untuk kompres video)

---

### Installasi

1. Clone repository:
```bash
git clone https://github.com/jhodypedia/TikDown
cd TikDown
```

2. Install dependencies:
```bash
npm install
```

3. Install Python3, ffmpeg, dan buat symlink python:
```bash
apt update
apt install -y python3 python3-pip ffmpeg
ln -s /usr/bin/python3 /usr/bin/python
```

4. Pastikan `.gitignore` ada, agar `auth/` dan file video sementara tidak ikut ke Git.

---

### Menjalankan Bot

```bash
node server.js
```

- Saat pertama kali dijalankan, QR code akan muncul di terminal  
- Scan QR code dengan WhatsApp di ponsel  
- Kirim link TikTok ke bot → bot akan download, kompres jika perlu, kirim balik, lalu hapus file di VPS

---

### Struktur Proyek

```
botwa/
├─ auth/                  # Folder session WhatsApp (tidak diupload)
├─ server.js              # Kode utama bot
├─ package.json
├─ package-lock.json
├─ .gitignore
└─ README.md
```

---

### Dependensi

- [Baileys](https://baileys.wiki/) – library WhatsApp Web API  
- [yt-dlp-exec](https://www.npmjs.com/package/yt-dlp-exec) – download video TikTok  
- [ffmpeg](https://ffmpeg.org/) – kompres video  
- [pino](https://www.npmjs.com/package/pino) – logging  
- [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) – tampilkan QR code di terminal  

---

### Lisensi

MIT License
