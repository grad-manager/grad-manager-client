import axios from "axios";

export type CheckoutCurrency = string;
export type PlanKey = "free" | "pro";

export type PricingContext = {
  countryCode: string;
  displayCurrency: CheckoutCurrency;
  displayCurrencyLabel: string;
  checkoutCurrency: CheckoutCurrency;
  paymentHint: string;
  debug?: {
    detectionSource?: string | null;
    ipAddress?: string | null;
    timezoneHint?: string | null;
    localeHint?: string | null;
    countryHint?: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
  };
  plans: Record<
    PlanKey,
    {
      amount: number;
      currency: CheckoutCurrency;
      formatted: string;
    }
  >;
};

type StoredPricingContext = {
  cachedAt: number;
  value: PricingContext;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let memoryCache: PricingContext | null = null;
let inflightRequest: Promise<PricingContext> | null = null;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getBrowserLocale = () => {
  if (typeof navigator === "undefined") {
    return "";
  }

  return (
    navigator.languages?.find((language) => language.includes("-")) ||
    navigator.language ||
    Intl.DateTimeFormat().resolvedOptions().locale ||
    ""
  );
};

const getBrowserCountryHint = () => {
  const locale = getBrowserLocale();
  const match = locale.match(/-([A-Z]{2})(?:$|-)/i);
  return match?.[1]?.toUpperCase() || "";
};

const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

export const DEFAULT_PRICING_CONTEXT: PricingContext = {
  countryCode: "US",
  displayCurrency: "USD",
  displayCurrencyLabel: "US Dollar",
  checkoutCurrency: "NGN",
  paymentHint: "Displayed in US Dollar, charged in NGN via Paystack at checkout.",
  debug: {
    detectionSource: "default_fallback",
    ipAddress: null,
    timezoneHint: getBrowserTimezone() || null,
    localeHint: getBrowserLocale() || null,
    countryHint: getBrowserCountryHint() || null,
    errorCode: null,
    errorMessage: null,
  },
  plans: {
    free: { amount: 0, currency: "USD", formatted: "$0" },
    pro: { amount: 30, currency: "USD", formatted: "$30" },
  },
};

const getCacheKey = () => {
  const timezone = getBrowserTimezone();
  const countryHint = getBrowserCountryHint();
  const suffix = (timezone || countryHint || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `gradtracker_pricing_context_${suffix}`;
};

const readStoredPricingContext = (): PricingContext | null => {
  if (memoryCache) {
    return memoryCache;
  }

  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getCacheKey());
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredPricingContext;
    if (!parsed?.cachedAt || !parsed?.value) {
      return null;
    }

    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      window.localStorage.removeItem(getCacheKey());
      return null;
    }

    memoryCache = parsed.value;
    return parsed.value;
  } catch {
    return null;
  }
};

const writeStoredPricingContext = (value: PricingContext) => {
  memoryCache = value;

  if (!canUseStorage()) {
    return;
  }

  try {
    const payload: StoredPricingContext = {
      cachedAt: Date.now(),
      value,
    };
    window.localStorage.setItem(getCacheKey(), JSON.stringify(payload));
  } catch {
    // ignore storage failures
  }
};

export const getCachedPricingContext = () => readStoredPricingContext();

export const fetchPricingContext = async (): Promise<PricingContext> => {
  const cached = readStoredPricingContext();
  if (cached) {
    return cached;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  const baseUrl = import.meta.env.VITE_API_URL || "";
  const locale = getBrowserLocale();
  const countryHint = getBrowserCountryHint();
  const timezone = getBrowserTimezone();
  const params = new URLSearchParams();

  if (countryHint) {
    params.set("countryHint", countryHint);
  }
  if (locale) {
    params.set("locale", locale);
  }
  if (timezone) {
    params.set("timezone", timezone);
  }

  inflightRequest = axios
    .get(
      `${baseUrl.replace(/\/$/, "")}/payment/context${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
      timeout: 5000,
      }
    )
    .then((response) => {
      const payload = response.data as PricingContext & {
        success?: boolean;
      };
      const resolved = {
        ...payload,
      };
      delete resolved.success;
      writeStoredPricingContext(resolved);
      return resolved;
    })
    .catch((error) => {
      const fallback = readStoredPricingContext() || {
        ...DEFAULT_PRICING_CONTEXT,
        debug: {
          detectionSource: "default_fallback",
          ipAddress: null,
          timezoneHint: getBrowserTimezone() || null,
          localeHint: getBrowserLocale() || null,
          countryHint: getBrowserCountryHint() || null,
          errorCode: axios.isAxiosError(error) ? error.code || null : null,
          errorMessage: axios.isAxiosError(error)
            ? error.message
            : error instanceof Error
            ? error.message
            : "Unknown pricing fetch error",
        },
      };

      throw Object.assign(error, { pricingFallback: fallback });
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
};

export const warmPricingContext = () => {
  void fetchPricingContext().catch(() => {
    // background prefetch should not interrupt app startup
  });
};
