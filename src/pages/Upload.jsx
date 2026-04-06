import { useState, useRef, useCallback } from "react";
import "./Upload.css";

export default function Upload({ onNext, onBack }) {
  const [dragging, setDragging]   = useState(false);
  const [preview,  setPreview]    = useState(null);
  const [file,     setFile]       = useState(null);
  const [error,    setError]      = useState("");
  const inputRef = useRef();

  const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/bmp"];

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setError("Please upload a JPG, PNG, WEBP, or BMP image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div className="page">
      {/* Steps */}
      <div className="steps">
        <div className="step-dot active" />
        <div className="step-dot" />
        <div className="step-dot" />
      </div>

      <div className="card card-narrow">
        <div className="brand mb-2">
          <div className="brand-icon">🌿</div>
          <span className="brand-name">AgroScan Lab</span>
        </div>

        <h3>Step 1 of 3</h3>
        <h2>Upload leaf image</h2>
        <div className="divider mt-1 mb-2" />
        <p>Take a clear, well-lit photo of the sugarcane leaf you want to analyse.</p>

        {/* Drop zone */}
        {!preview ? (
          <div
            className={`drop-zone mt-3 ${dragging ? "drag-active" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current.click()}
          >
            <div className="drop-icon">📷</div>
            <p className="drop-title">Drop image here</p>
            <p className="drop-sub">or click to browse</p>
            <span className="tag tag-amber mt-2">JPG · PNG · WEBP · BMP · max 10MB</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="preview-wrap mt-3">
            <img src={preview} alt="Leaf preview" className="preview-img" />
            <div className="preview-overlay">
              <button
                className="preview-change"
                onClick={() => { setPreview(null); setFile(null); }}
              >
                ✕ Change image
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="upload-error mt-2">⚠ {error}</p>
        )}

        {/* Tips */}
        <div className="upload-tips mt-3">
          <p className="tip-title">📌 For best results</p>
          <ul>
            <li>Use natural daylight, avoid shadows</li>
            <li>Capture the full leaf blade clearly</li>
            <li>Avoid blurry or heavily cropped images</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="upload-actions mt-4">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button
            className="btn btn-primary"
            disabled={!file}
            onClick={() => onNext(file, preview)}
          >
            Next: Symptoms →
          </button>
        </div>
      </div>
    </div>
  );
}
