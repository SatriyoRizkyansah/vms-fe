import { ArrowUpRight, Blocks, Braces, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/theme";

const foundations = [
  { icon: Blocks, title: "shadcn/ui", description: "Komponen UI yang bisa disalin dan disesuaikan di dalam project." },
  { icon: Braces, title: "React + TypeScript", description: "Fondasi frontend dengan Vite dan konfigurasi alias yang rapi." },
  { icon: ArrowUpRight, title: "API hooks", description: "Pola use_query dan use_mutation siap disambungkan ke backend." },
];

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide">REACT STARTER</span>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Ganti tema">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>

        <section className="py-24 sm:py-32">
          <p className="mb-4 text-sm font-medium text-primary">Template siap dikembangkan</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Fondasi aplikasi baru, tanpa sisa modul lama.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Struktur API hooks, komponen, alias, dan state signal tersedia sebagai titik awal. Tambahkan fitur produk sesuai kebutuhan.
          </p>
          <div className="mt-8 flex gap-3">
            <Button onClick={() => window.alert("Mulai tambahkan halaman aplikasi di src/pages.")}>Mulai kembangkan</Button>
            <Button variant="outline" onClick={() => window.location.assign("https://ui.shadcn.com/")}>Dokumentasi UI</Button>
          </div>
        </section>

        <section className="grid gap-4 border-t border-border pt-8 sm:grid-cols-3">
          {foundations.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <Icon className="mb-4 size-5 text-primary" />
              <h2 className="font-medium">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
