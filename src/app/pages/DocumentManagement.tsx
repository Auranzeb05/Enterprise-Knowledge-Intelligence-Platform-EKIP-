import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router";

import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  FileText,
  UserCircle,
  BarChart2,
  Users,
  ClipboardList,
  Brain,
  Upload,
  Download,
  RefreshCw,
  Search,
  Building2,
  File,
  X,
  Loader2,
  Trash2,
} from "lucide-react";

import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   TYPES
========================================================= */

type Role =
  | "employee"
  | "manager"
  | "admin";

type DocumentStatus =
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

interface Department {
  id: string;
  name: string;
}

interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;

  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };

  department: {
    id: string;
    name: string;
  } | null;
}

interface DocumentsResponse {
  success: boolean;
  documents: DocumentItem[];
  message?: string;
}

interface DepartmentsResponse {
  success: boolean;
  departments: Department[];
  message?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL;

const NAV_EMPLOYEE = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/ai-chat",
    label: "AI Chat",
    icon: MessageSquare,
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

const NAV_MANAGER = [
  {
    path: "/manager",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/ai-chat",
    label: "AI Chat",
    icon: MessageSquare,
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

const NAV_ADMIN = [
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

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

/* =========================================================
   HELPERS
========================================================= */

function formatFileSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getFileExtension(
  fileName: string
) {
  const parts =
    fileName.split(".");

  if (
    parts.length < 2
  ) {
    return "FILE";
  }

  return (
    parts.pop()?.toUpperCase() ||
    "FILE"
  );
}

function statusLabel(
  status: DocumentStatus
) {
  if (
    status === "uploaded"
  ) {
    return "Uploaded";
  }

  if (
    status === "processing"
  ) {
    return "Processing";
  }

  if (
    status === "ready"
  ) {
    return "Ready";
  }

  return "Failed";
}

function statusColor(
  status: DocumentStatus
) {
  if (
    status === "ready"
  ) {
    return "#22C55E";
  }

  if (
    status === "processing"
  ) {
    return "#F59E0B";
  }

  if (
    status === "failed"
  ) {
    return "#EF4444";
  }

  return "#60A5FA";
}

/* =========================================================
   PAGE
========================================================= */

export default function DocumentManagement() {
  const navigate =
    useNavigate();

  const {
    session,
    logout,
    user,
  } = useAuth();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    documents,
    setDocuments,
  ] = useState<DocumentItem[]>(
    []
  );

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null
  );

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    departmentId,
    setDepartmentId,
  ] = useState("");

  const [
    uploadError,
    setUploadError,
  ] = useState("");

  const [
    deletingDocumentId,
    setDeletingDocumentId,
  ] = useState<string | null>(null);

  const role =
    user?.role as Role | undefined;

  const canUpload =
    role === "manager" ||
    role === "admin";

  const navItems =
    role === "admin"
      ? NAV_ADMIN
      : role === "manager"
        ? NAV_MANAGER
        : NAV_EMPLOYEE;

  const sidebarSubtitle =
    role === "admin"
      ? "Administrator"
      : role === "manager"
        ? "Manager"
        : "Employee";

  const settingsPath =
    role === "admin"
      ? "/admin-settings"
      : role === "manager"
        ? "/manager-settings"
        : "/settings";

  /* =========================================================
     LOAD DOCUMENTS
  ========================================================= */

  const loadDocuments =
    useCallback(
      async () => {
        if (
          !session?.access_token
        ) {
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/api/documents`,
              {
                headers: {
                  Authorization:
                    `Bearer ${session.access_token}`,
                },
              }
            );

          const data: DocumentsResponse =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data.message ||
                "Failed to load documents"
            );
          }

          setDocuments(
            data.documents
          );
        } catch (err) {
          console.error(
            "Load documents error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load documents"
          );
        } finally {
          setLoading(false);
        }
      },
      [
        session?.access_token,
      ]
    );

  /* =========================================================
     LOAD DEPARTMENTS
  ========================================================= */

  const loadDepartments =
    useCallback(
      async () => {
        if (
          !session?.access_token
        ) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_URL}/api/departments`,
              {
                headers: {
                  Authorization:
                    `Bearer ${session.access_token}`,
                },
              }
            );

          const data: DepartmentsResponse =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data.message ||
                "Failed to load departments"
            );
          }

          const visibleDepartments =
            role === "manager"
              ? data.departments.filter(
                  (department) =>
                    department.id ===
                    user?.departmentId
                )
              : data.departments;

          setDepartments(
            visibleDepartments
          );
        } catch (err) {
          console.error(
            "Load departments error:",
            err
          );
        }
      },
      [
        session?.access_token,
        role,
        user?.departmentId,
      ]
    );

  useEffect(() => {
    if (
      !session?.access_token
    ) {
      return;
    }

    loadDocuments();
    loadDepartments();
  }, [
    session?.access_token,
    loadDocuments,
    loadDepartments,
  ]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredDocuments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return documents;
      }

      return documents.filter(
        (document) => {
          return (
            document.title
              .toLowerCase()
              .includes(query) ||
            document.fileName
              .toLowerCase()
              .includes(query) ||
            document.uploadedBy.fullName
              .toLowerCase()
              .includes(query) ||
            (
              document.department
                ?.name || ""
            )
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      documents,
      search,
    ]);

  /* =========================================================
     FILE SELECT
  ========================================================= */

  function handleFileSelect(
    file: File | null
  ) {
    setUploadError("");

    if (!file) {
      setSelectedFile(
        null
      );

      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      setUploadError(
        "Only PDF, TXT, DOCX, and PPTX files are allowed."
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setUploadError(
        "File must be 10 MB or smaller."
      );

      return;
    }

    setSelectedFile(
      file
    );

    if (
      !title.trim()
    ) {
      const nameWithoutExtension =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        );

      setTitle(
        nameWithoutExtension
      );
    }
  }

  /* =========================================================
     UPLOAD
  ========================================================= */

  async function handleUpload() {
    if (
      !session?.access_token
    ) {
      return;
    }

    if (
      !canUpload
    ) {
      setUploadError(
        "You do not have permission to upload documents."
      );

      return;
    }

    if (
      !selectedFile
    ) {
      setUploadError(
        "Please choose a file."
      );

      return;
    }

    if (
      !title.trim()
    ) {
      setUploadError(
        "Document title is required."
      );

      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "title",
        title.trim()
      );

      if (
        departmentId
      ) {
        formData.append(
          "departmentId",
          departmentId
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/documents`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
            "Failed to upload document"
        );
      }

      setUploadOpen(false);
      setSelectedFile(null);
      setTitle("");
      setDepartmentId("");
      setUploadError("");

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      await loadDocuments();
    } catch (err) {
      console.error(
        "Upload document error:",
        err
      );

      setUploadError(
        err instanceof Error
          ? err.message
          : "Failed to upload document"
      );
    } finally {
      setUploading(false);
    }
  }

  /* =========================================================
     DOWNLOAD
  ========================================================= */

  async function handleDownload(
    document: DocumentItem
  ) {
    if (
      !session?.access_token
    ) {
      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/documents/${document.id}/download`,
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
            "Failed to download document"
        );
      }

      if (
        !data.signedUrl
      ) {
        throw new Error(
          "Download URL was not returned"
        );
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (err) {
      console.error(
        "Download error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to download document"
      );
    }
  }

  async function handleDeleteDocument(document: DocumentItem) {
    if (!session?.access_token || role !== "admin") return;

    if (!window.confirm(`Delete document "${document.title}"? This permanently removes the database record, chunks, embeddings, and private stored file.`)) return;

    try {
      setDeletingDocumentId(document.id);
      setError("");
      const response = await fetch(`${API_URL}/api/documents/${document.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to delete document");
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingDocumentId(null);
    }
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  async function handleLogout() {
    await logout();

    navigate(
      "/",
      {
        replace: true,
      }
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background:
          "#0C1525",
        fontFamily:
          "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >
      <EKIPSidebar
        items={
          navItems
        }
        subtitle={
          sidebarSubtitle
        }
        subtitleColor="rgba(37,99,235,0.5)"
        settingsPath={
          settingsPath
        }
        onLogout={
          handleLogout
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background:
              "rgba(8,15,28,0.96)",
            borderBottom:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <h1 className="text-xl font-bold text-white">
              {role ===
              "admin"
                ? "Document Management"
                : "Documents"}
            </h1>

            <p
              className="text-xs mt-1"
              style={{
                color:
                  "#64748B",
              }}
            >
              Browse real documents stored in EKIP.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={
                loadDocuments
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
              style={{
                background:
                  "#111D30",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                color:
                  "#E8EFF8",
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>

            {canUpload && (
              <button
                onClick={() => {
                  if (
                    role === "manager"
                  ) {
                    setDepartmentId(
                      user?.departmentId ||
                        ""
                    );
                  }

                  setUploadOpen(
                    true
                  );
                  setUploadError(
                    ""
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                style={{
                  background:
                    "#2563EB",
                }}
              >
                <Upload className="w-3.5 h-3.5" />

                Upload Document
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-6">

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{
                background:
                  "rgba(239,68,68,0.1)",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                color:
                  "#F87171",
              }}
            >
              {error}
            </div>
          )}

          {/* STAT CARDS */}

          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Documents"
              value={
                documents.length
              }
            />

            <StatCard
              title="Ready"
              value={
                documents.filter(
                  (item) =>
                    item.status ===
                    "ready"
                ).length
              }
            />

            <StatCard
              title="Uploaded"
              value={
                documents.filter(
                  (item) =>
                    item.status ===
                    "uploaded"
                ).length
              }
            />

            <StatCard
              title="Departments"
              value={
                new Set(
                  documents
                    .map(
                      (item) =>
                        item.department
                          ?.id
                    )
                    .filter(
                      Boolean
                    )
                ).size
              }
            />
          </div>

          {/* SEARCH */}

          <div
            className="rounded-xl flex items-center gap-3 px-4 py-3 mb-5"
            style={{
              background:
                "#111D30",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Search
              className="w-4 h-4"
              style={{
                color:
                  "#64748B",
              }}
            />

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search documents..."
              className="flex-1 bg-transparent outline-none text-sm text-white"
            />
          </div>

          {/* DOCUMENT LIST */}

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background:
                "#111D30",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader2
                  className="w-6 h-6 animate-spin mb-3"
                  style={{
                    color:
                      "#2563EB",
                  }}
                />

                <p
                  className="text-sm"
                  style={{
                    color:
                      "#64748B",
                  }}
                >
                  Loading documents...
                </p>
              </div>
            ) : filteredDocuments.length ===
              0 ? (
              <div className="py-16 text-center">
                <File
                  className="w-9 h-9 mx-auto mb-3"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                />

                <p className="text-sm font-medium text-white">
                  No documents found
                </p>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "#64748B",
                  }}
                >
                  {canUpload
                    ? "Upload your first EKIP document."
                    : "No documents are available yet."}
                </p>
              </div>
            ) : (
              <div>
                {filteredDocuments.map(
                  (
                    document,
                    index
                  ) => (
                    <div
                      key={
                        document.id
                      }
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4"
                      style={{
                        borderBottom:
                          index ===
                          filteredDocuments.length -
                            1
                            ? "none"
                            : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background:
                              "rgba(37,99,235,0.12)",
                          }}
                        >
                          <FileText
                            className="w-4 h-4"
                            style={{
                              color:
                                "#60A5FA",
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {
                              document.title
                            }
                          </p>

                          <p
                            className="text-xs truncate mt-1"
                            style={{
                              color:
                                "#64748B",
                            }}
                          >
                            {
                              document.fileName
                            }
                          </p>
                        </div>
                      </div>

                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wide"
                          style={{
                            color:
                              "#3D5A78",
                          }}
                        >
                          Department
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          <Building2
                            className="w-3 h-3"
                            style={{
                              color:
                                "#64748B",
                            }}
                          />

                          <span className="text-xs text-white">
                            {document
                              .department
                              ?.name ||
                              "General"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wide"
                          style={{
                            color:
                              "#3D5A78",
                          }}
                        >
                          File
                        </p>

                        <p className="text-xs text-white mt-1">
                          {getFileExtension(
                            document.fileName
                          )}{" "}
                          ·{" "}
                          {formatFileSize(
                            document.fileSize
                          )}
                        </p>
                      </div>

                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wide"
                          style={{
                            color:
                              "#3D5A78",
                          }}
                        >
                          Status
                        </p>

                        <p
                          className="text-xs font-semibold mt-1"
                          style={{
                            color:
                              statusColor(
                                document.status
                              ),
                          }}
                        >
                          {statusLabel(
                            document.status
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => void handleDownload(document)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          title="Download"
                          style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
                        >
                          <Download className="w-4 h-4" style={{ color: "#60A5FA" }} />
                        </button>
                        {role === "admin" && (
                          <button
                            onClick={() => void handleDeleteDocument(document)}
                            disabled={deletingDocumentId === document.id}
                            className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-50"
                            title="Delete document"
                            style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)" }}
                          >
                            {deletingDocumentId === document.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#F87171" }} />
                            ) : (
                              <Trash2 className="w-4 h-4" style={{ color: "#F87171" }} />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="col-span-5 flex items-center justify-between pl-[52px] -mt-2">
                        <p
                          className="text-[11px]"
                          style={{
                            color:
                              "#475569",
                          }}
                        >
                          Uploaded by{" "}
                          {
                            document
                              .uploadedBy
                              .fullName
                          }
                        </p>

                        <p
                          className="text-[11px]"
                          style={{
                            color:
                              "#475569",
                          }}
                        >
                          {formatDate(
                            document.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

      {uploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background:
              "rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6"
            style={{
              background:
                "#111D30",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Upload Document
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "#64748B",
                  }}
                >
                  PDF, TXT, DOCX or PPTX — maximum 10 MB.
                </p>
              </div>

              <button
                onClick={() =>
                  setUploadOpen(
                    false
                  )
                }
              >
                <X
                  className="w-5 h-5"
                  style={{
                    color:
                      "#64748B",
                  }}
                />
              </button>
            </div>

            {uploadError && (
              <div
                className="mb-4 px-3 py-3 rounded-lg text-xs"
                style={{
                  background:
                    "rgba(239,68,68,0.1)",
                  border:
                    "1px solid rgba(239,68,68,0.25)",
                  color:
                    "#F87171",
                }}
              >
                {uploadError}
              </div>
            )}

            <div className="mb-4">
              <label
                className="block text-xs font-semibold mb-2"
                style={{
                  color:
                    "#94A3B8",
                }}
              >
                File
              </label>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept=".pdf,.txt,.docx,.pptx"
                onChange={(
                  event
                ) =>
                  handleFileSelect(
                    event.target
                      .files?.[0] ||
                      null
                  )
                }
                className="block w-full text-xs text-white"
              />

              {selectedFile && (
                <div
                  className="mt-3 rounded-lg px-3 py-3"
                  style={{
                    background:
                      "#0C1525",
                  }}
                >
                  <p className="text-xs font-medium text-white">
                    {
                      selectedFile.name
                    }
                  </p>

                  <p
                    className="text-[11px] mt-1"
                    style={{
                      color:
                        "#64748B",
                    }}
                  >
                    {formatFileSize(
                      selectedFile.size
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block text-xs font-semibold mb-2"
                style={{
                  color:
                    "#94A3B8",
                }}
              >
                Document Title
              </label>

              <input
                value={
                  title
                }
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Enter document title"
                className="w-full px-3 py-2.5 rounded-lg outline-none text-sm text-white"
                style={{
                  background:
                    "#0C1525",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-xs font-semibold mb-2"
                style={{
                  color:
                    "#94A3B8",
                }}
              >
                Department
              </label>

              {role === "manager" ? (
                <div
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{
                    background:
                      "#0C1525",
                    border:
                      "1px solid rgba(167,139,250,0.22)",
                    color:
                      "#E8EFF8",
                  }}
                >
                  {user?.department?.name ||
                    "No department assigned"}
                  <span
                    className="block text-[10px] mt-1"
                    style={{
                      color:
                        "#64748B",
                    }}
                  >
                    Managers can publish knowledge only to their assigned department.
                  </span>
                </div>
              ) : (
                <select
                  value={
                    departmentId
                  }
                  onChange={(
                    event
                  ) =>
                    setDepartmentId(
                      event.target.value
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-lg outline-none text-sm text-white"
                  style={{
                    background:
                      "#0C1525",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <option value="">
                    General
                  </option>

                  {departments.map(
                    (
                      department
                    ) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {
                          department.name
                        }
                      </option>
                    )
                  )}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                disabled={
                  uploading
                }
                onClick={() =>
                  setUploadOpen(
                    false
                  )
                }
                className="px-4 py-2.5 rounded-lg text-xs font-semibold"
                style={{
                  background:
                    "#0C1525",
                  color:
                    "#94A3B8",
                }}
              >
                Cancel
              </button>

              <button
                disabled={
                  uploading
                }
                onClick={
                  handleUpload
                }
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-white flex items-center gap-2 disabled:opacity-50"
                style={{
                  background:
                    "#2563EB",
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background:
          "#111D30",
        border:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider font-semibold"
        style={{
          color:
            "#3D5A78",
        }}
      >
        {title}
      </p>

      <p className="text-2xl font-bold text-white mt-2">
        {value}
      </p>
    </div>
  );
}
