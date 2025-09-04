"use client";
import axios from "axios";
import { CloudUpload, Sparkles } from "lucide-react";
import React, { useRef } from "react";
import { toast } from "react-toastify";
import { Dispatch, SetStateAction } from "react";

interface InputBoxProps {
  uploadedFile: File | null;
  onFileUpload: (file: File | null) => void;
  analyzeFile: (file: File | null) => void;
  analyzing: boolean;
  fileUrl: string | null;
  setAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  sessionId: string | null;
  setSessionId: Dispatch<SetStateAction<string | null>>;
  analyzed: boolean;
  setAnalyzed: Dispatch<SetStateAction<boolean>>;
}

const InputBox: React.FC<InputBoxProps> = ({
  uploadedFile,
  onFileUpload,
  analyzeFile,
  analyzing,
  fileUrl,
  sessionId,
  setSessionId,
  analyzed,
  setAnalyzed,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Drag & Drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      onFileUpload(droppedFile);
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  // File select
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      onFileUpload(selectedFile);
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  // Trigger file picker
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full w-full">
      {!uploadedFile ? (
        // Upload UI
        <div
          className="flex flex-col items-center justify-center border-4 border-dashed border-gray-400 rounded-2xl h-full w-full transition hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
        >
          <CloudUpload size={64} className="text-gray-500 mb-3" />
          <p className="text-gray-700 text-2xl font-bold mb-2">
            Upload your PDF
          </p>
          <p className="text-gray-500 text-md">or drag & drop a file here</p>

          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="h-full w-full flex flex-col">
          {fileUrl && (
            <iframe
              src={fileUrl} // ✅ Use stable URL from state
              title="Selected PDF"
              width="100%"
              height="100%"
              className="rounded-2xl border border-gray-300 flex-1"
            />
          )}

          <div className="mt-3 flex justify-between items-center gap-3">
            <div className="flex items-center gap-[20px]">
              {/* Choose Different File */}
              <button
                onClick={handleClick}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all"
              >
                Choose Different File
              </button>
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {/* Clear File */}
              <button
                onClick={async () => {
                  if (sessionId) {
                    try {
                      await axios.post(
                        "http://127.0.0.1:5000/api/end_session",
                        { session_id: sessionId }
                      );
                      setSessionId(null);
                    } catch (err) {
                      console.error(err);
                    }
                  }
                  onFileUpload(null);
                }}
                className="px-5 py-2 border border-gray-400 text-gray-600 rounded-lg hover:border-red-500 hover:text-red-500 hover:shadow-md active:bg-red-50 active:scale-95 transition-all"
              >
                Clear File
              </button>
            </div>

            {/* Analyze Button */}
            <button
              disabled={analyzing || analyzed}
              onClick={() => analyzeFile(uploadedFile)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                analyzing || analyzed
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <span className="text-white font-medium">
                {analyzing
                  ? "Analyzing..."
                  : analyzed
                  ? "Analyzed"
                  : "Analyze PDF"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputBox;
