import { signal } from "@Signal/signal";
import network_cache from "@Hooks/api-cache";

export type AuthSignalType = {
  selectedToken?: string;
  user?: { id?: string; name: string; email?: string };
};

export const auth_signal = signal<AuthSignalType>({});

export const is_authenticated = () => Boolean(auth_signal.value.selectedToken);

export const set_login_response = (token: string, user: AuthSignalType["user"]) => {
  auth_signal.value = { selectedToken: token, user };
};

export const set_mock_auth = (name = "Demo User") => {
  set_login_response("demo-token", { name });
};

export const clear_auth = () => {
  auth_signal.value = {};
  network_cache.clear();
};
