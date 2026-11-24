import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Fingerprint, KeyRound, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, TextInput, VmsMark } from "@/components/vms/primitives";
import use_mutation from "@/hook/api-use-mutation";
import { auth_signal, set_login_response } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

type LoginResponse = {
  access_token: string;
  expires_in?: number;
  user: { id: string; nip_username: string; full_name: string; email: string; role: "PIC" | "ADMIN" | "AUDITOR" };
};

export default function LoginPage() {
  const auth = useSignalValue(auth_signal);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginMutation = use_mutation({
    api_tag: "authentication",
    api_method: "authControllerLogin",
    options: {
      should_disable_loading: true,
      should_disable_success_message: true,
      should_disable_error_message: true,
      will_exec_after_error: (error) => setErrorMessage(error?.error?.message ?? error?.message ?? "Username atau kata sandi tidak cocok."),
    },
  });

  if (auth.selectedToken) return <Navigate to="/app" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const response = await loginMutation([{ username: username.trim(), password }]);
    setIsSubmitting(false);
    const payload = (response as { data?: LoginResponse } | undefined)?.data;
    if (!payload?.access_token || !payload.user) {
      setErrorMessage((current) => current || "Login belum berhasil. Periksa koneksi atau kredensial akun.");
      return;
    }
    set_login_response(payload.access_token, {
      id: payload.user.id,
      name: payload.user.full_name,
      full_name: payload.user.full_name,
      nip_username: payload.user.nip_username,
      email: payload.user.email,
      role: payload.user.role,
    }, payload.expires_in);
    const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    navigate(destination?.startsWith("/app") ? destination : "/app", { replace: true });
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-[#102d3a] px-12 py-10 text-white lg:flex lg:flex-col xl:px-20">
        <div className="absolute -right-36 -top-28 size-[470px] rounded-full border border-white/10" />
        <div className="absolute -right-16 top-16 size-[300px] rounded-full border border-white/10" />
        <div className="absolute bottom-[-230px] left-[-160px] size-[500px] rounded-full bg-teal-600/20 blur-3xl" />
        <Link to="/" className="relative z-10 w-fit"><VmsMark light /></Link>

        <div className="relative z-10 my-auto max-w-xl pb-12">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200"><span className="size-1.5 rounded-full bg-teal-300" />Akses yang tertata</p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.14] tracking-tight xl:text-[52px]">Setiap kunjungan tercatat, setiap akses terjaga.</h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-slate-300">Kelola permohonan, persetujuan PIC, dan akses sementara Ruang Telematika dalam satu portal operasional.</p>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4"><ShieldCheck className="size-5 text-teal-200" /><p className="mt-5 text-xs font-medium text-white">Persetujuan PIC</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4"><KeyRound className="size-5 text-teal-200" /><p className="mt-5 text-xs font-medium text-white">PIN sementara</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4"><Fingerprint className="size-5 text-teal-200" /><p className="mt-5 text-xs font-medium text-white">Audit akses</p></div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400"><span>Visitor Management System</span><span>LEMIGAS · Telematika</span></div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="lg:hidden"><VmsMark /></Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-800"><ArrowLeft className="size-4" />Halaman pengunjung</Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <div className="mb-8 grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-800"><LockKeyhole className="size-5" /></div>
          <p className="text-sm font-semibold text-teal-800">Portal staf</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Masuk ke VMS</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Gunakan akun internal untuk mengelola kunjungan Ruang Telematika.</p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <FormField label="Username" htmlFor="username" required>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <TextInput id="username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Contoh: pic.telematika" className="pl-10" />
              </div>
            </FormField>
            <FormField label="Kata sandi" htmlFor="password" required>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <TextInput id="password" name="password" autoComplete="current-password" required type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" className="pl-10 pr-11" />
                <button type="button" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </FormField>
            {errorMessage && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800">{errorMessage}</div>}
            <Button type="submit" size="lg" disabled={isSubmitting || !username.trim() || !password} className="mt-1 h-11 w-full justify-between px-4 text-sm">
              <span>{isSubmitting ? "Memverifikasi…" : "Masuk ke dashboard"}</span><ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-8 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-700" />
            <p className="text-xs leading-5 text-slate-500">Sesi ini hanya untuk pengguna internal yang memiliki akses. Aktivitas operasional tercatat pada audit sistem.</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} LEMIGAS · Visitor Management System</p>
      </section>
    </main>
  );
}
