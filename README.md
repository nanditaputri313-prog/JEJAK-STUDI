# JEJAK STUDI

**Setiap langkah punya jejak.**

JEJAK STUDI adalah personal academic planner berbasis web untuk mahasiswa Indonesia. Aplikasi memusatkan pengelolaan tugas, deadline, sesi belajar, focus timer, journal, mood tracking, goals, kalender, weekly review, progress, achievement, resource, dan subscription PLUS dalam satu aplikasi.

## Fitur utama

- Register, login, logout, onboarding, dan profile lokal
- Task manager: tambah, edit, hapus, complete, filter, search, sort
- Deadline dinamis: days left, due today, overdue
- Calendar interaktif dan sinkron dengan deadline task
- Study Track, history, dan streak dari aktivitas selesai
- Focus timer berbasis timestamp dengan pause/reset dan history
- Daily Journal dan mood tracking untuk refleksi pribadi
- Goals dengan progress dan auto-completion
- Weekly Review dari data minggu berjalan
- Progress charts dengan Recharts
- Achievement otomatis
- Resource Vault dengan validasi URL
- Research & Study Planners dengan akses FREE/PLUS
- Notification Center berbasis deadline, streak, dan goal
- Global search
- Quick Capture
- Semester Wrapped dari data pengguna + export share card PNG
- Pricing, checkout lokal, subscription, start date, expiry date
- Export data pengguna ke JSON dan Clear Data dengan confirmation
- Responsive sidebar desktop + bottom navigation mobile

## Teknologi

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts
- localStorage sebagai persistence layer
- Web Crypto API (SHA-256) untuk menyimpan hash password lokal

## Menjalankan project

```bash
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Build production

```bash
npm run build
```

Hasil build akan dibuat pada folder `dist/`.

## Struktur project

```text
src/
├── components/   # UI reusable, modal, task form, search, notifications
├── context/      # state aplikasi dan seluruh operasi data
├── layouts/      # layout aplikasi, sidebar, mobile navigation
├── pages/        # halaman fitur
├── services/     # abstraction localStorage
├── types/        # TypeScript models
├── utils/        # tanggal, statistik, auth hashing, id
├── assets/
├── App.tsx
└── main.tsx
```

## Persistence

Data disimpan per akun pada localStorage menggunakan namespace `jejakstudi:<userId>:<slice>`. Akses penyimpanan dipusatkan di `src/services/storage.ts`, bukan ditulis acak di setiap halaman. Jika data JSON rusak, loader memakai fallback state agar aplikasi tetap dapat dibuka.

Slice utama:

- tasks
- studySessions
- focusSessions
- streak
- journals
- moods
- goals
- calendarEvents
- resources
- achievements
- notifications
- settings
- subscription
- weeklyReviews

## Subscription dan pembayaran

Payment gateway nyata belum terhubung. Checkout memakai simulated successful payment untuk pengembangan/penggunaan lokal. Ketika tombol pembayaran dijalankan, status PLUS, tanggal mulai, dan tanggal berakhir disimpan di localStorage. Struktur ini dapat diganti dengan backend/payment provider pada pengembangan berikutnya.

## Catatan keamanan

Aplikasi tidak mengirim data akademik pengguna ke server eksternal dan tidak membutuhkan API key. Password tidak disimpan sebagai plaintext; browser membuat SHA-256 hash melalui Web Crypto API. Untuk deployment multi-user sungguhan, autentikasi, hashing password, session, otorisasi, payment verification, dan database harus dipindahkan ke backend yang aman.
