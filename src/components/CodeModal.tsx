import React, { useState, useEffect } from 'react';
import { BannerConfig } from '../types';
import { generateHtmlOutput } from '../utils/zipGenerator';
import { X, Copy, Check, Code, FileText, Edit3, RotateCcw, Download, Eye } from 'lucide-react';

interface CodeModalProps {
  config: BannerConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({ config, isOpen, onClose }) => {
  const [code, setCode] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate initial code when modal opens or config changes
  useEffect(() => {
    if (isOpen) {
      const generated = generateHtmlOutput(
        config,
        config.profilePicFilename || 'profile-pic.jpg',
        config.mainKvFilename || 'main-kv.jpg'
      );
      setCode(generated);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleReset = () => {
    const generated = generateHtmlOutput(
      config,
      config.profilePicFilename || 'profile-pic.jpg',
      config.mainKvFilename || 'main-kv.jpg'
    );
    setCode(generated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleHtml = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-[#00C838]">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>HTML Code Editor</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  index.html
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Directly view or edit the raw HTML template code for your rich media banner.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View / Edit Mode Selector */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  isEditing
                    ? 'bg-white text-slate-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-[#00C838]" />
                <span>Edit Code</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  !isEditing
                    ? 'bg-white text-slate-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#00C838]" />
                <span>ReadOnly View</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content Area (Editable or ReadOnly) */}
        <div className="flex-1 relative flex overflow-hidden bg-slate-950 font-mono text-xs">
          {/* Line Numbers */}
          <div className="py-4 px-3 bg-slate-900/90 text-slate-500 select-none text-right border-r border-slate-800 font-mono text-xs min-w-[48px]">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea or Pre */}
          <div className="flex-1 relative overflow-auto">
            {isEditing ? (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 bg-transparent text-sky-200 font-mono text-xs leading-6 focus:outline-none resize-none selection:bg-blue-600 selection:text-white"
              />
            ) : (
              <pre className="p-4 text-sky-200 leading-6 whitespace-pre font-mono text-xs">
                {code}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{lineCount} lines ({code.length.toLocaleString()} characters)</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Target: 300×600 DV360</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-300 shadow-2xs cursor-pointer"
              title="Reset code back to auto-generated template"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Code</span>
            </button>

            <button
              onClick={handleDownloadSingleHtml}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-300 shadow-2xs cursor-pointer"
              title="Download index.html file directly"
            >
              <Download className="w-3.5 h-3.5 text-[#00C838]" />
              <span>Download index.html</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#00C838] to-emerald-600 hover:from-[#00b032] hover:to-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied Code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
