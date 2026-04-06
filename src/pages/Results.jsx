import "./Results.css";

const DISEASE_INFO = {
  "Banded Chlorosis": {
    severity: "moderate",
    cause: "Nutrient deficiency (zinc, manganese) or viral infection",
    treatment: "Apply micronutrient fertilizers. Check soil pH. Remove severely affected leaves.",
    icon: "🟡",
  },
  "Brown Spot": {
    severity: "moderate",
    cause: "Fungal infection — Helminthosporium sacchari",
    treatment: "Apply fungicide (Mancozeb or Carbendazim). Improve drainage. Destroy crop debris.",
    icon: "🟤",
  },
  "BrownRust": {
    severity: "high",
    cause: "Fungal — Puccinia melanocephala. Spreads rapidly in humid conditions.",
    treatment: "Spray Propiconazole fungicide. Use resistant varieties. Remove infected ratoons.",
    icon: "🟠",
  },
  "Dried Leaves": {
    severity: "low",
    cause: "Water stress, mechanical damage, or aging leaves",
    treatment: "Ensure adequate irrigation. Remove dried leaves manually. Check for pest infestation.",
    icon: "🍂",
  },
  "Grassy shoot": {
    severity: "high",
    cause: "Phytoplasma infection transmitted by leafhopper insects",
    treatment: "No cure — rogue out infected plants immediately. Control leafhoppers with insecticide.",
    icon: "🌾",
  },
  "Healthy Leaves": {
    severity: "none",
    cause: "No disease detected",
    treatment: "Continue regular crop management and monitoring.",
    icon: "✅",
  },
  "Pokkah Boeng": {
    severity: "moderate",
    cause: "Fungal — Fusarium moniliforme. Affects the growing tip.",
    treatment: "Spray Carbendazim. Avoid waterlogging. Remove and burn infected tops.",
    icon: "🔴",
  },
  "Sett Rot": {
    severity: "high",
    cause: "Fungal — Ceratocystis paradoxa. Affects planting setts.",
    treatment: "Treat setts with Carbendazim before planting. Improve field drainage urgently.",
    icon: "🔴",
  },
  "Viral Disease": {
    severity: "high",
    cause: "Sugarcane mosaic virus (SCMV) spread by aphids",
    treatment: "Remove infected plants. Control aphid vectors. Use certified virus-free seed material.",
    icon: "🔴",
  },
  "Yellow Leaf": {
    severity: "moderate",
    cause: "Sugarcane yellow leaf virus (ScYLV) transmitted by aphids",
    treatment: "Use virus-free planting material. Control aphid vectors. Remove infected plants.",
    icon: "🟡",
  },
  "smut": {
    severity: "high",
    cause: "Fungal — Ustilago scitaminea. Produces characteristic whip",
    treatment: "Rogue infected plants immediately. Treat setts in hot water (52°C, 30 min). Use resistant varieties.",
    icon: "⚫",
  },
};

const SEVERITY_MAP = {
  none:     { label: "No Disease",  cls: "sev-none"     },
  low:      { label: "Low Risk",    cls: "sev-low"      },
  moderate: { label: "Moderate",    cls: "sev-moderate" },
  high:     { label: "High Risk",   cls: "sev-high"     },
};

export default function Results({ result, previewUrl, onReset }) {
  const loading = !result;
  const hasError = result?.error;
  const info = !loading && !hasError ? DISEASE_INFO[result.prediction] : null;
  const sev  = info ? SEVERITY_MAP[info.severity] : null;

  return (
    <div className="page results-page">
      {/* Steps */}
      <div className="steps">
        <div className="step-dot done" />
        <div className="step-dot done" />
        <div className="step-dot active" />
      </div>

      <div className="card card-wide">
        <div className="brand mb-2">
          <div className="brand-icon">🌿</div>
          <span className="brand-name">AgroScan Lab</span>
        </div>

        <h3>Step 3 of 3</h3>
        <h2>Diagnosis result</h2>
        <div className="divider mt-1 mb-3" />

        {/* Loading state */}
        {loading && (
          <div className="result-loading">
            <div className="spinner" />
            <p className="text-muted mt-2">Analysing your leaf image…</p>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="result-error">
            <p>⚠ {result.error}</p>
          </div>
        )}

        {/* Success state */}
        {!loading && !hasError && info && (
          <div className="result-body">

            {/* Main diagnosis card */}
            <div className="diagnosis-card">
              <div className="diagnosis-left">
                <div className="disease-icon">{info.icon}</div>
                <div>
                  <div className="disease-name">{result.prediction}</div>
                  <div className={`tag ${sev.cls} mt-1`}>{sev.label}</div>
                </div>
              </div>
              <div className="confidence-badge">
                <span className="conf-value">
                  {result.confidence_percent}
                </span>
                <span className="conf-label">confidence</span>
              </div>
            </div>

            {/* Row: image + top3 */}
            <div className="results-row mt-3">
              {/* Leaf thumbnail */}
              {previewUrl && (
                <div className="result-thumb-wrap">
                  <img src={previewUrl} alt="Analysed leaf" className="result-thumb" />
                  <div className="result-thumb-label">Analysed image</div>
                </div>
              )}

              {/* Top 3 predictions */}
              <div className="top3-wrap">
                <p className="section-micro">Top predictions</p>
                {result.top_3?.map((item, i) => {
                  const pct = parseFloat(item.confidence_percent);
                  return (
                    <div key={i} className={`top3-row ${i === 0 ? "top3-first" : ""}`}>
                      <div className="top3-meta">
                        <span className="top3-rank text-mono">{i + 1}</span>
                        <span className="top3-name">{item.disease}</span>
                        <span className="top3-pct text-mono">{item.confidence_percent}</span>
                      </div>
                      <div className="top3-bar-track">
                        <div
                          className={`top3-bar-fill ${i === 0 ? "fill-primary" : "fill-secondary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disease info */}
            {info.severity !== "none" && (
              <div className="info-grid mt-3">
                <div className="info-card">
                  <p className="section-micro">Cause</p>
                  <p className="info-text">{info.cause}</p>
                </div>
                <div className="info-card info-card-action">
                  <p className="section-micro">Recommended treatment</p>
                  <p className="info-text">{info.treatment}</p>
                </div>
              </div>
            )}

            {info.severity === "none" && (
              <div className="healthy-banner mt-3">
                <span className="healthy-icon">✅</span>
                <div>
                  <p className="healthy-title">Plant appears healthy</p>
                  <p className="info-text">No disease detected. Continue regular crop monitoring and management practices.</p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="result-disclaimer mt-3">
              This is an AI-assisted analysis. Always consult an agronomist for confirmed diagnosis and treatment decisions.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="upload-actions mt-4">
          <button className="btn btn-ghost" onClick={onReset}>
            ← New diagnosis
          </button>
        </div>
      </div>
    </div>
  );
}
