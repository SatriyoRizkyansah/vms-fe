import { signal } from "@Signal/signal";
import network_cache from "@Hooks/api-cache";

export type AuthUser = {
  id?: string;
  name: string;
  full_name?: string;
  nip_username?: string;
  email?: string;
  role?: "PIC" | "ADMIN" | "AUDITOR";
};

export type AuthSignalType = {
  selectedToken?: string;
  user?: AuthUser;
  expiresAt?: number;
};

const storageKey = "vms-auth-session";

function restoreSession(): AuthSignalType {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return {};
    const session = JSON.parse(stored) as AuthSignalType;
    if (!session.selectedToken || (session.expiresAt && session.expiresAt <= Date.now())) {
      localStorage.removeItem(storageKey);
      return {};
    }
    return session;
  } catch {
    return {};
  }
}

export const auth_signal = signal<AuthSignalType>(restoreSession());

export const is_authenticated = () => Boolean(auth_signal.value.selectedToken);

export const set_login_response = (token: string, user: AuthUser, expiresInSeconds?: number) => {
  const session: AuthSignalType = {
    selectedToken: token,
    user,
    ...(expiresInSeconds ? { expiresAt: Date.now() + expiresInSeconds * 1000 } : {}),
  };
  auth_signal.value = session;
  localStorage.setItem(storageKey, JSON.stringify(session));
};

export const update_auth_user = (user: AuthUser) => {
  const session = { ...auth_signal.value, user };
  auth_signal.value = session;
  localStorage.setItem(storageKey, JSON.stringify(session));
};

export const set_mock_auth = (name = "Demo User") => {
  set_login_response("demo-token", { name });
};

export const clear_auth = () => {
  auth_signal.value = {};
  localStorage.removeItem(storageKey);
  network_cache.clear();
};
