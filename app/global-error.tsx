"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ddf1f7",
            padding: "1rem",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              borderRadius: "1.5rem",
              border: "1px solid rgba(255,255,255,0.6)",
              backgroundColor: "rgba(255,255,255,0.7)",
              padding: "2.5rem",
              textAlign: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <p
              style={{
                fontSize: "4.5rem",
                fontWeight: 900,
                letterSpacing: "-0.025em",
                color: "#00a2be",
                margin: 0,
              }}
            >
              500
            </p>
            <h1
              style={{
                marginTop: "1rem",
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "#111827",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "#6b7280",
              }}
            >
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.75rem",
                backgroundColor: "#00a2be",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
