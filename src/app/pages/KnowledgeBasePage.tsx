import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  FileText,
  UserCircle,
  Search,
  Grid3X3,
  List,
  Bookmark,
  Share2,
  Check,
  ChevronDown,
  Eye,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  Scale,
  Briefcase,
  ShieldCheck,
  Cpu,
  ExternalLink,
  BarChart3,
  Star,
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

const COLORS = {
  bg: "#0C1525",
  card: "#111D30",
  accent: "#2563EB",
  text: "#E8EFF8",
  muted: "#64748B",
  border: "#1E2D45",
  cardHover: "#162035",
};

const CAT_META: Record<string, { color: string; icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  HR: { color: "#10B981", icon: Users },
  Finance: { color: "#F59E0B", icon: TrendingUp },
  Legal: { color: "#F97316", icon: Scale },
  Operations: { color: "#06B6D4", icon: Briefcase },
  Compliance: { color: "#8B5CF6", icon: ShieldCheck },
  Technology: { color: "#2563EB", icon: Cpu },
};

const ALL_TAGS = [
  "Leave Policy", "Benefits", "Reimbursement", "SOC 2", "GDPR", "Data Retention",
  "Contracts", "Payroll", "Onboarding", "Security", "Remote Work", "Procurement",
];

interface Doc {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  views: number;
  readTime: number;
  pages: number;
  updatedAt: string;
  author: string;
  authorInitials: string;
  featured: boolean;
}

const DOCUMENTS: Doc[] = [
  {
    id: "1", title: "Employee Handbook 2026", description: "Comprehensive guide covering all company policies, code of conduct, benefits overview, and employee rights applicable to all staff globally.",
    category: "HR", tags: ["Onboarding", "Leave Policy", "Benefits"], views: 3241, readTime: 45, pages: 88, updatedAt: "2026-01-15", author: "People Ops", authorInitials: "PO", featured: true,
  },
  {
    id: "2", title: "Leave & Absence Policy v3.1", description: "Detailed leave entitlements including annual, sick, parental and special leave. Covers request procedures and manager approval workflows.",
    category: "HR", tags: ["Leave Policy", "Benefits"], views: 2180, readTime: 18, pages: 24, updatedAt: "2026-02-20", author: "HR Team", authorInitials: "HT", featured: false,
  },
  {
    id: "3", title: "Benefits Guide APAC", description: "Region-specific benefits information for employees based in Singapore, Malaysia, Indonesia, and other APAC offices including medical and dental coverage.",
    category: "HR", tags: ["Benefits", "Leave Policy"], views: 1540, readTime: 22, pages: 31, updatedAt: "2026-01-30", author: "HR APAC", authorInitials: "HA", featured: false,
  },
  {
    id: "4", title: "Expense Reimbursement Policy", description: "Full reimbursement guidelines covering travel, meals, equipment and professional development. Includes approval thresholds and submission deadlines.",
    category: "Finance", tags: ["Reimbursement"], views: 2890, readTime: 15, pages: 19, updatedAt: "2026-03-01", author: "Finance Ops", authorInitials: "FO", featured: true,
  },
  {
    id: "5", title: "Q1 2026 Financial Procedures", description: "Quarter-end close procedures, reporting templates, intercompany reconciliation steps and timeline for Q1 financial operations.",
    category: "Finance", tags: ["Payroll"], views: 980, readTime: 28, pages: 42, updatedAt: "2026-03-15", author: "Controller", authorInitials: "CT", featured: false,
  },
  {
    id: "6", title: "Procurement Policy 2026", description: "Vendor selection criteria, purchasing authority levels, contract requirements and approval workflows for procurement activities.",
    category: "Finance", tags: ["Procurement", "Contracts"], views: 760, readTime: 20, pages: 28, updatedAt: "2026-02-10", author: "Finance Ops", authorInitials: "FO", featured: false,
  },
  {
    id: "7", title: "Master Services Agreement Template", description: "Standard MSA template with all required legal provisions, liability caps, IP ownership clauses and termination conditions.",
    category: "Legal", tags: ["Contracts"], views: 1320, readTime: 35, pages: 52, updatedAt: "2026-01-08", author: "Legal Team", authorInitials: "LT", featured: false,
  },
  {
    id: "8", title: "Data Processing Agreement v2", description: "DPA template compliant with GDPR and CCPA requirements covering controller-processor obligations and data subject rights.",
    category: "Legal", tags: ["GDPR", "Data Retention", "Contracts"], views: 890, readTime: 30, pages: 44, updatedAt: "2025-12-01", author: "Privacy Counsel", authorInitials: "PC", featured: true,
  },
  {
    id: "9", title: "Remote Work Policy v2.0", description: "Guidelines for hybrid and fully remote employees covering equipment provisioning, connectivity allowances and performance expectations.",
    category: "Operations", tags: ["Remote Work"], views: 2540, readTime: 12, pages: 16, updatedAt: "2026-02-28", author: "Ops Team", authorInitials: "OT", featured: false,
  },
  {
    id: "10", title: "Business Continuity Plan", description: "BCP covering critical systems recovery, communication protocols, alternate work arrangements and incident escalation procedures.",
    category: "Operations", tags: ["Security"], views: 420, readTime: 40, pages: 67, updatedAt: "2025-11-20", author: "Risk & Ops", authorInitials: "RO", featured: false,
  },
  {
    id: "11", title: "SOC 2 Type II Audit Report", description: "Annual SOC 2 Type II audit findings covering Security, Availability and Confidentiality trust service criteria. Board-level distribution.",
    category: "Compliance", tags: ["SOC 2", "Security"], views: 540, readTime: 60, pages: 96, updatedAt: "2026-03-10", author: "Compliance", authorInitials: "CO", featured: true,
  },
  {
    id: "12", title: "Data Retention Framework", description: "Enterprise-wide data retention schedules, disposal procedures, legal hold processes and records management responsibilities.",
    category: "Compliance", tags: ["Data Retention", "GDPR"], views: 710, readTime: 25, pages: 38, updatedAt: "2026-01-22", author: "Compliance", authorInitials: "CO", featured: false,
  },
  {
    id: "13", title: "GDPR Compliance Handbook", description: "Practical handbook for employees on GDPR obligations, data subject request handling, breach notification and DPO contact procedures.",
    category: "Compliance", tags: ["GDPR", "Data Retention"], views: 1100, readTime: 32, pages: 50, updatedAt: "2026-02-14", author: "DPO Office", authorInitials: "DO", featured: false,
  },
  {
    id: "14", title: "Information Security Policy", description: "Core security policy covering access control, endpoint protection, incident response and acceptable use standards for all employees.",
    category: "Technology", tags: ["Security", "SOC 2"], views: 1680, readTime: 22, pages: 33, updatedAt: "2026-03-05", author: "CISO Office", authorInitials: "CI", featured: false,
  },
  {
    id: "15", title: "Cloud Infrastructure Standards", description: "AWS and Azure architecture standards, tagging requirements, cost governance rules and approved service catalog for engineering teams.",
    category: "Technology", tags: ["Security"], views: 620, readTime: 18, pages: 27, updatedAt: "2026-02-01", author: "Platform Eng", authorInitials: "PE", featured: false,
  },
  {
    id: "16", title: "Software Development Lifecycle", description: "SDLC policy covering code review requirements, release gates, testing standards and deployment approval workflows.",
    category: "Technology", tags: ["Security"], views: 840, readTime: 28, pages: 41, updatedAt: "2026-01-18", author: "Engineering", authorInitials: "EN", featured: false,
  },
];

type SortOption = "relevance" | "newest" | "oldest" | "az" | "views";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A → Z" },
  { value: "views", label: "Most Viewed" },
];

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(["1", "4", "11"]);
  const [sharedId, setSharedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    DOCUMENTS.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, []);

  const filtered = useMemo(() => {
    let docs = DOCUMENTS;
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    if (activeCategory !== "All") docs = docs.filter((d) => d.category === activeCategory);
    if (activeTag) docs = docs.filter((d) => d.tags.includes(activeTag));
    if (bookmarkedOnly) docs = docs.filter((d) => bookmarks.includes(d.id));
    switch (sort) {
      case "newest": docs = [...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); break;
      case "oldest": docs = [...docs].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)); break;
      case "az": docs = [...docs].sort((a, b) => a.title.localeCompare(b.title)); break;
      case "views": docs = [...docs].sort((a, b) => b.views - a.views); break;
    }
    return docs;
  }, [search, activeCategory, activeTag, sort, bookmarkedOnly, bookmarks]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleShare = (id: string) => {
    setSharedId(id);
    setTimeout(() => setSharedId(null), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2D45; border-radius: 3px; }
      `}</style>

      <EKIPSidebar items={NAV} settingsPath="/settings" onLogout={handleLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, #0F1E35 0%, #111D30 60%, #0E1A2E 100%)`,
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "28px 28px 20px",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Radial glows */}
          <div style={{ position: "absolute", top: -60, right: 80, width: 300, height: 300, borderRadius: "50%", background: `${COLORS.accent}0A`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "#8B5CF60A", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Enterprise Knowledge Portal</h1>
                <p style={{ fontSize: 14, color: COLORS.muted, margin: "4px 0 0" }}>
                  16 verified documents across 6 domains
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setBookmarkedOnly((p) => !p)}
                  style={{
                    background: bookmarkedOnly ? `${COLORS.accent}22` : "transparent",
                    border: `1px solid ${bookmarkedOnly ? COLORS.accent : COLORS.border}`,
                    borderRadius: 8,
                    padding: "8px 14px",
                    color: bookmarkedOnly ? COLORS.accent : COLORS.muted,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontFamily: "inherit",
                    fontWeight: 600,
                  }}
                >
                  <Bookmark size={14} fill={bookmarkedOnly ? COLORS.accent : "none"} />
                  Bookmarked
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    background: viewMode === "grid" ? `${COLORS.accent}22` : "transparent",
                    border: `1px solid ${viewMode === "grid" ? COLORS.accent : COLORS.border}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: viewMode === "grid" ? COLORS.accent : COLORS.muted,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Grid3X3 size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    background: viewMode === "list" ? `${COLORS.accent}22` : "transparent",
                    border: `1px solid ${viewMode === "list" ? COLORS.accent : COLORS.border}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: viewMode === "list" ? COLORS.accent : COLORS.muted,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* Search + sort row */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search size={16} color={COLORS.muted} style={{ position: "absolute", left: 14 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents by title, description, or tag…"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "11px 14px 11px 42px",
                    color: COLORS.text,
                    fontSize: 14,
                    fontFamily: "inherit",
                  }}
                />
                {search && (
                  <span style={{ position: "absolute", right: 12, fontSize: 12, color: COLORS.muted }}>
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setSortOpen((p) => !p)}
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: COLORS.text,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  {SORT_OPTIONS.find((s) => s.value === sort)?.label}
                  <ChevronDown size={14} />
                </button>
                {sortOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      background: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 10,
                      overflow: "hidden",
                      zIndex: 100,
                      minWidth: 160,
                      boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                        style={{
                          width: "100%",
                          background: sort === opt.value ? `${COLORS.accent}18` : "transparent",
                          border: "none",
                          padding: "10px 16px",
                          color: sort === opt.value ? COLORS.accent : COLORS.text,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 13,
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        {opt.label}
                        {sort === opt.value && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tag bar */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => setActiveTag(null)}
                style={{
                  background: !activeTag ? COLORS.accent : "transparent",
                  border: `1px solid ${!activeTag ? COLORS.accent : COLORS.border}`,
                  borderRadius: 20,
                  padding: "4px 12px",
                  color: !activeTag ? "white" : COLORS.muted,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                All Tags
              </button>
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  style={{
                    background: activeTag === tag ? `${COLORS.accent}22` : "transparent",
                    border: `1px solid ${activeTag === tag ? COLORS.accent : COLORS.border}`,
                    borderRadius: 20,
                    padding: "4px 12px",
                    color: activeTag === tag ? COLORS.accent : COLORS.muted,
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "inherit",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left category sidebar */}
          <div
            style={{
              width: 240,
              background: COLORS.card,
              borderRight: `1px solid ${COLORS.border}`,
              overflowY: "auto",
              flexShrink: 0,
              padding: "16px 0",
            }}
          >
            <div style={{ padding: "0 12px", marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Categories
              </div>
              <button
                onClick={() => setActiveCategory("All")}
                style={{
                  width: "100%",
                  background: activeCategory === "All" ? `${COLORS.accent}18` : "transparent",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: activeCategory === "All" ? COLORS.accent : COLORS.text,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BookOpen size={15} />
                  All Documents
                </span>
                <span style={{ fontSize: 11, background: COLORS.border, borderRadius: 10, padding: "1px 7px" }}>
                  {DOCUMENTS.length}
                </span>
              </button>
            </div>

            {categories.map(({ name, count }) => {
              const meta = CAT_META[name];
              const Icon = meta.icon;
              const isActive = activeCategory === name;
              return (
                <div key={name} style={{ padding: "0 12px", marginBottom: 2 }}>
                  <button
                    onClick={() => setActiveCategory(isActive ? "All" : name)}
                    style={{
                      width: "100%",
                      background: isActive ? `${meta.color}18` : "transparent",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 12px",
                      color: isActive ? meta.color : COLORS.text,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={15} color={isActive ? meta.color : COLORS.muted} />
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        background: isActive ? `${meta.color}22` : COLORS.border,
                        color: isActive ? meta.color : COLORS.muted,
                        borderRadius: 10,
                        padding: "1px 7px",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                </div>
              );
            })}

            <div style={{ height: 1, background: COLORS.border, margin: "16px 12px" }} />
            <div style={{ padding: "0 12px", marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Library
              </div>
              {[
                { label: "My Bookmarks", count: bookmarks.length, icon: Bookmark },
                { label: "Trending", count: 5, icon: TrendingUp },
              ].map(({ label, count, icon: Icon }) => {
                const isActive = (label === "My Bookmarks" && bookmarkedOnly) || (label === "Trending" && sort === "views" && !bookmarkedOnly);
                return (
                  <button
                    key={label}
                    onClick={() => {
                      if (label === "My Bookmarks") {
                        setBookmarkedOnly(!bookmarkedOnly);
                        setActiveCategory("All");
                      } else if (label === "Trending") {
                        setSort("views");
                        setBookmarkedOnly(false);
                        setActiveCategory("All");
                      }
                    }}
                    style={{
                      width: "100%",
                      background: isActive ? `${COLORS.accent}18` : "transparent",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 12px",
                      color: isActive ? COLORS.accent : COLORS.muted,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 13,
                      fontFamily: "inherit",
                      textAlign: "left",
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={15} color={isActive ? COLORS.accent : COLORS.muted} />
                      {label}
                    </span>
                    <span style={{ fontSize: 11, background: isActive ? `${COLORS.accent}22` : COLORS.border, color: isActive ? COLORS.accent : COLORS.muted, borderRadius: 10, padding: "1px 7px" }}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ height: 1, background: COLORS.border, margin: "16px 12px" }} />
            <div style={{ padding: "0 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                KB Stats
              </div>
              {[
                { label: "Total Views", value: "24.8k", icon: Eye },
                { label: "Avg Read Time", value: "13 min", icon: Clock },
                { label: "Last Indexed", value: "2h ago", icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
                    <Icon size={13} />
                    {label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document grid/list */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }} onClick={() => sortOpen && setSortOpen(false)}>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: COLORS.muted }}>
                Showing <strong style={{ color: COLORS.text }}>{filtered.length}</strong> document{filtered.length !== 1 ? "s" : ""}
                {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
              </span>
            </div>

            {viewMode === "grid" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 18,
                }}
              >
                {filtered.map((doc) => {
                  const meta = CAT_META[doc.category];
                  const Icon = meta.icon;
                  const isBookmarked = bookmarks.includes(doc.id);
                  const isShared = sharedId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      style={{
                        background: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 14,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = meta.color + "60";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${meta.color}12`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.border;
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                      }}
                    >
                      {/* Colored header band */}
                      <div
                        style={{
                          height: 6,
                          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
                        }}
                      />
                      <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 9,
                                background: `${meta.color}18`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon size={17} color={meta.color} />
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                background: `${meta.color}18`,
                                color: meta.color,
                                borderRadius: 6,
                                padding: "3px 8px",
                              }}
                            >
                              {doc.category}
                            </span>
                            {doc.featured && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: "#F59E0B18",
                                  color: "#F59E0B",
                                  borderRadius: 6,
                                  padding: "3px 7px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                <Star size={9} fill="#F59E0B" /> Featured
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            lineHeight: 1.4,
                            marginBottom: 8,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const,
                            overflow: "hidden",
                          }}
                        >
                          {doc.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: COLORS.muted,
                            lineHeight: 1.6,
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical" as const,
                            overflow: "hidden",
                            marginBottom: 12,
                          }}
                        >
                          {doc.description}
                        </div>

                        {/* Tags */}
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                          {doc.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                              style={{
                                fontSize: 10,
                                background: COLORS.bg,
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: 4,
                                padding: "2px 7px",
                                color: COLORS.muted,
                                cursor: "pointer",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            fontSize: 11,
                            color: COLORS.muted,
                            paddingTop: 10,
                            borderTop: `1px solid ${COLORS.border}`,
                            marginBottom: 12,
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={11} />{doc.views.toLocaleString()}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{doc.readTime}m</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={11} />{doc.pages}p</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{new Date(doc.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        </div>

                        {/* Footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${meta.color}66, ${meta.color}33)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                color: meta.color,
                              }}
                            >
                              {doc.authorInitials}
                            </div>
                            <span style={{ fontSize: 12, color: COLORS.muted }}>{doc.author}</span>
                          </div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button
                              onClick={() => toggleBookmark(doc.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: isBookmarked ? "#F59E0B" : COLORS.muted,
                                cursor: "pointer",
                                padding: 4,
                                display: "flex",
                              }}
                            >
                              <Bookmark size={14} fill={isBookmarked ? "#F59E0B" : "none"} />
                            </button>
                            <button
                              onClick={() => handleShare(doc.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: isShared ? "#10B981" : COLORS.muted,
                                cursor: "pointer",
                                padding: 4,
                                display: "flex",
                              }}
                            >
                              {isShared ? <Check size={14} /> : <Share2 size={14} />}
                            </button>
                            <button
                              style={{
                                background: COLORS.accent,
                                border: "none",
                                borderRadius: 7,
                                padding: "5px 10px",
                                color: "white",
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontFamily: "inherit",
                              }}
                            >
                              <ExternalLink size={10} />
                              Open
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((doc) => {
                  const meta = CAT_META[doc.category];
                  const Icon = meta.icon;
                  const isBookmarked = bookmarks.includes(doc.id);
                  const isShared = sharedId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      style={{
                        background: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 12,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: `${meta.color}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} color={meta.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.title}</span>
                          {doc.featured && <Star size={12} color="#F59E0B" fill="#F59E0B" />}
                          <span style={{ fontSize: 11, fontWeight: 600, background: `${meta.color}18`, color: meta.color, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>{doc.category}</span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.description}</div>
                      </div>
                      <div style={{ display: "flex", gap: 14, fontSize: 12, color: COLORS.muted, flexShrink: 0 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={12} />{doc.views.toLocaleString()}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{doc.readTime}m</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={12} />{doc.pages}p</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => toggleBookmark(doc.id)} style={{ background: "transparent", border: "none", color: isBookmarked ? "#F59E0B" : COLORS.muted, cursor: "pointer", padding: 4, display: "flex" }}>
                          <Bookmark size={15} fill={isBookmarked ? "#F59E0B" : "none"} />
                        </button>
                        <button onClick={() => handleShare(doc.id)} style={{ background: "transparent", border: "none", color: isShared ? "#10B981" : COLORS.muted, cursor: "pointer", padding: 4, display: "flex" }}>
                          {isShared ? <Check size={15} /> : <Share2 size={15} />}
                        </button>
                        <button style={{ background: COLORS.accent, border: "none", borderRadius: 7, padding: "6px 12px", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Open
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 20px", color: COLORS.muted }}>
                <BookOpen size={48} color={COLORS.border} style={{ margin: "0 auto 16px", display: "block" }} />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No documents found</div>
                <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
