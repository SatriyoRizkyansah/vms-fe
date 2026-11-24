/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, type DependencyList } from "react";
import network_cache from "./api-cache";
import { show_alert_snackbar } from "@Signal/use-signal/snackbar_signal";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { Api } from "@Hooks/api-generated";
import { parseApiError } from "src/common/api-error-handler";
import { unwrapApiResponse } from "@/common/api-response";
import { close_loading, show_loading } from "@Signal/use-signal/loading-method-signal";
// import { useSignalValue, useSignal } from "@Signal/hooks";
import { useSignalValue, useSignal } from "@Signal/hooks";
export class UseQueryReturnType<
  Tags extends keyof Api<unknown>,
  Method extends keyof Api<unknown>[Tags],
  Data extends Api<unknown>[Tags][Method] extends (...args: any) => any
    ? // @ts-ignore
      AsyncReturnType<Api<unknown>[Tags][Method]>["data"]
    : Api<unknown>[Tags][Method],
> {
  is_loading: boolean;
  response: Data | null;
  error: any | null;
  params: Api<unknown>[Tags][Method] extends (...args: any) => any ? Parameters<Api<unknown>[Tags][Method]> : Api<unknown>[Tags][Method];
  call_back: () => void;
  symbol: string;
}

export class UseQueryParams<Tags extends keyof Api<unknown>, Method extends keyof Api<unknown>[Tags]> {
  api_tag: Tags;
  api_method: Method;
  api_query: Api<unknown>[Tags][Method] extends (...args: any) => any ? Parameters<Api<unknown>[Tags][Method]> : Api<unknown>[Tags][Method];
  re_render_dependencies?: DependencyList;
  should_running_if?: boolean;
  is_public?: boolean;
  options?: {
    should_disable_error_message?: boolean;
    should_use_global_loading_overlay?: boolean;
    will_exec_after_success?: (
      res: Api<unknown>[Tags][Method] extends (...args: any) => any
        ? // @ts-ignore
          AsyncReturnType<Api<unknown>[Tags][Method]>["data"]
        : Api<unknown>[Tags][Method],
    ) => void;
    will_exec_after_error?: (error: any) => void;
  };
}

export default function use_query<
  Tags extends keyof Api<unknown>,
  Method extends keyof Api<unknown>[Tags],
  Data extends Api<unknown>[Tags][Method] extends (...args: any) => any
    ? // @ts-ignore
      AsyncReturnType<Api<unknown>[Tags][Method]>["data"]
    : Api<unknown>[Tags][Method],
>(props: UseQueryParams<Tags, Method>): UseQueryReturnType<Tags, Method, Data> {
  const { api_tag, api_method, api_query, should_running_if = true, is_public = false, options } = props;

  // Subscribe to auth signal so queries refetch when token/role changes
  const authState = useSignalValue(auth_signal);
  const selectedToken = authState?.selectedToken || "";
  const isProtectedQuery = !is_public;
  const canRunQuery = should_running_if && (!isProtectedQuery || Boolean(selectedToken));

  const tag = api_tag;
  const method = api_method;
  const params = api_query;
  const cacheKeyDelimiter = "::";
  // Include token in cache key to avoid serving stale data after role switch
  const network_cache_symbol = [selectedToken || "no-token", tag, method, JSON.stringify(params)].join(cacheKeyDelimiter);

  const api = new Api({
    baseApiParams: {
      headers: selectedToken
        ? {
            authorization: `Bearer ${selectedToken}`,
          }
        : {},
    },
  });

  const cache = network_cache.get(network_cache_symbol);

  const call_api_endpoint = api[tag][method] as (...args: any[]) => any;

  if (typeof call_api_endpoint !== "function") {
    return {
      error: "Function not found",
      is_loading: false,
      response: null,
      params,
      call_back: () => {},
      symbol: network_cache_symbol,
    };
  }

  const [localState, setLocalState] = useSignal<{
    is_loading: boolean;
    response: Data | null;
    error: any | null;
    params: Api<unknown>[Tags][Method] extends (...args: any) => any ? Parameters<Api<unknown>[Tags][Method]> : Api<unknown>[Tags][Method];
  }>({
    is_loading: false,
    response: cache ? cache : null,
    error: null,
    params,
  });

  const [refreshTrigger, setRefreshTrigger] = useSignal(0);

  async function fetch_data_from_server() {
    const currentCache = network_cache.get(network_cache_symbol);

    if (currentCache) {
      setLocalState((prev) => ({ ...prev, response: currentCache, error: null }));
      return;
    }

    if (!canRunQuery) {
      setLocalState((prev) => ({ ...prev, is_loading: false }));
      return;
    }

    setLocalState((prev) => ({ ...prev, is_loading: true, error: null }));
    if (options?.should_use_global_loading_overlay) show_loading(150);
    try {
      const response = await call_api_endpoint(...(params as Array<any>), { format: "json" });
      const payload = unwrapApiResponse(response.data);
      setLocalState((prev) => ({ ...prev, response: payload, error: null }));
      network_cache.set(network_cache_symbol, payload);
      if (options?.will_exec_after_success) options.will_exec_after_success(payload);
    } catch (error: any) {
      setLocalState((prev) => ({ ...prev, error }));

      // Parse error dengan safe handling
      const parsedError = await parseApiError(error);

      if (parsedError.status === 401 && selectedToken) {
        auth_signal.value = {};
        network_cache.clear();
      }

      // Hapus cache jika terjadi error
      network_cache.delete(network_cache_symbol);

      const shouldShowErrorMessage = !options?.should_disable_error_message && (parsedError.status !== 401 || Boolean(selectedToken));

      if (shouldShowErrorMessage) {
        show_alert_snackbar({
          severity: "error",
          message: parsedError.message,
        });
      }
      if (options?.will_exec_after_error) options.will_exec_after_error(error);
    }
    setLocalState((prev) => ({ ...prev, is_loading: false }));
    if (options?.should_use_global_loading_overlay) close_loading(100);
  }

  // Debounce untuk search queries
  useEffect(() => {
    // Clear cache lama jika parameter berubah (kecuali refreshTrigger)
    const paramString = JSON.stringify(params);
    const cacheKeys = Array.from(network_cache.keys()) as string[];
    const relatedCaches = cacheKeys.filter((key: string) => {
      const keyParts = key.split(cacheKeyDelimiter);
      return keyParts[0] === (selectedToken || "no-token") && keyParts[1] === tag && keyParts[2] === method;
    });

    // Hapus cache lama jika parameter berbeda
    relatedCaches.forEach((key: string) => {
      const keyParts = key.split(cacheKeyDelimiter);
      if (keyParts[3] !== paramString) {
        network_cache.delete(key);
      }
    });

    const timeoutId = setTimeout(
      () => {
        fetch_data_from_server();
      },
      // @ts-ignore - hardcoded method/tag untuk debounce khusus lokasi search
      method === "lokasi" && tag === "searchOptimize" ? 300 : 0,
    );

    return () => clearTimeout(timeoutId);
  }, [network_cache_symbol, refreshTrigger, canRunQuery]);

  const enhanced_callback = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    response: localState.response,
    is_loading: localState.is_loading,
    error: localState.error,
    params: localState.params,
    call_back: enhanced_callback,
    symbol: network_cache_symbol,
  };
}
