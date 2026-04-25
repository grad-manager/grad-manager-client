import React, { useEffect, useState } from "react";
import type { ScholarshipRecord } from "../types/Scholarship";
import {
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaSearch,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

const PAGE_SIZE = 12;
const detailHeadingClass =
  "text-xs font-bold uppercase tracking-[0.18em] text-emerald-700";

const truncateText = (value: string, maxLength: number) => {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
};

const ScholarshipCatalog: React.FC = () => {
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [expandedScholarship, setExpandedScholarship] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const loadScholarships = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/scholarships.json");
        if (!response.ok) {
          throw new Error(`Failed to load scholarships (${response.status})`);
        }

        const data = (await response.json()) as ScholarshipRecord[];
        if (isMounted) {
          setScholarships(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        console.error("Failed to load scholarship catalog:", fetchError);
        if (isMounted) {
          setError("Failed to load scholarships. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadScholarships();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = activeSearchQuery.trim().toLowerCase();
  const filteredScholarships = scholarships.filter((scholarship) => {
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      scholarship.title,
      scholarship.provider,
      scholarship.overview,
      scholarship.countries,
      scholarship.eligibleApplicants,
      scholarship.level,
      scholarship.institutions,
      scholarship.fundingDetails,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const totalPages = Math.max(1, Math.ceil(filteredScholarships.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedScholarships = filteredScholarships.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="rounded-3xl border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_34%),linear-gradient(135deg,#f7fffb_0%,#ecfdf5_42%,#eff6ff_100%)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-800">
                Scholarship Catalog
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Browse scholarships separately from the main program database
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
                This view is powered by your uploaded spreadsheet and keeps scholarships in
                their own searchable catalog so they do not get mixed into the regular
                university program list.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-full border border-emerald-100 bg-white px-4 py-2 font-semibold text-slate-800 shadow-sm">
                {scholarships.length} scholarships loaded
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search scholarships by name, provider, country, level, or institution..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || !searchInput.trim()}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-gray-400"
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Search"}
            </button>

            {activeSearchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                disabled={loading}
                className="flex items-center justify-center rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:bg-gray-400"
                aria-label="Clear scholarship search"
              >
                <FaTimesCircle />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-slate-500">
            <div className="flex items-center gap-3 text-lg font-medium">
              <FaSpinner className="animate-spin text-emerald-600" />
              Loading scholarships...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-900 px-3 py-1.5 font-bold text-white">
                  {paginatedScholarships.length} shown
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800">
                  {filteredScholarships.length} total matches
                </span>
                {activeSearchQuery && (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-800">
                    Search: "{activeSearchQuery}"
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-2 md:self-auto">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Page
                </span>
                <span className="text-base font-black text-slate-900">{safeCurrentPage}</span>
                <span className="text-sm font-semibold text-slate-400">/</span>
                <span className="text-sm font-semibold text-slate-600">{totalPages}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedScholarships.map((scholarship) => {
                const isExpanded = expandedScholarship === scholarship.id;
                const primaryLink = scholarship.applicationLinks[0] || scholarship.sourceLinks[0];

                return (
                  <article
                    key={scholarship.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div>
                        <h3 className="text-2xl font-black leading-tight text-slate-950">
                          {scholarship.title}
                        </h3>
                        {scholarship.provider && (
                          <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                            {scholarship.provider}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {scholarship.countries && (
                        <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                          <span className="font-bold text-slate-900">Host:</span>{" "}
                          {truncateText(scholarship.countries, 120)}
                        </p>
                      )}
                      {scholarship.level && (
                        <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                          <span className="font-bold text-slate-900">Level:</span>{" "}
                          {scholarship.level}
                        </p>
                      )}
                      {scholarship.eligibleApplicants && (
                        <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                          <span className="font-bold text-slate-900">Eligible:</span>{" "}
                          {truncateText(scholarship.eligibleApplicants, 120)}
                        </p>
                      )}
                    </div>

                    {scholarship.overview && (
                      <p className="mt-5 text-[15px] leading-7 text-slate-800">
                        {truncateText(scholarship.overview, 210)}
                      </p>
                    )}

                    {scholarship.fundingDetails && (
                      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <p className={detailHeadingClass}>
                          Funding
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-800">
                          {truncateText(scholarship.fundingDetails, 180)}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedScholarship(isExpanded ? null : scholarship.id)
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>

                      {primaryLink && (
                        <a
                          href={primaryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <FaExternalLinkAlt />
                          Open Application
                        </a>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-5 space-y-5 border-t border-slate-200 pt-5 text-sm text-slate-700">
                        {scholarship.institutions && (
                          <section>
                            <p className={detailHeadingClass}>Institutions and Programs</p>
                            <p className="mt-2 whitespace-pre-line leading-7 text-slate-800">
                              {scholarship.institutions}
                            </p>
                          </section>
                        )}

                        {scholarship.requirements && (
                          <section>
                            <p className={detailHeadingClass}>Requirements</p>
                            <p className="mt-2 whitespace-pre-line leading-7 text-slate-800">
                              {scholarship.requirements}
                            </p>
                          </section>
                        )}

                        {scholarship.applicationCycle && (
                          <section>
                            <p className={detailHeadingClass}>Application Cycle</p>
                            <p className="mt-2 whitespace-pre-line leading-7 text-slate-800">
                              {scholarship.applicationCycle}
                            </p>
                          </section>
                        )}

                        {scholarship.notes && (
                          <section>
                            <p className={detailHeadingClass}>Notes</p>
                            <p className="mt-2 whitespace-pre-line leading-7 text-slate-800">
                              {scholarship.notes}
                            </p>
                          </section>
                        )}

                        {scholarship.sourceLinks.length > 0 && (
                          <section>
                            <p className={detailHeadingClass}>Sources</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {scholarship.sourceLinks.map((link) => (
                                <a
                                  key={link}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                                >
                                  <FaExternalLinkAlt />
                                  Source
                                </a>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {filteredScholarships.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600">
                No scholarships matched your search.
              </div>
            )}

            {filteredScholarships.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex min-w-[92px] items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm">
                  {safeCurrentPage} of {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ScholarshipCatalog;
