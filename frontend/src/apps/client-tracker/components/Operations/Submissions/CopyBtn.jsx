// src/components/Operations/Submissions/CopyBtn.jsx
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation(); 
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-0.5 rounded text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 outline-none cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check size={11} className="text-sky-500 dark:text-sky-400" /> : <Copy size={11} />}
    </button>
  );
};

export default CopyBtn;