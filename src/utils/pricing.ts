type CurrencyMeta = {
  code: string;
  locale: string;
  label: string;
};

const currencyDisplayNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;

export const getCurrencyMeta = (currency: string | undefined): CurrencyMeta => {
  const normalized = (currency || "USD").toUpperCase();
  const label = (() => {
    try {
      return currencyDisplayNames?.of(normalized) || normalized;
    } catch {
      return normalized;
    }
  })();

  return {
    code: normalized,
    locale: "en",
    label,
  };
};

export const formatCurrencyAmount = (
  amount: number,
  currency: string | undefined
) => {
  const meta = getCurrencyMeta(currency);
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.code,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
};
