'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketChart } from '@/components/trends/MarketChart';

type MarketMover = {
    category: string;
    growthPercent: number;
    avgTrendScore: number;
    signal: 'BUY' | 'HOLD' | 'SELL' | 'EMERGING';
    articleCount: number;
};

export default function MarketOverview() {
    const [segment, setSegment] = useState<'homme' | 'femme'>('femme');
    const [data, setData] = useState<{ winners: MarketMover[], losers: MarketMover[] } | null>(null);
    const [loading, setLoading] = useState(true);

    // État pour le Graphique Boursier
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isChartOpen, setIsChartOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/market-index?segment=${segment}&marketZone=EU`)
            .then(res => res.json())
            .then(resData => {
                setData({
                    winners: resData.winners || [],
                    losers: resData.losers || []
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [segment]);

    const openChart = (category: string) => {
        setSelectedCategory(category);
        setIsChartOpen(true);
    };

    if (loading) return <div className="h-48 w-full bg-white/50 animate-pulse rounded-2xl" />;

    if (!data || (data.winners.length === 0 && data.losers.length === 0)) {
        return null;
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#1D1D1F]">Analyse du Marché - Bourse</h2>
                    <p className="text-sm text-gray-500">Cliquez sur une catégorie pour voir sa courbe boursière</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setSegment('femme')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${segment === 'femme' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Femme
                    </button>
                    <button
                        onClick={() => setSegment('homme')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${segment === 'homme' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Homme
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WINNERS */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-[#4ADE80]">
                        <TrendingUp className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">Hausse (Buy)</h3>
                    </div>
                    <div className="space-y-3">
                        {data.winners.map((item, i) => (
                            <MoverCard
                                key={i}
                                item={item}
                                type="winner"
                                onClick={() => openChart(item.category)}
                            />
                        ))}
                        {data.winners.length === 0 && <span className="text-xs text-gray-400">Aucun signal de hausse fort détecté.</span>}
                    </div>
                </div>

                {/* LOSERS */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-[#F87171]">
                        <TrendingDown className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">Baisse / Vente (Sell)</h3>
                    </div>
                    <div className="space-y-3">
                        {data.losers.map((item, i) => (
                            <MoverCard
                                key={i}
                                item={item}
                                type="loser"
                                onClick={() => openChart(item.category)}
                            />
                        ))}
                        {data.losers.length === 0 && <span className="text-xs text-gray-400">Le marché est stable.</span>}
                    </div>
                </div>
            </div>

            {/* MODAL GRAPHIQUE */}
            <MarketChart
                isOpen={isChartOpen}
                onClose={() => setIsChartOpen(false)}
                category={selectedCategory || ''}
                segment={segment}
            />
        </section>
    );
}

function MoverCard({ item, type, onClick }: { item: MarketMover, type: 'winner' | 'loser', onClick: () => void }) {
    return (
        <motion.div
            layout
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${type === 'winner' ? 'bg-green-50/50 border-green-100 hover:border-green-300' : 'bg-red-50/50 border-red-100 hover:border-red-300'
                }`}
        >
            <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">{item.category}</span>
                <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                    Index {Math.round(item.avgTrendScore)} · Vol {item.articleCount}
                    {item.signal === 'BUY' && <span className="text-[#4ADE80] font-bold">BUY</span>}
                    {item.signal === 'SELL' && <span className="text-[#F87171] font-bold">SELL</span>}
                </span>
            </div>
            <div className={`text-sm font-bold flex items-center gap-1 ${type === 'winner' ? 'text-[#4ADE80]' : 'text-[#F87171]'
                }`}>
                {item.growthPercent > 0 ? '+' : ''}{item.growthPercent.toFixed(1)}%
            </div>
        </motion.div>
    );
}
