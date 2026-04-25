import React from "react";
import { motion } from "framer-motion";
import { Settings, CheckCircle, Clock, CreditCard, Zap, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatCurrencyAmount, getCurrencyMeta } from "../utils/pricing";

const formatPlanName = (plan: string) => plan.charAt(0).toUpperCase() + plan.slice(1);

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) {
    return "N/A";
  }

  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    console.error("Failed to format date:", dateString);
    return "Invalid Date";
  }
};

const BillingPage: React.FC = () => {
  const { userProfile, loading } = useAuth();

  const subscription = userProfile?.subscription;
  const rawPlan = subscription?.plan || "free";
  const currentPlan = formatPlanName(rawPlan);
  const status = subscription?.status || "active";
  const isPaidPlan = currentPlan !== "Free";
  const expirationDate = formatDate(subscription?.expirationDate);
  const subscriptionStartDate = formatDate(subscription?.startDate);
  const paymentCurrency = subscription?.paymentCurrency || "USD";
  const paymentAmount =
    typeof subscription?.paymentAmount === "number"
      ? subscription.paymentAmount
      : Number(subscription?.paymentAmount);
  const paymentCurrencyLabel = getCurrencyMeta(paymentCurrency).label;
  const billingAmount =
    Number.isFinite(paymentAmount)
      ? formatCurrencyAmount(paymentAmount, paymentCurrency)
      : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const billingPortalUrl = (userProfile as any)?.billingPortalUrl as string | undefined;

  const getStatusBadge = (subscriptionStatus: string) => {
    const normalizedStatus = subscriptionStatus.toLowerCase();
    let color = "bg-gray-200 text-gray-700";
    let icon = <Clock className="w-4 h-4 mr-1" />;

    if (normalizedStatus === "active") {
      color = "bg-emerald-100 text-emerald-700";
      icon = <CheckCircle className="w-4 h-4 mr-1" />;
    } else if (
      normalizedStatus === "inactive" ||
      normalizedStatus === "expired" ||
      normalizedStatus === "cancelled"
    ) {
      color = "bg-red-100 text-red-700";
      icon = <Zap className="w-4 h-4 mr-1" />;
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${color}`}>
        {icon}
        {formatPlanName(subscriptionStatus)}
      </span>
    );
  };

  const handleCancelSubscription = async () => {
    if (status.toLowerCase() === "cancelled") {
      alert("Your subscription is already scheduled for cancellation.");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? You will retain access until the expiration date."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/payment/cancel-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          alert("Subscription successfully scheduled for cancellation.");
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert(`Cancellation failed: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error during cancellation:", error);
        alert("An error occurred while attempting to cancel.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px] text-indigo-600">
        <Zap className="w-6 h-6 animate-spin" />
        <p className="ml-2">Loading billing information...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-20 mt-12 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-indigo-600" />
            Billing & Subscription
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your current plan, view billing details, and change subscriptions.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-xl border border-indigo-100 p-6 sm:p-8 mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-indigo-700">{currentPlan} Plan</h2>
            {getStatusBadge(status)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Plan Status</p>
              <p className="text-lg font-semibold text-gray-900">{formatPlanName(status)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Next Billing/Expiration Date</p>
              <p className="text-lg font-semibold text-gray-900">{expirationDate}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            {isPaidPlan ? (
              <>
                <a
                  href={billingPortalUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow ${
                    !billingPortalUrl ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={(event) => {
                    if (!billingPortalUrl) {
                      event.preventDefault();
                      alert("Billing portal URL is not available. Please contact support.");
                    }
                  }}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Manage Payment Method
                </a>
                <button
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border border-red-300 text-red-600 transition ${
                    status.toLowerCase() === "cancelled"
                      ? "bg-red-50 cursor-not-allowed opacity-70"
                      : "hover:bg-red-50"
                  }`}
                  onClick={handleCancelSubscription}
                  disabled={status.toLowerCase() === "cancelled"}
                >
                  {status.toLowerCase() === "cancelled"
                    ? "Cancellation Scheduled"
                    : "Cancel Subscription"}
                </button>
              </>
            ) : (
              <Link
                to="/subscribe"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Your Plan
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
            <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
            Billing History
          </h2>

          <div className="space-y-3">
            {isPaidPlan ? (
              <div className="border border-gray-200 rounded-lg p-3 text-sm text-gray-700 flex justify-between items-center gap-4">
                <div>
                  <span>Plan activated on {subscriptionStartDate}</span>
                  <p className="text-xs text-gray-500 mt-1">Charged in {paymentCurrencyLabel}</p>
                </div>
                <span className="font-semibold text-indigo-600">{billingAmount || paymentCurrency}</span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                You are currently on the Free plan. No billing history available.
              </p>
            )}
          </div>

          <button
            onClick={() => alert("Feature coming soon! Contact support for past invoices.")}
            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
          >
            View all invoices (Placeholder)
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BillingPage;
