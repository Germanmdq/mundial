"use client";

import React, { useState, useEffect } from "react";
import { getActivePaidParticipantsCount } from "@/app/actions/payments";
import { getDolarBlueRate } from "@/lib/currency/dolar-blue";
import { calculatePrizePool } from "@/lib/prize-pool";

export function PrizePoolBanner() {
  const [mounted, setMounted] = useState(false);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [blueRate, setBlueRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 0);

    async function loadData() {
      try {
        // Run in parallel for high efficiency
        const [participantsCount, rateData] = await Promise.all([
          getActivePaidParticipantsCount(),
          getDolarBlueRate(),
        ]);

        setActiveCount(participantsCount);
        if (rateData?.venta) {
          setBlueRate(rateData.venta);
        }
      } catch (err) {
        console.error("Failed to load dynamic prize pool metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => clearTimeout(mountTimer);
  }, []);

  // Format currency helpers
  const formatARS = (amount: number) => `$${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ARS`;
  const formatRate = (amount: number) => `$${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const stats = calculatePrizePool({
    activeParticipants: activeCount,
    dolarBlueVenta: blueRate,
  });

  if (!mounted) {
    // Return a stable dark skeleton structure for SSR to prevent hydration failures
    return (
      <div className="prizePoolBanner animate-pulse">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-[20px] p-6 h-[110px]" />
          ))}
        </div>
        <style jsx>{`
          .prizePoolBanner {
            width: min(1120px, calc(100% - 32px));
            margin: 24px auto 48px;
            padding: 30px;
            border-radius: 32px;
            background: #111827;
            box-shadow: 0 24px 60px rgba(0,0,0,0.20);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="prizePoolBanner">
      <div className="bannerHeader text-center mb-8">
        <span className="bannerBadge">Premio Acumulado</span>
        <h2 className="bannerTitle">Cada nueva participación suma al pozo oficial</h2>
        <p className="bannerSub">Sumate hoy y competí por el gran acumulado del torneo.</p>
      </div>

      <div className="metricsGrid">
        {/* Metric 1: Participants */}
        <div className="metricCard">
          <span className="metricLabel">Participantes</span>
          <span className="metricValue text-[#0071e3]">
            {loading ? "--" : stats.participants}
          </span>
          <span className="metricDesc">
            Participaciones confirmadas
          </span>
        </div>

        {/* Metric 2: Pool ARS */}
        <div className="metricCard highlight">
          <span className="metricLabel">Pozo acumulado</span>
          <span className="metricValue text-white">
            {formatARS(stats.poolARS)}
          </span>
          <span className="metricDesc">
            {stats.poolUSDBlue !== null
              ? `USD aprox. ${formatUSD(stats.poolUSDBlue)}`
              : "USD blue en actualización"}
          </span>
        </div>

        {/* Metric 3: USD Blue Equivalent */}
        <div className="metricCard">
          <span className="metricLabel">Suma por persona</span>
          <span className="metricValue text-[#30d158]">
            {loading ? (
              <span className="text-sm font-semibold opacity-70">Cargando...</span>
            ) : stats.entryAmountUSDApprox !== null ? (
              <>
                {formatARS(stats.entryAmountARS)}
                <small className="block text-sm font-bold text-[#8e8e93] mt-1">
                  USD aprox. {formatUSD(stats.entryAmountUSDApprox)}
                </small>
              </>
            ) : (
              <span className="text-sm font-semibold opacity-70 text-amber-500">Cargando...</span>
            )}
          </span>
          <span className="metricDesc text-[#8e8e93]">
            {blueRate ? `Dólar blue venta: ${formatRate(blueRate)}` : "Recuperando cotización..."}
          </span>
        </div>
      </div>

      <div className="bannerFooter">
        <p className="footerText">
          * Calculado con la cotización de venta del dólar blue del día provista por DolarAPI. El valor reflejado en dólares es de carácter informativo y aproximado.
        </p>
      </div>

      <style jsx>{`
        .prizePoolBanner {
          width: min(1120px, calc(100% - 32px));
          margin: 24px auto 48px;
          padding: 40px 32px 30px;
          border-radius: 32px;
          background: #111827;
          color: white;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bannerBadge {
          background: rgba(0, 113, 227, 0.15);
          color: #2997ff;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          padding: 6px 14px;
          border-radius: 999px;
          display: inline-block;
          margin-bottom: 12px;
        }

        .bannerTitle {
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 900;
          letter-spacing: -0.03em;
          margin: 0 0 6px;
          color: #ffffff;
          line-height: 1.15;
        }

        .bannerSub {
          font-size: clamp(13px, 2.2vw, 15px);
          font-weight: 600;
          color: #8e8e93;
          margin: 0;
        }

        .metricsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .metricCard {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 26px 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: transform 0.2s, border-color 0.2s;
        }

        .metricCard:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .metricCard.highlight {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
        }

        .metricLabel {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8e8e93;
          margin-bottom: 8px;
        }

        .metricValue {
          font-size: clamp(24px, 5vw, 34px);
          font-weight: 950;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .metricDesc {
          font-size: 12px;
          font-weight: 700;
          color: #8e8e93;
        }

        .bannerFooter {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 18px;
          text-align: center;
        }

        .footerText {
          font-size: 11px;
          font-weight: 600;
          line-height: 1.45;
          color: #8e8e93;
          margin: 0;
          max-width: 820px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .prizePoolBanner {
            padding: 30px 20px 24px;
            border-radius: 28px;
          }
          .metricsGrid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .metricCard {
            padding: 22px 18px;
            border-radius: 20px;
          }
        }
      `}</style>
    </div>
  );
}
