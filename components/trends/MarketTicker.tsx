'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type MarketMover = {
    category: string;
    growthPercent: number;
    avgTrendScore: number;
    signal: 'BUY' | 'HOLD' | 'SELL' | 'EMERGING';
};

export default function MarketTicker() {
    const [movers, setMovers] = useState<MarketMover[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Récupérer les données du marché
        fetch('/api/market-index?segment=mixte&marketZone=EU')
            .then((res) => res.json())
            .then((data) => {
                if (data.topMovers) {
                    setMovers(data.topMovers);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load market ticker', err);
                setLoading(false);
            });
    }, []);

    if (loading || movers.length === 0) return null;

    // Dupliquer la liste pour l'effet de défilement infini
    const tickers = [...movers, ...movers, ...movers];

    return (
        <div className="w-full bg-black border-b border-white/5 overflow-hidden py-3 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
            <div className="flex items-center gap-3 pl-6 text-[9px] font-black text-white/40 uppercase tracking-[0.3em] absolute left-0 bg-black/80 backdrop-blur-md z-20 h-full border-r border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse shadow-[0_0_8px_#00FF41]"></span>
                LIVE SCAN
            </div>

            <div className="relative flex overflow-x-hidden group">
                <motion.div
                    className="flex whitespace-nowrap gap-12 pl-40"
                    animate={{ x: [0, -1500] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 40,
                    }}
                >
                    {tickers.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 text-[11px] font-bold tracking-tight">
                            <span className="text-white font-black uppercase tracking-wider">{item.category}</span>

                            <div className={`flex items-center gap-1.5 ${item.growthPercent > 0 ? 'text-[#00FF41]' :
                                item.growthPercent < 0 ? 'text-[#FF3B30]' : 'text-gray-500'
                                }`}>
                                {item.growthPercent > 0 ? <TrendingUp className="w-3.5 h-3.5" /> :
                                    item.growthPercent < 0 ? <TrendingDown className="w-3.5 h-3.5" /> :
                                        <Minus className="w-3.5 h-3.5" />}

                                <span className="font-mono">{item.growthPercent > 0 ? '+' : ''}{item.growthPercent.toFixed(2)}%</span>
                            </div>

                            <span className="text-[9px] text-white/20 font-black px-2 py-0.5 rounded border border-white/10 uppercase">
                                SCORE {Math.round(item.avgTrendScore)}
                            </span>

                            {item.signal === 'BUY' && (
                                <span className="text-[8px] bg-[#00FF41]/10 text-[#00FF41] px-2 py-0.5 rounded-sm font-black border border-[#00FF41]/20 tracking-widest">
                                    OPPORTUNITÉ
                                </span>
                            )}
                            {item.signal === 'EMERGING' && (
                                <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-sm font-black border border-blue-500/20 tracking-widest">
                                    ÉMERGENCE
                                </span>
                            )}

                            <span className="text-white/5 mx-2">/</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
