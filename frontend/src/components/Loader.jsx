import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ size = "w-6 h-6", text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-500">
      <Loader2 className={`${size} text-blue-500 animate-[spin_1.5s_linear_infinite]`} />
      {text && <p className="text-slate-400 text-sm font-medium animate-pulse tracking-wide">{text}</p>}
    </div>
  );
}
