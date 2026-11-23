# VMS Frontend Starter

Starter frontend berbasis React, TypeScript, dan Vite. UI menggunakan shadcn/ui di atas Tailwind CSS v4. Pola API hooks serta signal internal tersedia untuk dikembangkan.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

## Struktur utama

```text
src/
├── components/ui/        # Komponen shadcn/ui yang digunakan aplikasi
├── hook/                 # API query, mutation, cache, dan hasil codegen
├── library/@signal-private/ # Signal dan React bindings internal
├── pages/                # Halaman aplikasi
├── routes/               # Routing aplikasi
├── theme/                # Theme provider light/dark
├── utils/                # Helper umum
└── lib/utils.ts          # Helper className (cn)
```

## Pola API

Pertahankan pola `use_query` dan `use_mutation` di `src/hook/`. Setelah backend menyediakan dokumen OpenAPI, atur endpoint pada script `codeGen` di `package.json`, lalu jalankan:

```bash
npm run codeGen
```

Codegen akan mengganti placeholder `src/hook/api-generated.ts` dengan tipe dan client API terbaru.

## Komponen UI

Tambahkan komponen shadcn/ui menggunakan CLI:

```bash
npx shadcn@latest add card input label dialog
```

Komponen diletakkan di `src/components/ui/`, gunakan alias `@/` untuk impor dari `src/`, dan gabungkan class kondisional dengan helper `cn` dari `@/lib/utils`.

## Konfigurasi

- `VITE_APP_ENDPOINT`: URL backend untuk proxy `/api` di Vite.
- Path alias `@/*`, `@Hooks/*`, `@Signal/*`, `@Utils/*`, dan `@Pages/*` tersedia di `tsconfig.json`.
- Theme light/dark memakai CSS variables pada `src/index.css` dan `ThemeProvider`.
# fe-template-shadcn
# vms-fe
