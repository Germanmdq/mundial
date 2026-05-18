"use client";

import React, { useState, useEffect } from "react";

const TARGET_DATE = new Date("2026-06-11T12:00:00-05:00"); // Standard Mexico Central Time or UTC-5 for opening kick-off

export function WorldCupCountdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +TARGET_DATE - +new Date();
      if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const mountTimer = setTimeout(() => {
      setMounted(true);
      setTimeLeft(calculateTimeLeft());
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(timer);
    };
  }, []);

  // Format single digits with a leading zero
  const formatNum = (num: number) => String(num).padStart(2, "0");

  if (!mounted) {
    // Return a beautiful, stable skeleton placeholder matching layout during SSR to completely prevent hydration layout shifting
    return (
      <div className="worldCupCountdownBanner animate-pulse">
        <div className="text-center">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] opacity-80 mb-2">Falta para el Mundial 2026</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">Cuenta regresiva a la fecha de inicio</h2>
          <div className="flex justify-center items-center gap-3 md:gap-6 my-4">
            {["días", "horas", "minutos", "segundos"].map((label, idx) => (
              <div key={idx} className="countdownItemSkeleton">
                <span className="text-2xl md:text-4xl font-black">--</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-60 mt-1">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] md:text-xs opacity-70 mt-4">11 de junio de 2026</p>
        </div>
        <style jsx>{`
          .worldCupCountdownBanner {
            width: min(1120px, calc(100% - 32px));
            margin: 32px auto;
            padding: 32px;
            border-radius: 32px;
            background: linear-gradient(135deg, #0071e3, #003f91);
            color: white;
            box-shadow: 0 24px 60px rgba(0,113,227,0.25);
          }
          .countdownItemSkeleton {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            width: clamp(70px, 18vw, 120px);
            height: clamp(70px, 18vw, 110px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="worldCupCountdownBanner">
      <div className="countdownInner">
        <p className="countdownEyebrow">Falta para el Mundial 2026</p>
        <h2 className="countdownTitle">Cuenta regresiva a la fecha de inicio: 11 de junio de 2026</h2>
        
        <div className="countdownGrid">
          <div className="countdownCard">
            <span className="countdownNumber">{timeLeft.days}</span>
            <span className="countdownLabel">{timeLeft.days === 1 ? "día" : "días"}</span>
          </div>
          <div className="countdownCard">
            <span className="countdownNumber">{formatNum(timeLeft.hours)}</span>
            <span className="countdownLabel">horas</span>
          </div>
          <div className="countdownCard">
            <span className="countdownNumber">{formatNum(timeLeft.minutes)}</span>
            <span className="countdownLabel">minutos</span>
          </div>
          <div className="countdownCard">
            <span className="countdownNumber">{formatNum(timeLeft.seconds)}</span>
            <span className="countdownLabel">segundos</span>
          </div>
        </div>

        <p className="countdownSubtext">
          El Mundial más grande de la historia: 48 selecciones, 12 grupos y 104 partidos.
        </p>
      </div>

      <style jsx>{`
        .worldCupCountdownBanner {
          width: min(1120px, calc(100% - 32px));
          margin: 32px auto;
          padding: 36px 32px;
          border-radius: 32px;
          background: linear-gradient(135deg, #0071e3, #003f91);
          color: white;
          box-shadow: 0 24px 60px rgba(0,113,227,0.25);
          box-sizing: border-box;
          overflow: hidden;
        }

        .countdownInner {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .countdownEyebrow {
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin: 0 0 8px;
        }

        .countdownTitle {
          color: #ffffff;
          font-size: clamp(20px, 3.5vw, 26px);
          font-weight: 850;
          letter-spacing: -0.02em;
          margin: 0 0 28px;
          line-height: 1.2;
        }

        .countdownGrid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(8px, 2.5vw, 20px);
          margin-bottom: 28px;
        }

        .countdownCard {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          width: clamp(72px, 18vw, 120px);
          height: clamp(72px, 18vw, 110px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s;
        }

        .countdownCard:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.12);
        }

        .countdownNumber {
          font-size: clamp(26px, 6vw, 44px);
          font-weight: 950;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .countdownLabel {
          font-size: clamp(9px, 2vw, 12px);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.72);
          margin-top: 4px;
        }

        .countdownSubtext {
          font-size: clamp(12px, 2.2vw, 14.5px);
          font-weight: 600;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }

        @media (max-width: 500px) {
          .worldCupCountdownBanner {
            padding: 28px 20px;
            border-radius: 28px;
          }
          .countdownGrid {
            gap: 8px;
          }
          .countdownCard {
            border-radius: 18px;
          }
        }
      `}</style>
    </div>
  );
}
