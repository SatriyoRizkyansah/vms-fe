export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
};

export function isApiResponse<T = unknown>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<ApiResponse<unknown>>;
  return typeof response.statusCode === "number" && "data" in response && typeof response.message === "string";
}

export function unwrapApiResponse<T>(value: T | ApiResponse<T>): T {
  return isApiResponse<T>(value) ? value.data : value as T;
}

export function normalizeApiResponse<T>(value: unknown, statusCode = 200): ApiResponse<T> {
  if (isApiResponse<T>(value)) return value;
  const message =
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
      ? value.message
      : "Berhasil";
  return { statusCode, data: value as T, message };
}

export function getApiResponseMessage(value: unknown, fallback = "Berhasil") {
  return isApiResponse(value) ? value.message : fallback;
}
