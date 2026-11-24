/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface LoginDto {
  /** @example "pic.telematika" */
  username: string;
  /** @example "YourStrongPassword" */
  password: string;
}

export interface BootstrapAdminDto {
  /** @example "Administrator VMS" */
  full_name: string;
  /** @example "admin.vms" */
  username: string;
  /** @example "admin@example.org" */
  email: string;
  /** @example "+6281234567890" */
  phone_number?: string;
  /** @minLength 12 */
  password: string;
}

export interface CreateUserDto {
  /** @example "pic.telematika" */
  nip_username: string;
  /** @example "Nama Pegawai" */
  full_name: string;
  /** @example "pic@example.org" */
  email: string;
  /** @example "+6281234567890" */
  phone_number?: string;
  /** @default "PIC" */
  role: "PIC" | "ADMIN" | "AUDITOR";
  /** @minLength 12 */
  password: string;
}

export interface UpdateUserDto {
  full_name?: string;
  email?: string;
  phone_number?: string;
  role?: "PIC" | "ADMIN" | "AUDITOR";
  is_active?: boolean;
  /** @minLength 12 */
  password?: string;
}

export interface CreateVisitDto {
  /** @example "Budi Santoso" */
  visitor_name: string;
  /** @example "3174xxxxxxxxxxxx" */
  visitor_identity_no: string;
  /** @example "PT Contoh Indonesia" */
  visitor_institution: string;
  /** @example "+6281234567890" */
  visitor_phone: string;
  /** @example "budi@example.org" */
  visitor_email: string;
  /** @example "Pemeliharaan perangkat jaringan" */
  purpose: string;
  /** @format uuid */
  pic_user_id: string;
  /**
   * Defaults to the active pilot room device
   * @format uuid
   */
  room_device_id?: string;
  /** @example "2026-12-01T02:00:00.000Z" */
  scheduled_start: string;
  /** @example "2026-12-01T03:00:00.000Z" */
  scheduled_end: string;
}

export interface WalkInVisitDto {
  /** @example "Budi Santoso" */
  visitor_name: string;
  /** @example "3174xxxxxxxxxxxx" */
  visitor_identity_no: string;
  /** @example "PT Contoh Indonesia" */
  visitor_institution: string;
  /** @example "+6281234567890" */
  visitor_phone: string;
  /** @example "budi@example.org" */
  visitor_email: string;
  /** @example "Pemeliharaan perangkat jaringan" */
  purpose: string;
  /** @format uuid */
  pic_user_id: string;
  /**
   * Defaults to the active pilot room device
   * @format uuid
   */
  room_device_id?: string;
  /** @example "2026-12-01T02:00:00.000Z" */
  scheduled_start: string;
  /** @example "2026-12-01T03:00:00.000Z" */
  scheduled_end: string;
  /**
   * Approve and provision a PIN immediately
   * @default false
   */
  auto_approve?: boolean;
  /**
   * Emergency maintenance outside configured hours
   * @default false
   */
  is_emergency?: boolean;
}

export type Object = object;

export interface RejectVisitDto {
  /** @example "Jadwal belum dapat disetujui" */
  reason: string;
}

export interface ExtendVisitDto {
  minutes: 30 | 60;
}

export interface ManualCheckInDto {
  /** @example "Kehadiran diverifikasi langsung oleh petugas" */
  reason: string;
}

export interface UpdateSettingsDto {
  /**
   * @min 0
   * @max 180
   * @default 15
   */
  access_buffer_before_minutes?: number;
  /**
   * @min 0
   * @max 180
   * @default 15
   */
  access_buffer_after_minutes?: number;
  /** @example "08:00" */
  operating_hours_start?: object | null;
  /** @example "17:00" */
  operating_hours_end?: object | null;
}

export interface CreateDeviceDto {
  /** @example "Ruangan Telematika" */
  room_name: string;
  /** @example "tuya-device-id" */
  tuya_device_id: string;
  /** @default 7 */
  pin_length: 6 | 7;
}

export interface UpdateDeviceDto {
  room_name?: string;
  tuya_device_id?: string;
  pin_length?: 6 | 7;
  is_active?: boolean;
}

export interface TuyaEventDto {
  /** @example "tuya-device-id" */
  tuya_device_id: string;
  event_type:
    | "UNLOCK_PIN"
    | "UNLOCK_RFID"
    | "WRONG_PIN"
    | "TAMPER"
    | "LOW_BATTERY"
    | "DEVICE_ONLINE"
    | "DEVICE_OFFLINE"
    | "OTHER";
  /** @example "2026-12-01T02:10:00.000Z" */
  occurred_at: string;
  /** @example "124367346" */
  password_id?: string;
  /** @example "unique-tuya-event-id" */
  event_key?: string;
  /**
   * @min 0
   * @max 100
   */
  battery_level?: number;
  raw_payload: Record<string, any>;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title VMS API
 * @version 1.0
 * @contact
 *
 * API documentation
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  health = {
    /**
     * No description
     *
     * @tags Health
     * @name HealthCheck
     * @summary Check API health
     * @request GET:/api/v1/health
     */
    healthCheck: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/health`,
        method: "GET",
        ...params,
      }),
  };
  authentication = {
    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerLogin
     * @summary Sign in with an internal VMS account
     * @request POST:/api/v1/auth/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerMe
     * @summary Get the current internal VMS account profile
     * @request GET:/api/v1/auth/me
     * @secure
     */
    authControllerMe: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/auth/me`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerBootstrap
     * @summary Create the first admin account
     * @request POST:/api/v1/auth/bootstrap
     */
    authControllerBootstrap: (
      data: BootstrapAdminDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/auth/bootstrap`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAll
     * @summary List internal VMS accounts
     * @request GET:/api/v1/users
     * @secure
     */
    usersControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/users`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerCreate
     * @summary Create an internal VMS account
     * @request POST:/api/v1/users
     * @secure
     */
    usersControllerCreate: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindOne
     * @summary Get an internal VMS account
     * @request GET:/api/v1/users/{id}
     * @secure
     */
    usersControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/users/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdate
     * @summary Update an internal VMS account
     * @request PATCH:/api/v1/users/{id}
     * @secure
     */
    usersControllerUpdate: (
      id: string,
      data: UpdateUserDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/users/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  visits = {
    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerCreate
     * @summary Submit a public visitor pre-registration request
     * @request POST:/api/v1/visits
     */
    visitsControllerCreate: (
      data: CreateVisitDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerFindAll
     * @summary List visits visible to the signed-in account
     * @request GET:/api/v1/visits
     * @secure
     */
    visitsControllerFindAll: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: Object;
        /**
         * @min 1
         * @max 100
         * @default 20
         */
        limit?: Object;
        status?:
          | "PENDING_APPROVAL"
          | "APPROVED"
          | "PROVISIONED"
          | "OFFLINE_FALLBACK"
          | "CHECKED_IN"
          | "REJECTED"
          | "COMPLETED"
          | "REVOKED"
          | "EXPIRED";
        /** @example "VMS-20261201" */
        search?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerListActivePics
     * @summary List PIC names available for visitor pre-registration
     * @request GET:/api/v1/visits/pics
     */
    visitsControllerListActivePics: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/visits/pics`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerCreateWalkIn
     * @summary Register a walk-in visitor
     * @request POST:/api/v1/visits/walk-in
     * @secure
     */
    visitsControllerCreateWalkIn: (
      data: WalkInVisitDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits/walk-in`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerGetStatusHistory
     * @summary Read immutable visit status history
     * @request GET:/api/v1/visits/{id}/status-history
     * @secure
     */
    visitsControllerGetStatusHistory: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/status-history`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerFindOne
     * @summary Get visit details, including masked access credential
     * @request GET:/api/v1/visits/{id}
     * @secure
     */
    visitsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerApprove
     * @summary Approve a visit and provision its temporary PIN
     * @request POST:/api/v1/visits/{id}/approve
     * @secure
     */
    visitsControllerApprove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/approve`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerReject
     * @summary Reject a pending visit request
     * @request POST:/api/v1/visits/{id}/reject
     * @secure
     */
    visitsControllerReject: (
      id: string,
      data: RejectVisitDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/reject`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerRetryProvision
     * @summary Retry temporary PIN provisioning for an approved visit
     * @request POST:/api/v1/visits/{id}/provision
     * @secure
     */
    visitsControllerRetryProvision: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/provision`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerExtend
     * @summary Extend a checked-in visit by 30 or 60 minutes
     * @request POST:/api/v1/visits/{id}/extend
     * @secure
     */
    visitsControllerExtend: (
      id: string,
      data: ExtendVisitDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/extend`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerCheckOut
     * @summary Check out a visitor and revoke the temporary PIN
     * @request POST:/api/v1/visits/{id}/check-out
     * @secure
     */
    visitsControllerCheckOut: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/check-out`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerRevoke
     * @summary Cancel a visit and remove any provisioned temporary PIN
     * @request POST:/api/v1/visits/{id}/revoke
     * @secure
     */
    visitsControllerRevoke: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/revoke`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerManualCheckIn
     * @summary Record a manually verified visitor arrival
     * @request POST:/api/v1/visits/{id}/manual-check-in
     * @secure
     */
    visitsControllerManualCheckIn: (
      id: string,
      data: ManualCheckInDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/manual-check-in`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Visits
     * @name VisitsControllerRetryNotifications
     * @summary Retry delivery of the visit credential notification
     * @request POST:/api/v1/visits/{id}/notifications/retry
     * @secure
     */
    visitsControllerRetryNotifications: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/visits/${id}/notifications/retry`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  settings = {
    /**
     * No description
     *
     * @tags Settings
     * @name SettingsControllerGetSettings
     * @summary Get VMS access and operating-hour settings
     * @request GET:/api/v1/settings
     * @secure
     */
    settingsControllerGetSettings: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/settings`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsControllerUpdateSettings
     * @summary Update VMS access and operating-hour settings
     * @request PATCH:/api/v1/settings
     * @secure
     */
    settingsControllerUpdateSettings: (
      data: UpdateSettingsDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/settings`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  roomDevices = {
    /**
     * No description
     *
     * @tags Room Devices
     * @name DevicesControllerFindAll
     * @summary List room smart locks and health state
     * @request GET:/api/v1/devices
     * @secure
     */
    devicesControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/devices`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Room Devices
     * @name DevicesControllerCreate
     * @summary Register a Tuya smart lock
     * @request POST:/api/v1/devices
     * @secure
     */
    devicesControllerCreate: (
      data: CreateDeviceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/devices`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Room Devices
     * @name DevicesControllerFindOne
     * @summary Get room smart-lock status
     * @request GET:/api/v1/devices/{id}
     * @secure
     */
    devicesControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/devices/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Room Devices
     * @name DevicesControllerUpdate
     * @summary Update a room smart lock
     * @request PATCH:/api/v1/devices/{id}
     * @secure
     */
    devicesControllerUpdate: (
      id: string,
      data: UpdateDeviceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/devices/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  integrations = {
    /**
     * No description
     *
     * @tags Integrations
     * @name TuyaEventsControllerIngest
     * @summary Receive normalized Tuya lock events from the MQ consumer
     * @request POST:/api/v1/integrations/tuya/events
     */
    tuyaEventsControllerIngest: (
      data: TuyaEventDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/integrations/tuya/events`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  doorAuditLogs = {
    /**
     * No description
     *
     * @tags Door Audit Logs
     * @name AuditLogsControllerFindAll
     * @summary List immutable door access and device events
     * @request GET:/api/v1/audit-logs
     * @secure
     */
    auditLogsControllerFindAll: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: Object;
        /**
         * @min 1
         * @max 200
         * @default 50
         */
        limit?: Object;
        event_type?:
          | "UNLOCK_PIN"
          | "UNLOCK_RFID"
          | "WRONG_PIN"
          | "TAMPER"
          | "LOW_BATTERY"
          | "DEVICE_ONLINE"
          | "DEVICE_OFFLINE"
          | "OTHER";
        /** @example "2026-12-01T00:00:00.000Z" */
        from?: string;
        /** @example "2026-12-31T23:59:59.999Z" */
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/audit-logs`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Door Audit Logs
     * @name AuditLogsControllerFindOne
     * @summary Read an immutable door event and its payload
     * @request GET:/api/v1/audit-logs/{id}
     * @secure
     */
    auditLogsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/audit-logs/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  reports = {
    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerVisitsCsv
     * @summary Export visit requests as CSV
     * @request GET:/api/v1/reports/visits.csv
     * @secure
     */
    reportsControllerVisitsCsv: (
      query: {
        /** @example "2026-12-01T00:00:00.000Z" */
        from: string;
        /** @example "2026-12-31T23:59:59.999Z" */
        to: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/reports/visits.csv`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerVisitsPdf
     * @summary Export visit requests as PDF
     * @request GET:/api/v1/reports/visits.pdf
     * @secure
     */
    reportsControllerVisitsPdf: (
      query: {
        /** @example "2026-12-01T00:00:00.000Z" */
        from: string;
        /** @example "2026-12-31T23:59:59.999Z" */
        to: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/reports/visits.pdf`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerDoorAuditCsv
     * @summary Export door audit logs as CSV
     * @request GET:/api/v1/reports/door-audit.csv
     * @secure
     */
    reportsControllerDoorAuditCsv: (
      query: {
        /** @example "2026-12-01T00:00:00.000Z" */
        from: string;
        /** @example "2026-12-31T23:59:59.999Z" */
        to: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/reports/door-audit.csv`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerDoorAuditPdf
     * @summary Export door audit logs as PDF
     * @request GET:/api/v1/reports/door-audit.pdf
     * @secure
     */
    reportsControllerDoorAuditPdf: (
      query: {
        /** @example "2026-12-01T00:00:00.000Z" */
        from: string;
        /** @example "2026-12-31T23:59:59.999Z" */
        to: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/reports/door-audit.pdf`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
}
