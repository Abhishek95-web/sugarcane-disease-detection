import { useState, useEffect } from "react";
import "./Questions.css";

// 5 stem-only questions shown to the farmer
const FALLBACK_QUESTIONS = [
  { class: "smut",         question: "Do you see a whip-like black growth emerging from the top of the stalk?" },
  { class: "Sett Rot",     question: "When cut open, is the inside of the cane reddish, hollow, or foul-smelling?" },
  { class: "Grassy shoot", question: "Are there excessive thin, grass-like shoots sprouting from the base of the plant?" },
  { class: "Pokkah Boeng", question: "Is the growing tip of the stalk twisted, bent, or deformed?" },
  { class: "Dried Leaves", question: "Is the stalk drying out, becoming brittle, or collapsing?" },
];

// Maps 5 user answers → 11 model inputs
// Model input order (matches training class_indices):
// 0:Banded Chlorosis, 1:Brown Spot, 2:BrownRust, 3:Dried Leaves,
// 4:Grassy shoot, 5:Healthy Leaves, 6:Pokkah Boeng, 7:Sett Rot,
// 8:Viral Disease, 9:Yellow Leaf, 10:smut
function mapToModelInputs(answers, questions) {
  const ans = questions.map((_, i) => answers[i] ?? 0);

  const smut        = ans[0]; // Q0
  const settRot     = ans[1]; // Q1
  const grassyShoot = ans[2]; // Q2
  const pokkah      = ans[3]; // Q3
  const driedLeaves = ans[4]; // Q4

  // If all stem answers are No → healthy stem signal
  const allNo = ans.every(v => v === 0) ? 1 : 0;

  return [
    0,            // 0: Banded Chlorosis  (leaf-only, no stem symptom)
    0,            // 1: Brown Spot        (leaf-only)
    0,            // 2: BrownRust         (leaf-only)
    driedLeaves,  // 3: Dried Leaves      ← Q4
    grassyShoot,  // 4: Grassy shoot      ← Q2
    allNo,        // 5: Healthy Leaves    ← 1 if all No
    pokkah,       // 6: Pokkah Boeng      ← Q3
    settRot,      // 7: Sett Rot          ← Q1
    0,            // 8: Viral Disease     (leaf-only)
    0,            // 9: Yellow Leaf       (leaf-only)
    smut,         // 10: smut             ← Q0
  ];
}

export default function Questions({ previewUrl, onNext, onBack }) {
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [answers,   setAnswers]   = useState({});
  const [current,   setCurrent]   = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/questions")
      .then(r => r.json())
      .then(d => { if (d.questions) setQuestions(d.questions); })
      .catch(() => {}); // silently use fallback
  }, []);

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;

  const handleAnswer = (val) => {
    const newAnswers = { ...answers, [current]: val };
    setAnswers(newAnswers);
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300);
    }
  };

  const allDone = answered === questions.length;

  const handleSubmit = () => {
    const modelInputs = mapToModelInputs(answers, questions);
    onNext(modelInputs); // sends 11-element array to backend
  };

  return (
    <div className="page">
      {/* Steps */}
      <div className="steps">
        <div className="step-dot done" />
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>

      <div className="card card-wide q-card">
        {/* Header row */}
        <div className="q-header">
          <div>
            <h3>Step 2 of 3</h3>
            <h2>Stem &amp; visual symptoms</h2>
            <div className="divider mt-1 mb-2" />
            <p>Answer for each disease category. Your answers help the hybrid model refine its diagnosis.</p>
          </div>
          {previewUrl && (
            <img src={previewUrl} alt="Uploaded leaf" className="q-thumb" />
          )}
        </div>

        {/* Progress bar */}
        <div className="progress-wrap mt-3">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label text-mono">
            {answered} / {questions.length}
          </span>
        </div>

        {/* Active question (large card) */}
        <div className="active-question mt-3">
          <div className="aq-category">{q.class}</div>
          <p className="aq-text">{q.question}</p>
          <div className="aq-buttons mt-3">
            <button
              className={`aq-btn aq-yes ${answers[current] === 1 ? "selected-yes" : ""}`}
              onClick={() => handleAnswer(1)}
            >
              <span className="aq-icon">✓</span> Yes
            </button>
            <button
              className={`aq-btn aq-no ${answers[current] === 0 && answers[current] !== undefined && current in answers ? "selected-no" : ""}`}
              onClick={() => handleAnswer(0)}
            >
              <span className="aq-icon">✕</span> No
            </button>
          </div>
        </div>

        {/* Mini question chip grid (5 chips now) */}
        <div className="q-grid mt-4">
          {questions.map((q2, i) => (
            <button
              key={i}
              className={`q-chip ${i === current ? "q-chip-active" : ""} ${i in answers ? (answers[i] === 1 ? "q-chip-yes" : "q-chip-no") : ""}`}
              onClick={() => setCurrent(i)}
            >
              <span className="q-chip-name">{q2.class}</span>
              {i in answers && (
                <span className="q-chip-badge">{answers[i] === 1 ? "Y" : "N"}</span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="upload-actions mt-4">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button
            className="btn btn-primary"
            disabled={!allDone}
            onClick={handleSubmit}
          >
            {allDone ? "Analyse →" : `${questions.length - answered} remaining`}
          </button>
        </div>
      </div>
    </div>
  );
}
