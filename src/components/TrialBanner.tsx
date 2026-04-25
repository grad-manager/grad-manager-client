import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEffectivePlanLower, isTrialActive } from '../utils/trial';

interface TrialBannerProps {
    userProfile?: {
        trial?: { startDate?: string; endDate?: string };
        subscription?: { plan?: string };
    } | null;
    className?: string;
}

const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getDaysLeft = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate).getTime();
    if (Number.isNaN(end)) return null;
    const diffMs = end - Date.now();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
};

const getCountdownParts = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate).getTime();
    if (Number.isNaN(end)) return null;

    const diffMs = Math.max(0, end - Date.now());
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        days,
        hours,
        minutes,
        seconds,
        isEndingSoon: diffMs <= 24 * 60 * 60 * 1000,
    };
};

const pad = (value: number) => String(value).padStart(2, '0');

const TrialBanner: React.FC<TrialBannerProps> = ({ userProfile, className }) => {
    const trial = userProfile?.trial;
    const [tick, setTick] = useState(0);

    const active = isTrialActive(trial);
    const basePlan = getEffectivePlanLower(userProfile, { excludeTrial: true });
    const endDate = trial?.endDate;
    const daysLeft = useMemo(() => getDaysLeft(endDate), [endDate, tick]);
    const countdown = useMemo(() => getCountdownParts(endDate), [endDate, tick]);

    useEffect(() => {
        if (!endDate) return;
        const endMs = new Date(endDate).getTime();
        if (Number.isNaN(endMs)) return;
        const msUntilEnd = endMs - Date.now();
        if (msUntilEnd <= 0) return;
        const interval = setInterval(() => setTick((v) => v + 1), 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    if (!active || basePlan !== 'free') return null;

    return (
        <div className={`w-full mb-6 ${className || ''}`}>
            <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white shadow-xl">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_55%)]" />
                <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="text-lg sm:text-xl font-extrabold tracking-wide">
                            3-Day Trial Active
                        </div>
                        <div className="text-sm sm:text-base font-semibold text-white/90">
                            Ends on <span className="font-bold">{formatDate(endDate)}</span>
                            {typeof daysLeft === 'number' && (
                                <span className="ml-2 text-white/80">({daysLeft} day{daysLeft === 1 ? '' : 's'} left)</span>
                            )}
                        </div>
                        {countdown && (
                            <div className="mt-2 inline-flex flex-wrap items-center gap-2">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                                    Trial Ends In
                                </span>
                                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm font-extrabold shadow-lg ${
                                    countdown.isEndingSoon
                                        ? 'bg-amber-300 text-amber-950'
                                        : 'bg-white/15 text-white'
                                }`}>
                                    <span>{countdown.days}d</span>
                                    <span>{pad(countdown.hours)}h</span>
                                    <span>{pad(countdown.minutes)}m</span>
                                    <span>{pad(countdown.seconds)}s</span>
                                </div>
                            </div>
                        )}
                        <div className="text-xs sm:text-sm text-white/90">
                            Full platform access is unlocked during your trial. Subscribe before it ends to avoid interruption.
                        </div>
                    </div>
                    <Link
                        to="/subscribe"
                        className="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-xs sm:text-sm font-bold text-indigo-700 shadow hover:bg-white transition"
                    >
                        View Plans
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TrialBanner;


