"use client";

import React from "react";

interface PredictionStickyBarProps {
  isVisible: boolean;
  isSaving: boolean;
  onSave: () => void;
  onLoginRequest: () => void;
  isLoggedIn: boolean;
}

export function PredictionStickyBar({ isVisible, isSaving, onSave, onLoginRequest, isLoggedIn }: PredictionStickyBarProps) {
  if (!isVisible) return null;

  return (
    <div className="saveBarWrapper">
      <div 
        className="saveBar flex items-center justify-between p-2.5 pl-5 rounded-[999px] border shadow-2xl backdrop-blur-xl transition-all duration-300"
        style={{ 
          background: "rgba(255,255,255,0.88)", 
          borderColor: "rgba(0,0,0,0.08)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.16)"
        }}
      >
        <span className="text-[14px] font-bold text-[#1d1d1f]">
          Cambios sin guardar
        </span>
        
        <button
          onClick={isLoggedIn ? onSave : onLoginRequest}
          disabled={isSaving}
          className="bg-[#0071e3] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-[#0077ed] active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
        >
          {isSaving ? "Guardando..." : "Guardar predicción"}
        </button>
      </div>
      <style jsx>{`
        .saveBarWrapper {
          position: sticky;
          bottom: 18px;
          z-index: 60;
          width: min(760px, calc(100% - 32px));
          margin: 32px auto 0;
        }

        .saveBar {
          width: 100%;
        }

        @media (max-width: 734px) {
          .saveBarWrapper {
            position: fixed;
            left: 14px;
            right: 14px;
            bottom: max(14px, env(safe-area-inset-bottom));
            width: auto;
            max-width: calc(100vw - 28px);
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
