import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Avocat de Poche — Information juridique gratuite sur le harcèlement scolaire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f1a36 0%, #1f2c4e 60%, #2e4a7a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo + titre */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            ⚖️
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "white", fontSize: 42, fontWeight: 700, lineHeight: 1.1 }}>
              Avocat de Poche
            </span>
            <span style={{ color: "#90aed4", fontSize: 18, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Information juridique gratuite
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: "#c8d8f0",
            fontSize: 26,
            textAlign: "center",
            maxWidth: 780,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Harcèlement scolaire — Comprenez vos droits,<br />
          agissez avec les bons textes de loi. 24h/24, anonyme, gratuit.
        </p>

        {/* Numéros urgence */}
        <div style={{ display: "flex", gap: "24px" }}>
          {[
            { num: "3018", label: "Net Écoute", color: "#ef4444" },
            { num: "119", label: "Enfance en danger", color: "#f97316" },
            { num: "3020", label: "Harcèlement scolaire", color: "#3b82f6" },
          ].map((item) => (
            <div
              key={item.num}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ color: item.color, fontSize: 36, fontWeight: 800 }}>{item.num}</span>
              <span style={{ color: "#90aed4", fontSize: 13, textAlign: "center" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <p style={{ color: "#5a7aad", fontSize: 16, marginTop: 40 }}>
          avocat-de-poche.vercel.app
        </p>
      </div>
    ),
    size
  );
}
