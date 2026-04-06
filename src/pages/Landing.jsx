import "./Landing.css";

const CLASSES = [
  "Banded Chlorosis", "Brown Spot", "BrownRust",
  "Dried Leaves", "Grassy Shoot", "Healthy Leaves",
  "Pokkah Boeng", "Sett Rot", "Viral Disease",
  "Yellow Leaf", "Smut"
];

export default function Landing({ onStart }) {
  return (
    <div className="page landing-page">

      {/* Decorative leaf lines */}
      <div className="leaf-lines" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`leaf-line leaf-line-${i}`} />
        ))}
      </div>

      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">🌿</div>
        <span className="brand-name">AgroScan Lab</span>
      </div>

      {/* Hero */}
      <div className="landing-hero">
        <h3 className="mt-2">Sugarcane Disease Detection</h3>
        <h1>
          Diagnose your<br />
          crop with <em>precision</em>
        </h1>
        <div className="divider mt-2 mb-2" />
        <p className="landing-desc">
          Upload a leaf image and answer a few quick symptom questions.
          Our hybrid AI model — trained on 6,748 images across 11 disease classes
          — delivers a diagnosis in seconds.
        </p>

        <div className="landing-stats">
          <div className="stat">
            <span className="stat-value">92.3%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-sep" />
          <div className="stat">
            <span className="stat-value">11</span>
            <span className="stat-label">Disease classes</span>
          </div>
          <div className="stat-sep" />
          <div className="stat">
            <span className="stat-value">6,748</span>
            <span className="stat-label">Training images</span>
          </div>
        </div>

        <button className="btn btn-primary mt-4" onClick={onStart}>
          Start diagnosis
          <span className="btn-arrow">→</span>
        </button>
      </div>

      {/* Disease tag cloud */}
      <div className="disease-tags">
        {CLASSES.map(c => (
          <span key={c} className="tag tag-green">{c}</span>
        ))}
      </div>

      {/* Footer note */}
      <p className="landing-footer text-muted">
        Powered by MobileNetV2 + hybrid stem analysis · MiniProject TY Sem 1
      </p>
    </div>
  );
}
