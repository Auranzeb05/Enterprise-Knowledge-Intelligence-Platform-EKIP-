import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router";

import {
  Brain,
  FileText,
  LayoutDashboard,
  Search,
  Download,
  UserCircle,
  BarChart2,
  ClipboardList,
  Users,
  Loader2,
  Building2,
  Layers3,
  BookOpen,
  X,
} from "lucide-react";

import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";

import { useAuth } from "../context/AuthContext";

import { supabase } from "../../lib/supabase";

interface KnowledgeDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;

  department?: {
    id: string;
    name: string;
  } | null;

  uploadedBy?: {
    id: string;
    fullName: string;
    email: string;
  };

  _count?: {
    chunks: number;
  };
}

interface SemanticResult {
  chunkId: string;
  content: string;
  chunkIndex: number;

  documentId: string;
  title: string;
  fileName: string;

  departmentId: string | null;

  similarity: number;
}

function formatFileSize(bytes: number) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export default function KnowledgeBasePage() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const role =
    user?.role || "employee";

  const [documents, setDocuments] =
    useState<KnowledgeDocument[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    semanticResults,
    setSemanticResults,
  ] = useState<SemanticResult[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState("all");

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000";

  const navItems =
    useMemo<SidebarNavItem[]>(() => {
      if (role === "admin") {
        return [
          {
            path: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            path: "/users",
            label: "User Management",
            icon: Users,
          },
          {
            path: "/knowledge",
            label: "Knowledge Base",
            icon: BookOpen,
          },
          {
            path: "/documents",
            label: "Document Management",
            icon: FileText,
          },
          {
            path: "/analytics",
            label: "Analytics",
            icon: BarChart2,
          },
          {
            path: "/audit",
            label: "Audit Logs",
            icon: ClipboardList,
          },
          {
            path: "/ai-monitoring",
            label: "AI Monitoring",
            icon: Brain,
          },
          {
            path: "/admin-profile",
            label: "Profile",
            icon: UserCircle,
          },
        ];
      }

      if (role === "manager") {
        return [
          {
            path: "/manager",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            path: "/ai-chat",
            label: "AI Chat",
            icon: Brain,
          },
          {
            path: "/knowledge",
            label: "Knowledge Base",
            icon: BookOpen,
          },
          {
            path: "/documents",
            label: "Documents",
            icon: FileText,
          },
          {
            path: "/analytics",
            label: "Analytics",
            icon: BarChart2,
          },
          {
            path: "/manager-profile",
            label: "Profile",
            icon: UserCircle,
          },
        ];
      }

      return [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          path: "/ai-chat",
          label: "AI Chat",
          icon: Brain,
        },
        {
          path: "/knowledge",
          label: "Knowledge Base",
          icon: BookOpen,
        },
        {
          path: "/documents",
          label: "Documents",
          icon: FileText,
        },
        {
          path: "/profile",
          label: "Profile",
          icon: UserCircle,
        },
      ];
    }, [role]);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function getAccessToken() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    return session?.access_token;
  }

  async function loadDocuments() {
    try {
      setLoading(true);

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "No authentication token found"
        );
      }

      const response = await fetch(
        `${API_URL}/api/documents`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not load documents"
        );
      }

      const data =
        await response.json();

      const list =
        Array.isArray(data)
          ? data
          : data.documents || [];

      setDocuments(list);
    } catch (error) {
      console.error(
        "Knowledge base loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSemanticSearch() {
    const query =
      searchTerm.trim();

    if (!query) {
      setSemanticResults([]);
      setSearchError("");
      return;
    }

    try {
      setSearching(true);
      setSearchError("");

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "No authentication token found"
        );
      }

      const response = await fetch(
        `${API_URL}/api/search?q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Semantic search failed"
        );
      }

      setSemanticResults(
        data?.results || []
      );
    } catch (error) {
      console.error(
        "Semantic search error:",
        error
      );

      setSemanticResults([]);

      setSearchError(
        error instanceof Error
          ? error.message
          : "Semantic search failed"
      );
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchTerm("");
    setSemanticResults([]);
    setSearchError("");
  }

  async function handleDownload(
    documentId: string
  ) {
    try {
      setDownloadingId(documentId);

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "No authentication token found"
        );
      }

      const response = await fetch(
        `${API_URL}/api/documents/${documentId}/download`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Download failed"
        );
      }

      const url =
        data?.url ||
        data?.signedUrl;

      if (!url) {
        throw new Error(
          "Download URL was not returned"
        );
      }

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "Document download error:",
        error
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const readyDocuments =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            document.status ===
            "ready"
        ),
      [documents]
    );

  const departments =
    useMemo(() => {
      const names =
        readyDocuments
          .map(
            (document) =>
              document.department?.name
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          );

      return Array.from(
        new Set(names)
      ).sort();
    }, [readyDocuments]);

  const filteredDocuments =
    useMemo(() => {
      return readyDocuments.filter(
        (document) => {
          const matchesDepartment =
            selectedDepartment ===
              "all" ||
            document.department?.name ===
              selectedDepartment;

          if (!matchesDepartment) {
            return false;
          }

          if (
            semanticResults.length > 0
          ) {
            return semanticResults.some(
              (result) =>
                result.documentId ===
                document.id
            );
          }

          if (!searchTerm.trim()) {
            return true;
          }

          const query =
            searchTerm
              .toLowerCase()
              .trim();

          const searchable = [
            document.title,
            document.fileName,
            document.department
              ?.name || "",
            document.uploadedBy
              ?.fullName || "",
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      readyDocuments,
      selectedDepartment,
      searchTerm,
      semanticResults,
    ]);

  const totalChunks =
    readyDocuments.reduce(
      (sum, document) =>
        sum +
        (document._count?.chunks ||
          0),
      0
    );

  const uniqueDepartments =
    new Set(
      readyDocuments
        .map(
          (document) =>
            document.department?.name
        )
        .filter(Boolean)
    ).size;

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "#0C1525",
        fontFamily:
          "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >
      <EKIPSidebar
        items={navItems}
        subtitle={
          role === "admin"
            ? "Admin"
            : role === "manager"
              ? "Manager"
              : "Employee"
        }
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0">
        <header
          className="px-8 py-5 flex items-center justify-between"
          style={{
            borderBottom:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <h1 className="text-xl font-bold text-white">
              Knowledge Base
            </h1>

            <p
              className="text-xs mt-1"
              style={{
                color: "#5F7490",
              }}
            >
              Search enterprise
              knowledge using semantic
              AI retrieval.
            </p>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background:
                "rgba(37,99,235,0.08)",
              border:
                "1px solid rgba(37,99,235,0.18)",
              color: "#60A5FA",
            }}
          >
            <Brain className="w-4 h-4" />

            Ollama Semantic Search
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
            <div
              className="rounded-xl p-5"
              style={{
                background: "#111D30",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "#5F7490",
                    }}
                  >
                    Ready Documents
                  </p>

                  <p className="text-2xl font-bold text-white mt-2">
                    {
                      readyDocuments.length
                    }
                  </p>
                </div>

                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "rgba(37,99,235,0.12)",
                  }}
                >
                  <FileText
                    className="w-5 h-5"
                    style={{
                      color: "#60A5FA",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-5"
              style={{
                background: "#111D30",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "#5F7490",
                    }}
                  >
                    Departments
                  </p>

                  <p className="text-2xl font-bold text-white mt-2">
                    {
                      uniqueDepartments
                    }
                  </p>
                </div>

                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "rgba(139,92,246,0.12)",
                  }}
                >
                  <Building2
                    className="w-5 h-5"
                    style={{
                      color: "#A78BFA",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-5"
              style={{
                background: "#111D30",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "#5F7490",
                    }}
                  >
                    Knowledge Chunks
                  </p>

                  <p className="text-2xl font-bold text-white mt-2">
                    {totalChunks}
                  </p>
                </div>

                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "rgba(34,197,94,0.12)",
                  }}
                >
                  <Layers3
                    className="w-5 h-5"
                    style={{
                      color: "#4ADE80",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-5 mb-6"
            style={{
              background: "#111D30",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{
                    color: "#5F7490",
                  }}
                />

                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(
                      event.target.value
                    );

                    if (
                      !event.target.value.trim()
                    ) {
                      setSemanticResults(
                        []
                      );
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      handleSemanticSearch();
                    }
                  }}
                  placeholder="Ask something like: What is the leave policy?"
                  className="w-full pl-11 pr-10 py-3 rounded-lg outline-none text-sm text-white"
                  style={{
                    background:
                      "#0C1525",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={
                      clearSearch
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: "#5F7490",
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={
                  selectedDepartment
                }
                onChange={(event) =>
                  setSelectedDepartment(
                    event.target.value
                  )
                }
                className="px-4 py-3 rounded-lg outline-none text-sm"
                style={{
                  background: "#0C1525",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  color: "#D7E2F0",
                }}
              >
                <option value="all">
                  All Departments
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={
                        department
                      }
                      value={
                        department
                      }
                    >
                      {department}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={
                  handleSemanticSearch
                }
                disabled={
                  searching ||
                  !searchTerm.trim()
                }
                className="px-5 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background:
                    "#2563EB",
                }}
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Semantic Search
                  </>
                )}
              </button>
            </div>

            {searchError && (
              <p
                className="text-xs mt-3"
                style={{
                  color: "#F87171",
                }}
              >
                {searchError}
              </p>
            )}
          </div>

          {semanticResults.length >
            0 && (
            <div
              className="rounded-xl p-5 mb-6"
              style={{
                background:
                  "rgba(37,99,235,0.06)",
                border:
                  "1px solid rgba(37,99,235,0.18)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain
                  className="w-4 h-4"
                  style={{
                    color: "#60A5FA",
                  }}
                />

                <h2 className="text-sm font-semibold text-white">
                  Semantic Results
                </h2>

                <span
                  className="text-xs"
                  style={{
                    color: "#5F7490",
                  }}
                >
                  {
                    semanticResults.length
                  }{" "}
                  relevant chunks
                </span>
              </div>

              <div className="space-y-3">
                {semanticResults.map(
                  (result) => (
                    <div
                      key={
                        result.chunkId
                      }
                      className="rounded-lg p-4"
                      style={{
                        background:
                          "#0C1525",
                        border:
                          "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {
                              result.title
                            }
                          </p>

                          <p
                            className="text-xs mt-1"
                            style={{
                              color:
                                "#5F7490",
                            }}
                          >
                            {
                              result.fileName
                            }{" "}
                            · Chunk{" "}
                            {
                              result.chunkIndex
                            }
                          </p>
                        </div>

                        <span
                          className="text-xs px-2 py-1 rounded-md whitespace-nowrap"
                          style={{
                            background:
                              "rgba(34,197,94,0.10)",
                            color:
                              "#4ADE80",
                          }}
                        >
                          {(
                            Number(
                              result.similarity
                            ) *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>

                      <p
                        className="text-sm leading-6 mt-3"
                        style={{
                          color:
                            "#A9B8CC",
                        }}
                      >
                        {result.content}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Documents
              </h2>

              <p
                className="text-xs mt-1"
                style={{
                  color: "#5F7490",
                }}
              >
                {
                  filteredDocuments.length
                }{" "}
                document
                {filteredDocuments.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          {loading ? (
            <div
              className="rounded-xl p-12 flex items-center justify-center"
              style={{
                background: "#111D30",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Loader2
                className="w-6 h-6 animate-spin"
                style={{
                  color: "#60A5FA",
                }}
              />
            </div>
          ) : filteredDocuments.length ===
            0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                background: "#111D30",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <BookOpen
                className="w-10 h-10 mx-auto mb-3"
                style={{
                  color: "#3D5A78",
                }}
              />

              <p className="text-sm font-semibold text-white">
                No knowledge
                documents found
              </p>

              <p
                className="text-xs mt-2"
                style={{
                  color: "#5F7490",
                }}
              >
                Try another search
                or department.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredDocuments.map(
                (document) => (
                  <div
                    key={document.id}
                    className="rounded-xl p-5"
                    style={{
                      background:
                        "#111D30",
                      border:
                        "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "rgba(37,99,235,0.12)",
                        }}
                      >
                        <FileText
                          className="w-5 h-5"
                          style={{
                            color:
                              "#60A5FA",
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {
                            document.title
                          }
                        </h3>

                        <p
                          className="text-xs mt-1 truncate"
                          style={{
                            color:
                              "#5F7490",
                          }}
                        >
                          {
                            document.fileName
                          }
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span
                            className="text-[11px] px-2 py-1 rounded-md"
                            style={{
                              background:
                                "rgba(255,255,255,0.05)",
                              color:
                                "#8EA1BA",
                            }}
                          >
                            {formatFileSize(
                              document.fileSize
                            )}
                          </span>

                          <span
                            className="text-[11px] px-2 py-1 rounded-md"
                            style={{
                              background:
                                "rgba(139,92,246,0.10)",
                              color:
                                "#A78BFA",
                            }}
                          >
                            {document
                              .department
                              ?.name ||
                              "General"}
                          </span>

                          <span
                            className="text-[11px] px-2 py-1 rounded-md"
                            style={{
                              background:
                                "rgba(34,197,94,0.10)",
                              color:
                                "#4ADE80",
                            }}
                          >
                            {
                              document
                                ._count
                                ?.chunks ||
                              0
                            }{" "}
                            chunks
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div>
                            <p
                              className="text-[11px]"
                              style={{
                                color:
                                  "#5F7490",
                              }}
                            >
                              Uploaded by{" "}
                              {document
                                .uploadedBy
                                ?.fullName ||
                                "Unknown"}
                            </p>

                            <p
                              className="text-[11px] mt-1"
                              style={{
                                color:
                                  "#3D5A78",
                              }}
                            >
                              {formatDate(
                                document.createdAt
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                document.id
                              )
                            }
                            disabled={
                              downloadingId ===
                              document.id
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                            style={{
                              background:
                                "rgba(37,99,235,0.10)",
                              color:
                                "#60A5FA",
                              border:
                                "1px solid rgba(37,99,235,0.18)",
                            }}
                          >
                            {downloadingId ===
                            document.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}

                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}