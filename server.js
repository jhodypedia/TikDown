import { makeWASocket, useMultiFileAuthState, DisconnectReason } from 'baileys'
import P from 'pino'
import ytdlp from 'yt-dlp-exec'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import qrcode from 'qrcode-terminal'

/**
 * Kompres video dengan ffmpeg
 */
async function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf scale=720:-1", // resize max 720p
        "-crf 28",          // kualitas (angka besar = ukuran lebih kecil)
        "-preset veryfast"  // lebih cepat
      ])
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
  })
}

/**
 * Jalankan WhatsApp bot
 */
async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  // 🔹 Event connection.update untuk QR & reconnect
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('🔹 QR Code (scan pakai WhatsApp):')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('❌ Koneksi putus, reconnect?', shouldReconnect)
      if (shouldReconnect) startSock()
      else console.log('⚠️ Logout, hapus folder auth & scan ulang QR.')
    } else if (connection === 'open') {
      console.log('✅ Bot terhubung ke WhatsApp')
    }
  })

  // 🔥 Pesan masuk
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || !m.key.remoteJid) return

    const jid = m.key.remoteJid

    // ❌ Abaikan pesan dari group
    if (jid.endsWith('@g.us')) return

    // Ambil teks pesan
    const text = m.message.conversation || m.message.extendedTextMessage?.text
    if (!text) return

    // ✅ Deteksi link TikTok
    if (text.includes('tiktok.com')) {
      const fileName = `tiktok_${Date.now()}.mp4`
      const filePath = path.resolve(fileName)
      const compressedPath = path.resolve(`compressed_${fileName}`)

      try {
        await sock.sendMessage(jid, { text: "⏳ Sedang download video TikTok..." })

        // Download via yt-dlp-exec
        await ytdlp(text, { output: filePath })

        const stats = fs.statSync(filePath)
        let finalPath = filePath

        // Jika > 64MB, kompres dulu
        if (stats.size > 64 * 1024 * 1024) {
          await sock.sendMessage(jid, { text: "⚡ Video terlalu besar, sedang dikompres..." })
          await compressVideo(filePath, compressedPath)
          finalPath = compressedPath
        }

        await sock.sendMessage(jid, {
          video: fs.readFileSync(finalPath),
          caption: "✅ Nih videonya!"
        })

      } catch (err) {
        console.error("❌ Error:", err)
        await sock.sendMessage(jid, { text: "❌ Gagal download atau kirim video." })
      } finally {
        // 🔥 Hapus file dari VPS setelah selesai
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath)
      }
    }
  })
}

// Mulai bot
startSock()
