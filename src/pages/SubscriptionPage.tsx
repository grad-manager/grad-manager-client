import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle, XCircle, Zap, ArrowRight, User, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  DEFAULT_PRICING_CONTEXT,
  fetchPricingContext,
  getCachedPricingContext,
  type PlanKey,
  type PricingContext,
} from "../utils/pricingContext";
import { isTrialActive, normalizePlanLabel, shouldRestrictAppAccess } from "../utils/trial";

const getPlanCheckoutUrl = (planName: string, selectedCurrency: PricingContext["checkoutCurrency"]) => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const endpoint = "/payment/initialize";
  return `${baseUrl.replace(/\/$/, "")}${endpoint}?plan=${planName.toLowerCase()}&currency=${selectedCurrency}`;
};

interface PlanFeature {
  text: string;
  status: "Included" | "Limited" | "Excluded" | "Priority";
}

interface Plan {
  name: "Free" | "Pro";
  tag?: string;
  buttonText: string;
  buttonClass: string;
  features: PlanFeature[];
}

const getIcon = (status: PlanFeature["status"]) => {
  switch (status) {
    case "Included":
    case "Priority":
      return <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" aria-hidden="true" />;
    case "Limited":
      return <CheckCircle className="flex-shrink-0 w-5 h-5 text-amber-500" aria-hidden="true" />;
    case "Excluded":
    default:
      return <XCircle className="flex-shrink-0 w-5 h-5 text-gray-300" aria-hidden="true" />;
  }
};

const highlightNumbersAndUnlimited = (text: string) => {
  const regex = /(\d+(?:,\d+)*)|(Unlimited)/gi;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (
      part &&
      (!isNaN(Number(part.replace(/,/g, ""))) || part.toLowerCase() === "unlimited")
    ) {
      return (
        <span key={index} className="font-extrabold text-indigo-600">
          {part}
        </span>
      );
    }

    return part;
  });
};

const plans: Plan[] = [
  {
    name: "Free",
    buttonText: "Start for Free",
    buttonClass: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    features: [
      { text: "Full access to Program & Scholarship Search Engine", status: "Included" },
      { text: "Funding details for thousands of programs", status: "Included" },
      { text: "GRE, English Test & Application Fee Waiver info", status: "Excluded" },
      { text: "Deadline tracker + required documents & professor links", status: "Excluded" },
      { text: "Smart Application Tracker: 2 schools", status: "Limited" },
      { text: "AI Application Checker: 2 checks", status: "Limited" },
      { text: "Join ongoing project: 1 project", status: "Limited" },
      { text: "SOP, Essay & CV Review", status: "Excluded" },
      { text: "Mock Interview prep (Profs, Admission and Visa)", status: "Excluded" },
      { text: "Connect & Chat; Scholarship Group Joining; Community Feed", status: "Included" },
      { text: "Access to Application Blogs", status: "Excluded" },
      { text: "Bi-monthly zoom Networking session and scholarship Q/A", status: "Excluded" },
      { text: "Priority Access to Beta Features", status: "Excluded" },
    ],
  },
  {
    name: "Pro",
    tag: "Popular Choice",
    buttonText: "Go Pro",
    buttonClass: "bg-indigo-500 text-white hover:bg-indigo-600",
    features: [
      { text: "Full access to Program & Scholarship Search Engine", status: "Included" },
      { text: "Funding details for thousands of programs", status: "Included" },
      { text: "GRE, English Test & Application Fee Waiver info", status: "Included" },
      { text: "Deadline tracker + required documents & professor links", status: "Included" },
      { text: "Smart Application Tracker: Unlimited schools", status: "Included" },
      { text: "AI Application Checker: 15 checks", status: "Limited" },
      { text: "Join ongoing project: Unlimited projects", status: "Included" },
      { text: "SOP, Essay & CV Review: 3 reviews", status: "Limited" },
      { text: "Connect & Chat; Scholarship Group Joining; Community Feed", status: "Included" },
      { text: "Access to Application Blogs", status: "Included" },
      { text: "Tri-monthly zoom seminar on scholarship topics", status: "Included" },
      { text: "Priority Access to Beta Features: 1st Priority", status: "Priority" },
    ],
  },
];

const getPlanDurationLabel = (planName: Plan["name"]) => {
  return planName === "Free" ? "/ 3 days (Free Trial)" : "/ 3 months";
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const SubscriptionPage: React.FC = () => {
  const { currentUser, userProfile, refreshUserData, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [pricingContext, setPricingContext] = useState<PricingContext>(
    () => getCachedPricingContext() || DEFAULT_PRICING_CONTEXT
  );
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const isLoggedIn = !!currentUser;
  const rawPlan = userProfile?.subscription?.plan || "free";
  const currentPlan = normalizePlanLabel(rawPlan);
  const userGreetingName = currentUser?.displayName?.split(" ")[0] || "Scholar";
  const trialActive = isTrialActive(userProfile?.trial);
  const accessRestricted = shouldRestrictAppAccess(userProfile);
  const trialEndDate = userProfile?.trial?.endDate;
  const blockedReason = searchParams.get("reason");
  const blockedFrom =
    ((location.state as { from?: string } | null)?.from || searchParams.get("next") || "").trim();

  useEffect(() => {
    let ignore = false;

    const loadPricingContext = async () => {
      try {
        const resolvedContext = await fetchPricingContext();

        if (!ignore) {
          setPricingContext(resolvedContext);
        }
      } catch (error) {
        console.error("Failed to detect pricing region:", error);
        if (!ignore) {
          const fallbackContext =
            (error as { pricingFallback?: PricingContext })?.pricingFallback ||
            getCachedPricingContext() ||
            DEFAULT_PRICING_CONTEXT;
          setPricingContext(fallbackContext);
        }
      }
    };

    loadPricingContext();

    return () => {
      ignore = true;
    };
  }, []);

  const handlePlanSelection = async (planName: string) => {
    if (!pricingContext) {
      setMessage({ text: "Still detecting your local pricing. Please wait a moment.", type: "info" });
      return;
    }

    if (!currentUser || typeof currentUser.getIdToken !== "function") {
      setMessage({ text: "Please log in to activate a plan.", type: "error" });
      return;
    }

    const normalizedCurrentPlan = currentPlan.toUpperCase();
    if (planName.toUpperCase() === normalizedCurrentPlan) {
      setMessage({ text: `You are already subscribed to the ${currentPlan} plan.`, type: "info" });
      return;
    }

    const checkoutCurrency = pricingContext.checkoutCurrency;
    const planKey = planName.toLowerCase();

    setIsLoading(planName);
    setMessage(null);

    try {
      const token = await currentUser.getIdToken();
      if (!token) {
        setMessage({ text: "Authentication token missing. Please re-log in.", type: "error" });
        setIsLoading(null);
        return;
      }

      const url = getPlanCheckoutUrl(planName, checkoutCurrency);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (planKey === "free") {
        setMessage({ text: response.data.message || "Free plan successfully activated.", type: "success" });
        if (refreshUserData) {
          await refreshUserData();
        }
      } else {
        const redirectUrl = response.data.authorizationUrl;
        if (!redirectUrl) {
          throw new Error("Payment redirect URL not received from the server.");
        }

        setMessage({
          text: `Redirecting to ${planName} checkout in ${checkoutCurrency}...`,
          type: "info",
        });

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 600);
        return;
      }
    } catch (error) {
      console.error(`${planName} plan selection error:`, error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || `Failed to initiate ${planName} plan.`
        : "An unknown error occurred.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      if (planName !== "Free") {
        setIsLoading(null);
      }
    }
  };

  const handleVerification = useCallback(
    async (reference: string, transactionId: string | null) => {
      if (!currentUser || typeof currentUser.getIdToken !== "function" || !refreshUserData) {
        return;
      }

      setIsLoading("Verifying");
      setMessage({ text: "Verifying payment. Please wait...", type: "info" });

      try {
        const token = await currentUser.getIdToken(true);
        const baseUrl = import.meta.env.VITE_API_URL || "";

        let verificationUrl = `${baseUrl.replace(/\/$/, "")}/payment/verify?reference=${reference}`;
        if (transactionId) {
          verificationUrl += `&transaction_id=${transactionId}`;
        }

        const response = await axios.get(verificationUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessage({
          text: response.data.message || "Subscription activated successfully.",
          type: "success",
        });

        await refreshUserData();
      } catch (error) {
        console.error("Verification error:", error);
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || "Payment verification failed. Please contact support."
          : "An unexpected error occurred during verification.";
        setMessage({ text: errorMessage, type: "error" });
      } finally {
        setIsLoading(null);
        navigate("/subscribe", { replace: true });
      }
    },
    [currentUser, refreshUserData, navigate]
  );

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref") || searchParams.get("tx_ref");
    const transactionId = searchParams.get("transaction_id");

    if (reference && currentUser && !authLoading) {
      handleVerification(reference, transactionId);
    }

    if (!reference && transactionId) {
      navigate("/subscribe", { replace: true });
    }
  }, [searchParams, currentUser, handleVerification, navigate, authLoading]);

  return (
    <div className="min-h-screen bg-gray-50 mt-14 antialiased">
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="absolute inset-0 bg-indigo-50/50 [mask-image:radial-gradient(100%_100%_at_top_left,white,transparent)]" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
              <Zap className="w-4 h-4" />
              Maximize Your Scholarship Potential
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-snug">
              Simple, Transparent Pricing to <span className="text-indigo-600">Secure Your Admission</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Unlock powerful tools, expert reviews, and personalized guidance for your 3-month application journey.
            </p>
          </motion.header>

          {trialActive && rawPlan === "free" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="mt-8 mx-auto max-w-4xl rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-6 py-5 text-white shadow-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                3-Day Free Trial
              </p>
              <h2 className="mt-2 text-2xl font-bold">Your trial is active right now.</h2>
              <p className="mt-2 text-sm sm:text-base text-white/90">
                Full platform access is unlocked until <span className="font-semibold">{formatDate(trialEndDate)}</span>.
                Once the trial ends, your account will be restricted until you subscribe to Pro.
              </p>
            </motion.div>
          )}

          {(accessRestricted || blockedReason === "trial-expired") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="mt-8 mx-auto max-w-4xl rounded-2xl border border-amber-300 bg-amber-50 px-6 py-5 text-left shadow-lg"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                Access Restricted
              </p>
              <h2 className="mt-2 text-2xl font-bold text-amber-950">
                Your 3-day free trial has ended.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-amber-900">
                Your trial ended on <span className="font-semibold">{formatDate(trialEndDate)}</span>. Subscribe to Pro to restore access.
                {blockedFrom ? ` You were redirected here from ${blockedFrom}.` : ""}
              </p>
            </motion.div>
          )}

          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-10 mx-auto max-w-3xl bg-white rounded-xl shadow-xl p-5 sm:p-6 border-t-4 border-indigo-600 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <User className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Welcome back, {userGreetingName}.</p>
                  <p className="text-lg font-bold text-gray-900">
                    Your current plan: <span className="text-indigo-700">{currentPlan}</span>
                  </p>
                </div>
              </div>
              <Link
                to="/settings/billing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition"
              >
                Manage Subscription
                <Settings className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className={`mx-auto mt-6 max-w-3xl rounded-lg p-3 text-center text-sm font-medium shadow ${
                message.type === "success"
                  ? "bg-emerald-500 text-white"
                  : message.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
              role="status"
              aria-live="polite"
            >
              {message.text}
            </motion.div>
          )}
        </div>
      </section>

      <main id="plans" className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:gap-10">
          {plans.map((plan, idx) => {
            const isActivePlan = plan.name.toUpperCase() === currentPlan.toUpperCase();
            const disabled =
              isLoading === plan.name || !isLoggedIn || isActivePlan || !pricingContext;
            const isBestValue = plan.tag === "Popular Choice";
            const planKey = plan.name.toLowerCase() as PlanKey;
            const displayPrice = pricingContext?.plans[planKey]?.formatted || "Loading...";

            return (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`relative rounded-3xl p-8 bg-white shadow-xl flex flex-col transition-all duration-300 transform ${
                  isBestValue
                    ? "border-4 border-indigo-600 ring-4 ring-indigo-50/50 scale-[1.03] shadow-indigo-200/50"
                    : isActivePlan
                    ? "border-2 border-emerald-500"
                    : "border border-gray-100 hover:shadow-lg"
                }`}
              >
                {(isBestValue || isActivePlan) && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold shadow-md uppercase ${
                      isBestValue ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
                    }`}
                  >
                    {isActivePlan ? "Your Current Plan" : plan.tag}
                  </div>
                )}

                <div className="mt-3 mb-6 flex flex-col justify-start">
                  <h3 className={`text-3xl font-extrabold ${isBestValue ? "text-indigo-600" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 mt-1 text-sm">
                    Perfect for{" "}
                    {plan.name === "Free"
                      ? "beginners exploring options."
                      : "serious scholars aiming for top-tier support."}
                  </p>
                </div>

                <div className="mb-6 border-b border-gray-100 pb-6">
                  <div className="text-4xl font-extrabold text-gray-900">{displayPrice}</div>
                  <span className="text-sm font-medium text-gray-500">
                    {getPlanDurationLabel(plan.name)}
                  </span>
                </div>

                <button
                  onClick={() => handlePlanSelection(plan.name)}
                  disabled={disabled}
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-lg font-semibold shadow-md transition-all duration-200 ${plan.buttonClass} ${
                    disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.01] hover:shadow-lg"
                  }`}
                  aria-disabled={disabled}
                >
                  {isActivePlan
                    ? "Current Plan"
                    : isLoading === plan.name
                    ? plan.name === "Free"
                      ? "Activating..."
                      : "Redirecting..."
                    : plan.buttonText}
                  {!isActivePlan && <ArrowRight className="w-5 h-5 ml-1" />}
                </button>

                <ul className="mt-8 space-y-4 divide-y divide-gray-100 flex-grow pt-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Key Features:</p>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="pt-2 flex items-start gap-3">
                      <div className="mt-1">{getIcon(feature.status)}</div>
                      <p
                        className={`text-base ${
                          feature.status === "Excluded"
                            ? "text-gray-400 italic line-through"
                            : "text-gray-700 font-medium"
                        }`}
                      >
                        {highlightNumbersAndUnlimited(feature.text)}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </main>

      <section className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center bg-indigo-50 rounded-2xl p-8 shadow-inner">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h4 className="text-xl font-bold text-gray-900">Questions about our plans?</h4>
              <p className="mt-1 text-gray-600">
                Contact our support team for a personalized recommendation or billing assistance.
              </p>
            </div>
            <a
              href="mailto:gradmanager@futuregrin.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition transform hover:scale-[1.01]"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPage;
