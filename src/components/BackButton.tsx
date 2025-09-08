// src/components/BackButton.tsx
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  return (
    <div className=" ">
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg px-3 py-1.5 hover:bg-white/30 transition-all duration-300"
      >
        <ArrowLeft className="w-5 h-5" />
        
      </button>
    </div>
  );
}