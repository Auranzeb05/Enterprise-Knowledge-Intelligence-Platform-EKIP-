import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#0C1525",
            color: "#E8EFF8",
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            gap: 12,
            padding: 32,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32 }}>⚠️</div>
          <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Something went wrong</p>
          <p style={{ fontSize: 13, color: "#4A6080", margin: 0, maxWidth: 480 }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: 8,
              padding: "8px 20px",
              background: "#2563EB",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
