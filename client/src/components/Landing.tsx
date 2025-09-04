"use client"
import { Sparkles, ArrowRight } from "lucide-react";
import BgGradient from "./BgGradient";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Landing = () => {
  const router = useRouter();
  return (
    <div>
      <BgGradient />
      <nav className="flex items-center justify-between px-10 py-3">
        <Image src={"/logo.png"} height={150} width={240} alt="DocuMind Logo" />
        <button
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition"
          onClick={() => router.push("./summarizer")}
        >
          Start Now
          <ArrowRight className="h-5 w-5" />
        </button>
      </nav>
      <div className="w-full flex flex-col items-center justify-center text-center px-6 md:pt-[80px]">
        <div className="px-3 py-2 border-2 border-pink-600 rounded-full flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-rose-600 animate-pulse" />
          <p className="text-rose-600 font-medium">Powered by AI</p>
        </div>
        <h1 className="md:text-[54px] text-[32px] font-extrabold leading-tight mt-4">
          Transform PDFs into instant <br></br>insights.
        </h1>
        <h3 className="md:text-[20px] text-[16px] mt-4 leading-relaxed text-gray-700">
          AI assistant to summarize, search, and interact with PDFs for smarter
          understanding
        </h3>
        <button
          className="cursor-pointer text-[20px] mt-8 flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
          onClick={() => router.push("./summarizer")}
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Landing;
