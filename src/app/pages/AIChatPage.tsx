import {
  useEffect,
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
  Sparkles,
  Send,
  Copy,
  Check,
  Database,
  Building2,
  Loader2,
  History,
  Trash2,
  Plus,
  ExternalLink,
  X,
} from "lucide-react";

import {
  EKIPSidebar,
} from "../components/Sidebar";

import type {
  SidebarNavItem,
} from "../components/Sidebar";

import {
  useAuth,
} from "../context/AuthContext";

import {
  supabase,
} from "../../lib/supabase";

const COLORS = {
  bg: "#0C1525",
  card: "#111D30",
  accent: "#2563EB",
  text: "#E8EFF8",
  muted: "#64748B",
  border: "#1E2D45",
  cardHover: "#162035",
};

interface ChatSource {
  documentId: string;
  title: string;
  fileName: string;
  chunkId: string;
  chunkIndex: number;
  similarity: number;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
}

interface ChatResponse {
  conversationId: string;
  message: string;
  answer: string;
  sources: ChatSource[];
}

interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface ConversationsResponse {
  count: number;
  conversations: ConversationSummary[];
}

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[] | null;
  createdAt: string;
}

interface ConversationDetailResponse {
  conversation: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: StoredMessage[];
  };
}

interface ErrorResponse {
  message?: string;
}

interface DownloadResponse {
  url?: string;
  signedUrl?: string;
  message?: string;
}

const SUGGESTED_QUESTIONS = [
  "What AI and machine learning skills are mentioned?",
  "Tell me about the EKIP project.",
  "What experience is mentioned with data engineering?",
  "Summarize the AI internship experience.",
];

const MAX_MESSAGE_LENGTH = 4000;

const CHAT_REQUEST_TIMEOUT_MS =
  130000;

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #2563EB, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Sparkles
          size={16}
          color="white"
        />
      </div>

      <div
        style={{
          background: COLORS.card,
          border:
            `1px solid ${COLORS.border}`,
          borderRadius:
            "4px 16px 16px 16px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Loader2
          size={16}
          color={COLORS.accent}
          className="animate-spin"
        />

        <span
          style={{
            fontSize: 13,
            color: COLORS.muted,
          }}
        >
          EKIP is searching the knowledge base and generating an answer...
        </span>
      </div>
    </div>
  );
}

function AIMessageContent({
  content,
}: {
  content: string;
}) {
  const normalized =
    content
      .replace(/\\\*/g, "*")
      .replace(/\\#/g, "#")
      .replace(/\\`/g, "`");

  function renderInline(
    text: string
  ) {
    const parts =
      text.split(
        /(\*\*.*?\*\*|`.*?`)/g
      );

    return parts.map(
      (part, index) => {
        if (
          part.startsWith("**") &&
          part.endsWith("**")
        ) {
          return (
            <strong
              key={index}
              style={{
                color: COLORS.text,
                fontWeight: 700,
              }}
            >
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (
          part.startsWith("`") &&
          part.endsWith("`")
        ) {
          return (
            <code
              key={index}
              style={{
                background:
                  COLORS.bg,
                border:
                  `1px solid ${COLORS.border}`,
                borderRadius: 5,
                padding: "1px 5px",
                fontSize: 12,
                color: "#93C5FD",
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        return (
          <span key={index}>
            {part}
          </span>
        );
      }
    );
  }

  const lines =
    normalized.split("\n");

  return (
    <div
      style={{
        fontSize: 14,
        lineHeight: 1.75,
        color: COLORS.text,
      }}
    >
      {lines.map(
        (line, index) => {
          const trimmed =
            line.trim();

          if (!trimmed) {
            return (
              <div
                key={index}
                style={{
                  height: 8,
                }}
              />
            );
          }

          if (
            trimmed.startsWith(
              "### "
            )
          ) {
            return (
              <div
                key={index}
                style={{
                  marginTop: 12,
                  marginBottom: 5,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {renderInline(
                  trimmed.slice(4)
                )}
              </div>
            );
          }

          if (
            trimmed.startsWith(
              "## "
            )
          ) {
            return (
              <div
                key={index}
                style={{
                  marginTop: 14,
                  marginBottom: 6,
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {renderInline(
                  trimmed.slice(3)
                )}
              </div>
            );
          }

          if (
            trimmed.startsWith(
              "# "
            )
          ) {
            return (
              <div
                key={index}
                style={{
                  marginTop: 14,
                  marginBottom: 7,
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {renderInline(
                  trimmed.slice(2)
                )}
              </div>
            );
          }

          if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("• ")
          ) {
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: 8,
                  margin: "4px 0",
                }}
              >
                <span
                  style={{
                    color: "#60A5FA",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  •
                </span>

                <span>
                  {renderInline(
                    trimmed.slice(2)
                  )}
                </span>
              </div>
            );
          }

          const numbered =
            trimmed.match(
              /^(\d+)\.\s(.*)$/
            );

          if (numbered) {
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: 8,
                  margin: "4px 0",
                }}
              >
                <span
                  style={{
                    color: "#60A5FA",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {numbered[1]}.
                </span>

                <span>
                  {renderInline(
                    numbered[2]
                  )}
                </span>
              </div>
            );
          }

          return (
            <div
              key={index}
              style={{
                margin: "2px 0",
              }}
            >
              {renderInline(
                trimmed
              )}
            </div>
          );
        }
      )}
    </div>
  );
}

function SourceCard({
  source,
  index,
  onOpen,
}: {
  source: ChatSource;
  index: number;
  onOpen: () => void;
}) {
  const similarity =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          source.similarity
        ) * 100
      )
    );

  return (
    <div
      style={{
        background:
          COLORS.cardHover,
        border:
          `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              display:
                "inline-block",
              fontSize: 10,
              fontWeight: 700,
              background:
                `${COLORS.accent}22`,
              color: "#60A5FA",
              borderRadius: 999,
              padding: "3px 7px",
              marginBottom: 7,
            }}
          >
            SOURCE {index + 1}
          </span>

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.text,
              lineHeight: 1.35,
              wordBreak:
                "break-word",
            }}
          >
            {source.title}
          </div>

          <div
            style={{
              fontSize: 11,
              color: COLORS.muted,
              marginTop: 4,
              wordBreak:
                "break-word",
            }}
          >
            {source.fileName}
          </div>

          <div
            style={{
              fontSize: 10,
              color: COLORS.muted,
              marginTop: 3,
            }}
          >
            Knowledge chunk{" "}
            {source.chunkIndex}
          </div>
        </div>

        <button
          type="button"
          title="Open source document"
          onClick={onOpen}
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            border:
              `1px solid ${COLORS.border}`,
            background:
              "transparent",
            color: "#60A5FA",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            flexShrink: 0,
          }}
        >
          <ExternalLink
            size={13}
          />
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: COLORS.muted,
            }}
          >
            Semantic relevance
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color:
                similarity >= 70
                  ? "#10B981"
                  : similarity >= 50
                    ? "#F59E0B"
                    : "#94A3B8",
            }}
          >
            {similarity.toFixed(1)}%
          </span>
        </div>

        <div
          style={{
            height: 4,
            borderRadius: 99,
            background:
              COLORS.border,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width:
                `${similarity}%`,
              height: "100%",
              background:
                COLORS.accent,
              borderRadius: 99,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AIChatPage() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const role =
    user?.role ||
    "employee";

  const [
    messages,
    setMessages,
  ] =
    useState<Message[]>([]);

  const [
    input,
    setInput,
  ] =
    useState("");

  const [
    isTyping,
    setIsTyping,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    retryMessage,
    setRetryMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    copiedMsgId,
    setCopiedMsgId,
  ] =
    useState<
      string | null
    >(null);

  const [
    citationPanelOpen,
    setCitationPanelOpen,
  ] =
    useState(true);

  const [
    activeSources,
    setActiveSources,
  ] =
    useState<
      ChatSource[]
    >([]);

  const [
    conversationId,
    setConversationId,
  ] =
    useState<
      string | null
    >(null);

  const [
    conversations,
    setConversations,
  ] =
    useState<
      ConversationSummary[]
    >([]);

  const [
    historyOpen,
    setHistoryOpen,
  ] =
    useState(true);

  const [
    historyLoading,
    setHistoryLoading,
  ] =
    useState(false);

  useEffect(() => {
    const narrowViewport =
      window.matchMedia(
        "(max-width: 1199px)"
      );

    const syncPanels =
      () => {
        if (
          narrowViewport.matches
        ) {
          setHistoryOpen(false);
          setCitationPanelOpen(false);
        }
      };

    syncPanels();

    narrowViewport.addEventListener(
      "change",
      syncPanels
    );

    return () => {
      narrowViewport.removeEventListener(
        "change",
        syncPanels
      );
    };
  }, []);

  const [
    conversationLoading,
    setConversationLoading,
  ] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(
      null
    );

  const textareaRef =
    useRef<HTMLTextAreaElement>(
      null
    );

  const activeChatRequestRef =
    useRef<AbortController | null>(
      null
    );

  const API_URL =
    import.meta.env
      .VITE_API_URL ||
    "http://localhost:4000";

  const NAV_EMPLOYEE:
    SidebarNavItem[] = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon:
        LayoutDashboard,
    },
    {
      path: "/ai-chat",
      label: "AI Chat",
      icon:
        MessageSquare,
    },
    {
      path: "/knowledge",
      label:
        "Knowledge Base",
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

  const NAV_MANAGER:
    SidebarNavItem[] = [
    {
      path: "/manager",
      label: "Dashboard",
      icon:
        LayoutDashboard,
    },
    {
      path: "/ai-chat",
      label: "AI Chat",
      icon:
        MessageSquare,
    },
    {
      path: "/knowledge",
      label:
        "Knowledge Base",
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
      path:
        "/manager-profile",
      label: "Profile",
      icon: UserCircle,
    },
  ];

  const NAV_ADMIN:
    SidebarNavItem[] = [
    {
      path: "/admin",
      label: "Dashboard",
      icon:
        LayoutDashboard,
    },
    {
      path: "/users",
      label:
        "User Management",
      icon: Users,
    },
    {
      path:
        "/departments",
      label: "Departments",
      icon: Building2,
    },
    {
      path: "/knowledge",
      label:
        "Knowledge Base",
      icon: BookOpen,
    },
    {
      path: "/documents",
      label:
        "Document Management",
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
      icon:
        ClipboardList,
    },
    {
      path:
        "/ai-monitoring",
      label:
        "AI Monitoring",
      icon: Brain,
    },
    {
      path:
        "/admin-profile",
      label: "Profile",
      icon: UserCircle,
    },
  ];

  const nav =
    role === "admin"
      ? NAV_ADMIN
      : role ===
          "manager"
        ? NAV_MANAGER
        : NAV_EMPLOYEE;

  const settingsPath =
    role === "admin"
      ? "/admin-settings"
      : role ===
          "manager"
        ? "/manager-settings"
        : "/settings";

  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [
    messages,
    isTyping,
  ]);

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    return () => {
      activeChatRequestRef.current
        ?.abort();
    };
  }, []);

  async function getAccessToken() {
    const {
      data: {
        session,
      },
    } =
      await supabase.auth
        .getSession();

    return (
      session
        ?.access_token ||
      null
    );
  }

  async function loadConversations() {
    try {
      setHistoryLoading(
        true
      );

      const token =
        await getAccessToken();

      if (!token) {
        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/chat/conversations`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        (await response
          .json()
          .catch(
            () => null
          )) as
          | ConversationsResponse
          | ErrorResponse
          | null;

      if (!response.ok) {
        const errorMessage =
          data &&
          "message" in
            data &&
          typeof data.message ===
            "string"
            ? data.message
            : "Could not load chat history.";

        throw new Error(
          errorMessage
        );
      }

      if (
        data &&
        "conversations" in
          data &&
        Array.isArray(
          data.conversations
        )
      ) {
        setConversations(
          data.conversations
        );
      }
    } catch (
      requestError
    ) {
      console.error(
        "Load chat history error:",
        requestError
      );
    } finally {
      setHistoryLoading(
        false
      );
    }
  }

  async function openConversation(
    id: string
  ) {
    if (
      isTyping ||
      conversationLoading
    ) {
      return;
    }

    try {
      setConversationLoading(
        true
      );

      setError("");

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Authentication session not found."
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/chat/conversations/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        (await response
          .json()
          .catch(
            () => null
          )) as
          | ConversationDetailResponse
          | ErrorResponse
          | null;

      if (!response.ok) {
        const errorMessage =
          data &&
          "message" in
            data &&
          typeof data.message ===
            "string"
            ? data.message
            : "Could not load conversation.";

        throw new Error(
          errorMessage
        );
      }

      if (
        !data ||
        !(
          "conversation" in
          data
        )
      ) {
        throw new Error(
          "Invalid conversation response."
        );
      }

      const loadedMessages:
        Message[] =
        data.conversation.messages.map(
          (
            message
          ) => ({
            id:
              message.id,

            role:
              message.role ===
              "assistant"
                ? "ai"
                : "user",

            content:
              message.content,

            timestamp:
              new Date(
                message.createdAt
              ),

            sources:
              Array.isArray(
                message.sources
              )
                ? message.sources
                : [],
          })
        );

      setConversationId(
        data.conversation.id
      );

      setMessages(
        loadedMessages
      );

      const lastAIMessage =
        [
          ...loadedMessages,
        ]
          .reverse()
          .find(
            (
              message
            ) =>
              message.role ===
              "ai"
          );

      setActiveSources(
        lastAIMessage
          ?.sources || []
      );

      if (
        window.matchMedia(
          "(max-width: 1199px)"
        ).matches
      ) {
        setHistoryOpen(false);
      }
    } catch (
      requestError
    ) {
      console.error(
        "Open conversation error:",
        requestError
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Could not load conversation."
      );
    } finally {
      setConversationLoading(
        false
      );
    }
  }

  async function deleteConversation(
    id: string
  ) {
    if (isTyping) {
      return;
    }

    const shouldDelete =
      window.confirm(
        "Delete this conversation?"
      );

    if (!shouldDelete) {
      return;
    }

    try {
      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Authentication session not found."
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/chat/conversations/${id}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        (await response
          .json()
          .catch(
            () => null
          )) as
          | ErrorResponse
          | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not delete conversation."
        );
      }

      setConversations(
        (
          previous
        ) =>
          previous.filter(
            (
              conversation
            ) =>
              conversation.id !==
              id
          )
      );

      if (
        conversationId ===
        id
      ) {
        startNewChat();
      }
    } catch (
      requestError
    ) {
      console.error(
        "Delete conversation error:",
        requestError
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Could not delete conversation."
      );
    }
  }

  async function openSourceDocument(
    documentId: string
  ) {
    try {
      setError("");

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Authentication session not found."
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/documents/${documentId}/download`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        (await response
          .json()
          .catch(
            () => null
          )) as
          | DownloadResponse
          | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not open source document."
        );
      }

      const documentUrl =
        data?.url ||
        data?.signedUrl;

      if (!documentUrl) {
        throw new Error(
          "Document download URL was not returned."
        );
      }

      window.open(
        documentUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (
      requestError
    ) {
      console.error(
        "Open source document error:",
        requestError
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Could not open source document."
      );
    }
  }

  async function sendMessage(
    overrideMessage?: string
  ) {
    const text =
      (
        overrideMessage ??
        input
      ).trim();

    if (
      !text ||
      isTyping ||
      conversationLoading
    ) {
      return;
    }

    if (
      text.length >
      MAX_MESSAGE_LENGTH
    ) {
      setError(
        `Message is too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`
      );

      return;
    }

    const userMessage:
      Message = {
      id:
        crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp:
        new Date(),
    };

    setMessages(
      (
        previous
      ) => [
        ...previous,
        userMessage,
      ]
    );

    setInput("");
    setError("");
    setRetryMessage(null);
    setIsTyping(true);

    const controller =
      new AbortController();

    activeChatRequestRef.current =
      controller;

    const timeout =
      window.setTimeout(
        () => {
          controller.abort();
        },
        CHAT_REQUEST_TIMEOUT_MS
      );

    try {
      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Authentication session not found."
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/chat`,
          {
            method: "POST",

            signal:
              controller.signal,

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                {
                  message:
                    text,

                  conversationId,
                }
              ),
          }
        );

      const data =
        (await response
          .json()
          .catch(
            () => null
          )) as
          | ChatResponse
          | ErrorResponse
          | null;

      if (!response.ok) {
        const errorMessage =
          data &&
          "message" in
            data &&
          typeof data.message ===
            "string"
            ? data.message
            : response.status ===
                503
              ? "EKIP AI is temporarily unavailable. Check that Ollama is running and try again."
              : "AI chat request failed.";

        throw new Error(
          errorMessage
        );
      }

      if (
        !data ||
        !(
          "answer" in data
        ) ||
        typeof data.answer !==
          "string"
      ) {
        throw new Error(
          "Invalid AI response."
        );
      }

      if (
        typeof data
          .conversationId ===
        "string"
      ) {
        setConversationId(
          data.conversationId
        );
      }

      const sources =
        Array.isArray(
          data.sources
        )
          ? data.sources
          : [];

      const aiMessage:
        Message = {
        id:
          crypto.randomUUID(),
        role: "ai",
        content:
          data.answer,
        timestamp:
          new Date(),
        sources,
      };

      setMessages(
        (
          previous
        ) => [
          ...previous,
          aiMessage,
        ]
      );

      setActiveSources(
        sources
      );

      setRetryMessage(null);

      await loadConversations();
    } catch (
      requestError
    ) {
      console.error(
        "AI chat error:",
        requestError
      );

      const timedOut =
        requestError instanceof
          DOMException &&
        requestError.name ===
          "AbortError";

      const errorMessage =
        timedOut
          ? "The AI request took too long. Please try again."
          : requestError instanceof
              Error
            ? requestError.message
            : "AI chat failed.";

      /*
       * The Phase 6 backend persists
       * the user/assistant pair only
       * after a successful AI answer.
       *
       * Remove the optimistic message
       * when the request fails so the
       * frontend remains consistent
       * with persisted conversation
       * history.
       */
      setMessages(
        (
          previous
        ) =>
          previous.filter(
            (
              messageItem
            ) =>
              messageItem.id !==
              userMessage.id
          )
      );

      setInput(text);
      setRetryMessage(text);

      setError(
        errorMessage
      );
    } finally {
      window.clearTimeout(
        timeout
      );

      if (
        activeChatRequestRef.current ===
        controller
      ) {
        activeChatRequestRef.current =
          null;
      }

      setIsTyping(
        false
      );

      setTimeout(
        () => {
          textareaRef.current
            ?.focus();
        },
        50
      );
    }
  }

  function handleKeyDown(
    event:
      React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendMessage();
    }
  }

  function copyMessage(
    id: string,
    content: string
  ) {
    navigator.clipboard
      .writeText(
        content
      )
      .catch(
        () => {}
      );

    setCopiedMsgId(
      id
    );

    setTimeout(
      () => {
        setCopiedMsgId(
          null
        );
      },
      1800
    );
  }

  function startNewChat() {
    if (
      isTyping ||
      conversationLoading
    ) {
      return;
    }

    setMessages([]);
    setActiveSources([]);
    setError("");
    setRetryMessage(null);
    setInput("");
    setConversationId(
      null
    );

    if (
      window.matchMedia(
        "(max-width: 1199px)"
      ).matches
    ) {
      setHistoryOpen(false);
      setCitationPanelOpen(false);
    }

    setTimeout(
      () => {
        textareaRef.current
          ?.focus();
      },
      50
    );
  }

  async function handleLogout() {
    await logout();

    navigate("/");
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        minHeight: "100dvh",
        background:
          COLORS.bg,
        color: COLORS.text,
        fontFamily:
          "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
        overflow:
          "hidden",
      }}
    >
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #1E2D45;
          border-radius: 3px;
        }

        textarea {
          resize: none;
        }

        .ekip-chat-drawer-close {
          display: flex !important;
        }

        @media (max-width: 1199px) {
          .ekip-chat-history {
            position: absolute !important;
            inset: 0 auto 0 0 !important;
            z-index: 30 !important;
            width: min(300px, 92%) !important;
            box-shadow: 18px 0 40px rgba(0,0,0,0.28);
          }

          .ekip-chat-sources {
            position: absolute !important;
            inset: 0 0 0 auto !important;
            z-index: 30 !important;
            width: min(320px, 94%) !important;
            box-shadow: -18px 0 40px rgba(0,0,0,0.28);
          }

          .ekip-chat-content {
            padding: 22px 18px !important;
          }
        }

        @media (max-width: 639px) {
          .ekip-chat-header {
            height: auto !important;
            min-height: 60px !important;
            padding: 10px 12px !important;
            gap: 8px !important;
          }

          .ekip-chat-header button {
            padding: 7px 8px !important;
          }

          .ekip-chat-content {
            padding: 16px 10px !important;
          }

          .ekip-chat-empty {
            min-height: 360px !important;
            padding: 16px 4px !important;
          }

          .ekip-chat-suggestions {
            grid-template-columns: 1fr !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <EKIPSidebar
        items={nav}
        settingsPath={
          settingsPath
        }
        onLogout={
          handleLogout
        }
      />

      <div
        className="ekip-chat-shell"
        style={{
          flex: 1,
          width: "100%",
          minWidth: 0,
          display: "flex",
          overflow:
            "hidden",
          position: "relative",
        }}
      >
        {historyOpen && (
          <aside
            className="ekip-chat-history"
            style={{
              width: 260,
              flexShrink: 0,
              background:
                "#0F1A2C",
              borderRight:
                `1px solid ${COLORS.border}`,
              display: "flex",
              flexDirection:
                "column",
              overflow:
                "hidden",
            }}
          >
            <div
              style={{
                padding: 14,
                borderBottom:
                  `1px solid ${COLORS.border}`,
              }}
            >
              <button
                type="button"
                onClick={
                  startNewChat
                }
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    COLORS.accent,
                  color: "white",
                  borderRadius:
                    8,
                  padding:
                    "10px 12px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: 7,
                  cursor:
                    "pointer",
                  fontFamily:
                    "inherit",
                  fontSize:
                    12,
                  fontWeight:
                    700,
                }}
              >
                <Plus
                  size={15}
                />
                New Chat
              </button>
            </div>

            <div
              style={{
                padding:
                  "12px 12px 7px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 6,
                  color:
                    COLORS.muted,
                  fontSize:
                    11,
                  fontWeight:
                    700,
                }}
              >
                <History
                  size={13}
                />
                CHAT HISTORY
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {historyLoading && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                    color={
                      COLORS.muted
                    }
                  />
                )}

                <button
                  type="button"
                  className="ekip-chat-drawer-close"
                  aria-label="Close chat history"
                  title="Close chat history"
                  onClick={() =>
                    setHistoryOpen(false)
                  }
                  style={{
                    width: 28,
                    height: 28,
                    border:
                      `1px solid ${COLORS.border}`,
                    background:
                      "transparent",
                    color:
                      COLORS.muted,
                    borderRadius: 7,
                    cursor:
                      "pointer",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    padding: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY:
                  "auto",
                padding:
                  "4px 8px 12px",
              }}
            >
              {!historyLoading &&
                conversations.length ===
                  0 && (
                  <div
                    style={{
                      color:
                        COLORS.muted,
                      fontSize:
                        11,
                      textAlign:
                        "center",
                      padding:
                        "18px 10px",
                      lineHeight:
                        1.6,
                    }}
                  >
                    No saved conversations yet.
                  </div>
                )}

              {conversations.map(
                (
                  conversation
                ) => {
                  const active =
                    conversation.id ===
                    conversationId;

                  return (
                    <div
                      key={
                        conversation.id
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 5,
                        marginBottom:
                          5,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void openConversation(
                            conversation.id
                          )
                        }
                        style={{
                          flex: 1,
                          minWidth:
                            0,
                          textAlign:
                            "left",
                          border:
                            `1px solid ${
                              active
                                ? `${COLORS.accent}66`
                                : "transparent"
                            }`,
                          background:
                            active
                              ? `${COLORS.accent}18`
                              : "transparent",
                          color:
                            active
                              ? COLORS.text
                              : "#AEBBCD",
                          borderRadius:
                            7,
                          padding:
                            "9px",
                          cursor:
                            "pointer",
                          fontFamily:
                            "inherit",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              11,
                            fontWeight:
                              600,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            conversation.title
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              4,
                            fontSize:
                              9,
                            color:
                              COLORS.muted,
                          }}
                        >
                          {
                            conversation.messageCount
                          }{" "}
                          message
                          {conversation.messageCount ===
                          1
                            ? ""
                            : "s"}
                        </div>
                      </button>

                      <button
                        type="button"
                        title="Delete conversation"
                        onClick={() =>
                          void deleteConversation(
                            conversation.id
                          )
                        }
                        style={{
                          width: 30,
                          height: 30,
                          flexShrink:
                            0,
                          border:
                            "none",
                          background:
                            "transparent",
                          color:
                            "#64748B",
                          borderRadius:
                            6,
                          cursor:
                            "pointer",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        <Trash2
                          size={13}
                        />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </aside>
        )}

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection:
              "column",
            overflow:
              "hidden",
          }}
        >
          <div
            className="ekip-chat-header"
            style={{
              height: 64,
              padding:
                "0 22px",
              background:
                COLORS.card,
              borderBottom:
                `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: 10,
              }}
            >
              <button
                type="button"
                title="Toggle chat history"
                onClick={() =>
                  setHistoryOpen(
                    (
                      previous
                    ) => {
                      const next =
                        !previous;

                      if (
                        next &&
                        window.matchMedia(
                          "(max-width: 1199px)"
                        ).matches
                      ) {
                        setCitationPanelOpen(
                          false
                        );
                      }

                      return next;
                    }
                  )
                }
                style={{
                  width: 32,
                  height: 32,
                  border:
                    `1px solid ${COLORS.border}`,
                  background:
                    historyOpen
                      ? `${COLORS.accent}18`
                      : "transparent",
                  color:
                    historyOpen
                      ? "#60A5FA"
                      : COLORS.muted,
                  borderRadius:
                    7,
                  cursor:
                    "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <History
                  size={15}
                />
              </button>

              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius:
                    "50%",
                  background:
                    "#10B981",
                  boxShadow:
                    "0 0 9px #10B981",
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight:
                      700,
                    fontSize:
                      15,
                  }}
                >
                  EKIP Knowledge Assistant
                </div>

                <div
                  style={{
                    fontSize:
                      11,
                    color:
                      COLORS.muted,
                    marginTop:
                      2,
                  }}
                >
                  Ollama RAG · qwen3:4b
                </div>
              </div>
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={
                  startNewChat
                }
                disabled={
                  messages.length ===
                    0 &&
                  !conversationId
                }
                style={{
                  border:
                    `1px solid ${COLORS.border}`,
                  background:
                    "transparent",
                  borderRadius:
                    8,
                  padding:
                    "7px 10px",
                  color:
                    messages.length ===
                      0 &&
                    !conversationId
                      ? "#3E4D63"
                      : COLORS.muted,
                  cursor:
                    messages.length ===
                      0 &&
                    !conversationId
                      ? "default"
                      : "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 5,
                  fontSize:
                    12,
                  fontFamily:
                    "inherit",
                }}
              >
                <Plus
                  size={14}
                />
                New Chat
              </button>

              <button
                type="button"
                onClick={() =>
                  setCitationPanelOpen(
                    (
                      previous
                    ) => {
                      const next =
                        !previous;

                      if (
                        next &&
                        window.matchMedia(
                          "(max-width: 1199px)"
                        ).matches
                      ) {
                        setHistoryOpen(
                          false
                        );
                      }

                      return next;
                    }
                  )
                }
                style={{
                  border:
                    `1px solid ${
                      citationPanelOpen
                        ? COLORS.accent
                        : COLORS.border
                    }`,
                  background:
                    citationPanelOpen
                      ? COLORS.accent
                      : "transparent",
                  borderRadius:
                    8,
                  padding:
                    "7px 11px",
                  color:
                    citationPanelOpen
                      ? "white"
                      : COLORS.muted,
                  cursor:
                    "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 6,
                  fontSize:
                    12,
                  fontWeight:
                    600,
                  fontFamily:
                    "inherit",
                }}
              >
                <Database
                  size={14}
                />
                Sources
              </button>
            </div>
          </div>

          <div
            className="ekip-chat-content"
            style={{
              flex: 1,
              overflowY:
                "auto",
              padding:
                "26px 24px",
            }}
          >
            {conversationLoading && (
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: 8,
                  color:
                    COLORS.muted,
                  fontSize:
                    12,
                  padding:
                    20,
                }}
              >
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                Loading conversation...
              </div>
            )}

            {!conversationLoading &&
              messages.length ===
                0 && (
                <div
                  className="ekip-chat-empty"
                  style={{
                    height:
                      "100%",
                    minHeight:
                      420,
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    textAlign:
                      "center",
                    padding:
                      30,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius:
                        16,
                      background:
                        "linear-gradient(135deg, #2563EB, #1D4ED8)",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      marginBottom:
                        18,
                      boxShadow:
                        "0 12px 40px rgba(37,99,235,0.22)",
                    }}
                  >
                    <Brain
                      size={27}
                      color="white"
                    />
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize:
                        22,
                      fontWeight:
                        800,
                    }}
                  >
                    Knowledge Assistant
                  </h2>

                  <p
                    style={{
                      maxWidth:
                        520,
                      margin:
                        "10px auto 22px",
                      color:
                        COLORS.muted,
                      fontSize:
                        13,
                      lineHeight:
                        1.7,
                    }}
                  >
                    Search your authorized EKIP knowledge with grounded answers and source citations.
                  </p>

                  <div
                    className="ekip-chat-suggestions"
                    style={{
                      width:
                        "100%",
                      maxWidth:
                        660,
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    {SUGGESTED_QUESTIONS.map(
                      (
                        question
                      ) => (
                        <button
                          key={
                            question
                          }
                          type="button"
                          onClick={() =>
                            void sendMessage(
                              question
                            )
                          }
                          style={{
                            textAlign:
                              "left",
                            background:
                              COLORS.card,
                            border:
                              `1px solid ${COLORS.border}`,
                            borderRadius:
                              12,
                            padding:
                              "13px 14px",
                            color:
                              "#B7C5D8",
                            fontSize:
                              12,
                            lineHeight:
                              1.5,
                            cursor:
                              "pointer",
                            fontFamily:
                              "inherit",
                          }}
                        >
                          {
                            question
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

            {!conversationLoading &&
              messages.map(
                (
                  message
                ) => (
                  <div
                    key={
                      message.id
                    }
                    style={{
                      marginBottom:
                        24,
                    }}
                  >
                    {message.role ===
                    "user" ? (
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "flex-end",
                        }}
                      >
                        <div
                          style={{
                            maxWidth:
                              "72%",
                          }}
                        >
                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, #2563EB, #1D4ED8)",
                              borderRadius:
                                "16px 4px 16px 16px",
                              padding:
                                "12px 16px",
                              fontSize:
                                14,
                              lineHeight:
                                1.65,
                              color:
                                "white",
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {
                              message.content
                            }
                          </div>

                          <div
                            style={{
                              textAlign:
                                "right",
                              marginTop:
                                5,
                              fontSize:
                                10,
                              color:
                                COLORS.muted,
                            }}
                          >
                            {message.timestamp.toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "flex-start",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius:
                              10,
                            background:
                              "#1D4ED8",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            flexShrink:
                              0,
                          }}
                        >
                          <Sparkles
                            size={
                              16
                            }
                            color="white"
                          />
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth:
                              0,
                          }}
                        >
                          <div
                            style={{
                              background:
                                COLORS.card,
                              border:
                                `1px solid ${COLORS.border}`,
                              borderRadius:
                                14,
                              padding:
                                "16px 18px",
                              boxShadow:
                                "0 8px 24px rgba(0,0,0,0.08)",
                            }}
                          >
                            <AIMessageContent
                              content={
                                message.content
                              }
                            />
                          </div>

                          {message.sources &&
                            message
                              .sources
                              .length >
                              0 && (
                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexWrap:
                                    "wrap",
                                  gap: 6,
                                  marginTop:
                                    9,
                                }}
                              >
                                {message.sources.map(
                                  (
                                    source,
                                    index
                                  ) => (
                                    <button
                                      key={
                                        source.chunkId
                                      }
                                      type="button"
                                      title={`Open ${source.fileName}`}
                                      onClick={() =>
                                        void openSourceDocument(
                                          source.documentId
                                        )
                                      }
                                      style={{
                                        background:
                                          `${COLORS.accent}18`,
                                        border:
                                          `1px solid ${COLORS.accent}44`,
                                        color:
                                          "#60A5FA",
                                        borderRadius:
                                          999,
                                        padding:
                                          "5px 9px",
                                        fontSize:
                                          10,
                                        cursor:
                                          "pointer",
                                        fontFamily:
                                          "inherit",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        gap: 4,
                                      }}
                                    >
                                      #
                                      {index +
                                        1}{" "}
                                      {
                                        source.title
                                      }

                                      <ExternalLink
                                        size={
                                          10
                                        }
                                      />
                                    </button>
                                  )
                                )}
                              </div>
                            )}

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 6,
                              marginTop:
                                7,
                            }}
                          >
                            <button
                              type="button"
                              title="Copy answer"
                              onClick={() =>
                                copyMessage(
                                  message.id,
                                  message.content
                                )
                              }
                              style={{
                                background:
                                  "transparent",
                                border:
                                  "none",
                                color:
                                  copiedMsgId ===
                                  message.id
                                    ? "#10B981"
                                    : COLORS.muted,
                                padding:
                                  "4px 6px",
                                borderRadius:
                                  5,
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                              }}
                            >
                              {copiedMsgId ===
                              message.id ? (
                                <Check
                                  size={
                                    14
                                  }
                                />
                              ) : (
                                <Copy
                                  size={
                                    14
                                  }
                                />
                              )}
                            </button>

                            <span
                              style={{
                                fontSize:
                                  10,
                                color:
                                  COLORS.muted,
                              }}
                            >
                              {message.timestamp.toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    "2-digit",
                                  minute:
                                    "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

            {isTyping && (
              <TypingIndicator />
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </div>

          {error && (
            <div
              style={{
                margin:
                  "0 20px 8px",
                padding:
                  "9px 12px",
                background:
                  "rgba(239,68,68,0.08)",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                color:
                  "#F87171",
                borderRadius:
                  8,
                fontSize:
                  11,
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: 12,
              }}
            >
              <span>
                {error}
              </span>

              {retryMessage &&
                !isTyping &&
                !conversationLoading && (
                  <button
                    type="button"
                    onClick={() =>
                      void sendMessage(
                        retryMessage
                      )
                    }
                    style={{
                      border:
                        "1px solid rgba(248,113,113,0.4)",
                      background:
                        "rgba(248,113,113,0.08)",
                      color:
                        "#FCA5A5",
                      borderRadius:
                        6,
                      padding:
                        "5px 8px",
                      fontFamily:
                        "inherit",
                      fontSize:
                        10,
                      fontWeight:
                        700,
                      cursor:
                        "pointer",
                      flexShrink:
                        0,
                    }}
                  >
                    Retry
                  </button>
                )}
            </div>
          )}

          <div
            style={{
              padding:
                "12px 20px 18px",
              borderTop:
                `1px solid ${COLORS.border}`,
              background:
                COLORS.card,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-end",
                gap: 10,
                background:
                  COLORS.bg,
                border:
                  `1px solid ${COLORS.border}`,
                borderRadius:
                  12,
                padding:
                  "9px 10px 9px 14px",
              }}
            >
              <textarea
                ref={
                  textareaRef
                }
                value={
                  input
                }
                onChange={(
                  event
                ) =>
                  setInput(
                    event
                      .target
                      .value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                disabled={
                  isTyping ||
                  conversationLoading
                }
                maxLength={
                  MAX_MESSAGE_LENGTH
                }
                rows={1}
                placeholder="Ask EKIP about your enterprise documents..."
                style={{
                  flex: 1,
                  minHeight:
                    42,
                  maxHeight:
                    120,
                  border:
                    "none",
                  outline:
                    "none",
                  background:
                    "transparent",
                  color:
                    COLORS.text,
                  fontFamily:
                    "inherit",
                  fontSize:
                    14,
                  lineHeight:
                    1.6,
                  padding:
                    "9px 2px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  void sendMessage()
                }
                disabled={
                  isTyping ||
                  conversationLoading ||
                  !input.trim()
                }
                style={{
                  width: 42,
                  height: 42,
                  borderRadius:
                    9,
                  border:
                    "none",
                  background:
                    isTyping ||
                    conversationLoading ||
                    !input.trim()
                      ? "#1E2D45"
                      : COLORS.accent,
                  color:
                    "white",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  cursor:
                    isTyping ||
                    conversationLoading ||
                    !input.trim()
                      ? "default"
                      : "pointer",
                  flexShrink:
                    0,
                }}
              >
                {isTyping ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send
                    size={17}
                  />
                )}
              </button>
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: 12,
                marginTop:
                  7,
                fontSize:
                  10,
                color:
                  "#42536A",
              }}
            >
              <span>
                Enter to send · Shift + Enter for a new line · Conversation history is stored in Neon
              </span>

              <span
                style={{
                  color:
                    input.length >=
                    MAX_MESSAGE_LENGTH *
                      0.9
                      ? "#F59E0B"
                      : "#42536A",
                  flexShrink: 0,
                }}
              >
                {input.length}/
                {MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>
        </div>

        {citationPanelOpen && (
          <aside
            className="ekip-chat-sources"
            style={{
              width: 320,
              flexShrink: 0,
              background:
                COLORS.card,
              borderLeft:
                `1px solid ${COLORS.border}`,
              overflowY:
                "auto",
              padding:
                "18px 14px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                marginBottom:
                  16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      14,
                    fontWeight:
                      700,
                  }}
                >
                  Retrieved Sources
                </div>

                <div
                  style={{
                    fontSize:
                      10,
                    color:
                      COLORS.muted,
                    marginTop:
                      3,
                  }}
                >
                  Evidence used for the current answer
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Database
                  size={17}
                  color="#60A5FA"
                />

                <button
                  type="button"
                  className="ekip-chat-drawer-close"
                  aria-label="Close sources"
                  title="Close sources"
                  onClick={() =>
                    setCitationPanelOpen(
                      false
                    )
                  }
                  style={{
                    width: 28,
                    height: 28,
                    border:
                      `1px solid ${COLORS.border}`,
                    background:
                      "transparent",
                    color:
                      COLORS.muted,
                    borderRadius: 7,
                    cursor:
                      "pointer",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    padding: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {activeSources.length ===
            0 ? (
              <div
                style={{
                  border:
                    `1px dashed ${COLORS.border}`,
                  borderRadius:
                    10,
                  padding:
                    "24px 14px",
                  textAlign:
                    "center",
                }}
              >
                <BookOpen
                  size={25}
                  color="#42536A"
                  style={{
                    margin:
                      "0 auto 10px",
                  }}
                />

                <div
                  style={{
                    fontSize:
                      12,
                    color:
                      COLORS.muted,
                    lineHeight:
                      1.6,
                  }}
                >
                  Ask a question to see the source documents used for the answer.
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize:
                      10,
                    color:
                      COLORS.muted,
                    marginBottom:
                      10,
                  }}
                >
                  {
                    activeSources.length
                  }{" "}
                  source
                  {activeSources.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  retrieved
                </div>

                {activeSources.map(
                  (
                    source,
                    index
                  ) => (
                    <SourceCard
                      key={
                        source.chunkId
                      }
                      source={
                        source
                      }
                      index={
                        index
                      }
                      onOpen={() =>
                        void openSourceDocument(
                          source.documentId
                        )
                      }
                    />
                  )
                )}
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
