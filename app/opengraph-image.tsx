import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Avocat de Poche — Information juridique gratuite en droit français";
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
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
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
            <span style={{ color: "white", fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>
              Avocat de Poche
            </span>
            <span style={{ color: "#90aed4", fontSize: 17, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Information juridique · Gratuit
            </span>
          </div>
        </div>

        <p
          style={{
            color: "#e6ecf6",
            fontSize: 30,
            textAlign: "center",
            maxWidth: 880,
            lineHeight: 1.4,
            marginBottom: 36,
            fontWeight: 600,
          }}
        >
          Vos droits, expliqués simplement.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", maxWidth: 900 }}>
          {["Travail", "Logement", "Famille", "Consommation", "Pénal", "Harcèlement scolaire"].map((d) => (
            <div
              key={d}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                padding: "10px 20px",
                color: "white",
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <p style={{ color: "#5a7aad", fontSize: 16, marginTop: 36 }}>
          avocat-de-poche.vercel.app · Droit français · Sources Légifrance
        </p>
      </div>
    ),
    size
  );
}
