import { useState } from "react";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Questions from "./pages/Questions";
import Results from "./pages/Results";
import "./App.css";

export default function App() {
  const [step, setStep]         = useState("landing");   // landing | upload | questions | results
  const [leafImage, setLeafImage] = useState(null);       // File object
  const [previewUrl, setPreviewUrl] = useState(null);     // blob URL
  const [stemAnswers, setStemAnswers] = useState(null);   // array of 0/1
  const [result, setResult]     = useState(null);         // API response

  const goUpload    = () => setStep("upload");
  const goQuestions = (file, url) => {
    setLeafImage(file);
    setPreviewUrl(url);
    setStep("questions");
  };
  const goResults   = async (answers) => {
    setStemAnswers(answers);
    setStep("results");

    const formData = new FormData();
    formData.append("leaf_image", leafImage);
    formData.append("stem_data", answers.join(","));

    try {
      const res  = await fetch("http://localhost:5000/predict", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "Could not reach the server. Make sure app.py is running." });
    }
  };
  const goHome = () => {
    setStep("landing");
    setLeafImage(null);
    setPreviewUrl(null);
    setStemAnswers(null);
    setResult(null);
  };

  return (
    <div className="app-root">
      <div className="bg-texture" />
      <div className="bg-vignette" />

      {step === "landing"   && <Landing   onStart={goUpload} />}
      {step === "upload"    && <Upload    onNext={goQuestions} onBack={goHome} />}
      {step === "questions" && <Questions previewUrl={previewUrl} onNext={goResults} onBack={() => setStep("upload")} />}
      {step === "results"   && <Results   result={result} previewUrl={previewUrl} onReset={goHome} />}
    </div>
  );
}
