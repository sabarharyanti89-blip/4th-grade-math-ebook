# Faktor dan Kelipatan — Ebook Interaktif Matematika Kelas 4

Ebook interaktif Matematika Kelas 4 Semester 1 tentang **Faktor dan Kelipatan**. Created by Nata.

## Alur belajar siswa

1. **Masuk** dengan nama, kelas, dan nomor absen (data yang sama melanjutkan progres).
2. **Halaman 1 – Video** dari YouTube (https://www.youtube.com/watch?v=OCIeZB6lc10). Poin masuk otomatis setelah ±85% video benar-benar ditonton (melompati video tidak dihitung).
3. **Halaman 2 – Faktor**: materi + "Lab Kue" interaktif (susunan titik/pasangan perkalian).
4. **Halaman 3 – Kelipatan**: materi + "Papan Lompat Katak" interaktif.
5. **Game Monster Momo & Balon Ajaib**: 3 babak memberi makan faktor dan memecahkan balon kelipatan.
6. **Tugas akhir 5 soal** (masing-masing 20 poin). Jawaban dikunci dan tidak dapat diubah.
7. **Rapor Nilaiku**: semua poin kegiatan dijumlahkan menjadi nilai akhir.

Setiap halaman terbuka otomatis setelah halaman sebelumnya selesai.

| Kegiatan | Poin |
| --- | --- |
| Video | 10 |
| Membaca Faktor | 10 |
| Membaca Kelipatan | 10 |
| Game | 10–20 (20 dikurangi jumlah salah, minimal 10) |
| 5 Soal | 5 × 20 = 100 |
| **Total** | **150** → Nilai akhir = total ÷ 150 × 100 |

## Akses Guru

Buka `/guru` (tombol **Akses Guru** di halaman depan). Masukkan PIN Guru untuk melihat rekap seluruh siswa, memfilter per kelas, menghapus data siswa, dan **mengunduh rekap nilai dalam CSV**.

PIN bawaan adalah `1234`. Ganti dengan menambahkan variabel lingkungan `TEACHER_PIN` di pengaturan proyek Netlify.

## Teknologi

- TanStack Start (React 19) + Tailwind CSS 4 + komponen shadcn/ui
- Netlify Database (Postgres) dengan Drizzle ORM untuk menyimpan poin dan jawaban
- YouTube IFrame API untuk pelacakan tontonan video
- Netlify Image CDN untuk ilustrasi

## Menjalankan secara lokal

```bash
pnpm install
netlify dev
```

Migrasi database ada di `netlify/database/migrations/` dan diterapkan otomatis oleh Netlify saat deploy.
