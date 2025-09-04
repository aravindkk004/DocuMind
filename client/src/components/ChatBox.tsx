"use client";
import { Send } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  botTyping?: boolean;
}
const Typewriter: React.FC<{ text: string; speed?: number }> = ({ text, speed =10 }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i += 1;
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return <>{displayed}</>;
};

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, botTyping }) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  // Always scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastMsgId = messages[messages.length - 1]?.id;

  return (
    <>
      {messages.length === 0 ? (
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <p className="text-gray-500 text-center text-lg">
            💬 Ask questions about your PDF and get instant answers here.
          </p>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isLastBotMsg = msg.sender === "bot" && msg.id === lastMsgId;

            return (
              <div
                key={msg.id}
                className={`flex mb-3 gap-[10px] items-start ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!isUser && (
                  <Image
                    src={"/bot.png"}
                    height={35}
                    width={35}
                    alt="Bot Image"
                    className="rounded-full bg-gray-100 p-1"
                  />
                )}
                {isUser && (
                  <Image
                    src={"/user.jpg"}
                    height={40}
                    width={40}
                    alt="User Image"
                    className="rounded-full"
                  />
                )}
                <div className="p-3 rounded-lg inline-block break-words max-w-[80%] bg-gray-100 text-gray-800">
                  {isLastBotMsg ? (
                    <Typewriter text={msg.text} speed={10} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {botTyping && (
        <div className="flex mb-3 gap-[10px] items-start">
          <Image
            src={"/bot.png"}
            height={35}
            width={35}
            alt="Bot typing"
            className="rounded-full bg-gray-100 p-1"
          />
          <div className="flex gap-1 items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot delay-0"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot delay-150"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot delay-300"></span>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your question..."
          className="w-full rounded-xl border border-gray-200 h-[40px] px-3 text-sm 
         placeholder-gray-400 text-gray-700
         focus:border-blue-300 focus:ring-2 focus:ring-blue-100 
           focus:outline-none transition-all duration-200"
        />
        <button
          type="button"
          onClick={handleSend}
          className="bg-red-600 text-white h-[40px] w-[40px] flex items-center justify-center 
                     rounded-md cursor-pointer hover:bg-red-700 active:scale-95 
                     transition-all duration-200"
        >
          <Send size={20} />
        </button>
      </div>
    </>
  );
};

export default ChatBox;
