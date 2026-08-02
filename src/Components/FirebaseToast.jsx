import React from "react";
import { Bell, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const FirebaseToast = ({ t, title, body, targetUrl }) => {
  const handleClick = () => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
    toast.dismiss(t.id);
  };

  return (
    <div
      className={`
        pointer-events-auto relative flex w-full max-w-md overflow-hidden 
        rounded-2xl bg-white shadow-2xl border border-slate-200/60
        ${t.visible ? "animate-toastIn" : "animate-toastOut"}
      `}
    >
      {/* Left Accent Bar */}
      <div className="w-1.5 flex-shrink-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

      <div className="flex-1 p-4 flex items-start gap-3">
        {/* Bell Icon with pulse animation */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-30 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Bell size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-slate-900 leading-tight">
            {title}
          </p>
          {body && (
            <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
              {body}
            </p>
          )}
          {targetUrl && (
            <button
              onClick={handleClick}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View Details <ExternalLink size={11} />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          style={{
            animation: `toastProgress 6000ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export default FirebaseToast;