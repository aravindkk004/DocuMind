"use client";
import ChatBox from "@/components/ChatBox";
import InputBox from "@/components/InputBox";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [botTyping, setBotTyping] = useState(false);

  useEffect(()=> {
    const fetching = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API}api`)
      console.log(response.data.message);
    }
    fetching();
  }, [])

  // Handle file upload
  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setAnalyzed(false);
    } else {
      setFileUrl(null);
    }
  };

  // Analyze file
  const analyzeFile = async (file: File | null): Promise<void> => {
    if (!file) {
      toast.error("Upload a PDF before analyzing");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setAnalyzing(true);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}api/analyze_pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        setSessionId(response.data.session_id);
        setAnalyzed(true);
        toast.success("PDF analyzed successfully! You can now chat.");
      } else {
        toast.error(response.data.error || "PDF analyze failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while analyzing.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle chat messages
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!sessionId) {
      toast.error("Please upload and analyze a PDF before chatting!");
      return;
    }
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      setBotTyping(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}api/chat_with_pdf`,
        {
          session_id: sessionId,
          question: text,
        }
      );

      if (response.status === 200) {
        const botReply: Message = {
          id: Date.now().toString() + "-bot",
          text: response.data.answer,
          sender: "bot",
        };

        setMessages((prev) => [...prev, botReply]);
      }else{
        toast.error(response.data.error || "Failed to chat with your document.")
      }
    } catch (err) {
      console.error(err);
    } finally{
      setBotTyping(false);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-7 py-2 border-b border-gray-400">
        <Image src="/logo.png" height={150} width={200} alt="DocuMind Logo" />
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[89vh] w-full bg-gradient-to-br from-gray-50 to-gray-100">
        {/* PDF Upload Area */}
        <div className="h-[89vh] overflow-y-auto md:w-1/2 w-full md:border-r border-gray-400 p-3 flex justify-center items-center">
          <InputBox
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            analyzeFile={analyzeFile}
            analyzing={analyzing}
            setAnalyzing={setAnalyzing}
            fileUrl={fileUrl}
            sessionId={sessionId}
            setSessionId={setSessionId}
            analyzed={analyzed}
            setAnalyzed={setAnalyzed}
          />
        </div>

        {/* Chat Area */}
        <div className="h-[89vh] overflow-y-auto flex md:w-1/2 flex-col bg-white">
          <ChatBox messages={messages} onSendMessage={handleSendMessage} botTyping={botTyping}/>
        </div>
      </div>
    </div>
  );
}
