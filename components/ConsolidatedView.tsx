import React from 'react';
import { AuditRecord, Rating } from '../types';
import { QUESTIONS } from '../constants';
import { TrendingDown, TrendingUp, AlertOctagon, CheckCircle2, BarChart3, ArrowLeft, MapPin } from 'lucide-react';

interface ConsolidatedViewProps {
  records: AuditRecord[];
  onBack: () => void;
}

export const ConsolidatedView: React.FC<ConsolidatedViewProps> = ({ records, onBack }) => {
  // --- QUESTION STATISTICS ---
  const questionStats = QUESTIONS.map(q => {
    let totalPoints = 0;
    let maxPoints = 0;

    records.forEach(record => {
      const answer = record.answers.find(a => a.questionId === q.id);
      if (answer) {
        if (answer.rating === Rating.SI) {
          totalPoints += 1;
          maxPoints += 1;
        } else if (answer.rating === Rating.PARCIAL) {
          totalPoints += 0.5;
          maxPoints += 1;
        } else if (answer.rating === Rating.NO) {
          maxPoints += 1;
        }
        // N/A is ignored
      }
    });

    const percentage = maxPoints === 0 ? 0 : Math.round((totalPoints / maxPoints) * 100);
    return { ...q, percentage, count: maxPoints };
  });

  const activeQuestions = questionStats.filter(q => q.count > 0);
  const topLowestQuestions = [...activeQuestions].sort((a, b) => a.percentage - b.percentage).slice(0, 5);
  const topHighestQuestions = [...activeQuestions].sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  // --- AREA STATISTICS ---
  const areaMap: Record<string, { totalScore: number; count: number }> = {};
  records.forEach(r => {
    if (!areaMap[r.area]) {
      areaMap[r.area] = { totalScore: 0, count: 0 };
    }
    areaMap[r.area].totalScore += r.score;
    areaMap[r.area].count += 1;
  });

  const areaStats = Object.entries(areaMap).map(([area, stats]) => ({
    name: area,
    average: Math.round(stats.totalScore / stats.count),
    count: stats.count
  }));

  // Sort by average ascending
  const sortedAreas = [...areaStats].sort((a, b) => a.average - b.average);
  
  // Split the list in half to ensure mutual exclusivity between "Worst" and "Best" lists
  const midPoint = Math.floor(sortedAreas.length / 2);
  
  const worstCandidates = sortedAreas.slice(0, midPoint);
  const bestCandidates = sortedAreas.slice(midPoint);

  // Take top 5 from respective halves
  const topLowestAreas = worstCandidates.slice(0, 5);
  // Reverse best candidates so the highest scores appear first
  const topHighestAreas = bestCandidates.reverse().slice(0, 5);

  return (
    <div className="space-y-8 mb-24 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Análisis Consolidado</h2>
          <p className="text-sm text-gray-500">Desglose de cumplimiento por áreas y preguntas críticas.</p>
        </div>
      </div>

      {/* --- SECCION 1: ANÁLISIS POR ÁREAS --- */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Rendimiento por Áreas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Worst Areas */}
            <div className="bg-white rounded-xl shadow-md border border-red-100 overflow-hidden">
            <div className="p-4 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-800">Áreas Críticas (Top 5 Bajo)</h3>
                </div>
            </div>
            <div className="p-4 space-y-4">
                {topLowestAreas.length > 0 ? (
                topLowestAreas.map((item) => (
                    <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="font-bold text-red-600">{item.average}%</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                        <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${item.average}%` }}
                        ></div>
                    </div>
                    </div>
                ))
                ) : <p className="text-gray-400 text-sm">Sin datos suficientes para calcular áreas críticas.</p>}
            </div>
            </div>

            {/* Best Areas */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden">
            <div className="p-4 border-b border-green-100 bg-green-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-800">Áreas Destacadas (Top 5 Alto)</h3>
                </div>
            </div>
            <div className="p-4 space-y-4">
                {topHighestAreas.length > 0 ? (
                topHighestAreas.map((item) => (
                    <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="font-bold text-green-600">{item.average}%</span>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2">
                        <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${item.average}%` }}
                        ></div>
                    </div>
                    </div>
                ))
                ) : <p className="text-gray-400 text-sm">Sin datos suficientes.</p>}
            </div>
            </div>
        </div>
      </div>

      {/* --- SECCION 2: ANÁLISIS POR PREGUNTAS --- */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-orange-600" /> Análisis de Hallazgos (Preguntas)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Compliance Questions */}
            <div className="bg-white rounded-xl shadow-md border border-red-100 overflow-hidden">
            <div className="p-4 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-800">Mayor Incumplimiento</h3>
                </div>
            </div>
            <div className="p-4 space-y-5">
                {topLowestQuestions.length > 0 ? (
                topLowestQuestions.map((item) => (
                    <div key={item.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        {/* Removed truncate to wrap text */}
                        <span className="font-medium text-gray-700 flex-1 pr-4" title={item.text}>
                        {item.id}. {item.text}
                        </span>
                        <span className="font-bold text-red-600 flex-shrink-0">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2.5">
                        <div 
                        className="bg-red-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${item.percentage}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">Base: {item.count} respuestas</p>
                    </div>
                ))
                ) : (
                <p className="text-center text-gray-400 py-4">No hay datos suficientes.</p>
                )}
            </div>
            </div>

            {/* High Compliance Questions */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden">
            <div className="p-4 border-b border-green-100 bg-green-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-800">Mayor Cumplimiento</h3>
                </div>
            </div>
            <div className="p-4 space-y-5">
                {topHighestQuestions.length > 0 ? (
                topHighestQuestions.map((item) => (
                    <div key={item.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        {/* Removed truncate to wrap text */}
                        <span className="font-medium text-gray-700 flex-1 pr-4" title={item.text}>
                        {item.id}. {item.text}
                        </span>
                        <span className="font-bold text-green-600 flex-shrink-0">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2.5">
                        <div 
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${item.percentage}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">Base: {item.count} respuestas</p>
                    </div>
                ))
                ) : (
                <p className="text-center text-gray-400 py-4">No hay datos suficientes.</p>
                )}
            </div>
            </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
            <h4 className="font-semibold text-blue-800 text-sm">Resumen Ejecutivo</h4>
            <p className="text-sm text-blue-700 mt-1">
                Utilice el análisis de áreas para dirigir recursos de supervisión a los sectores con menor desempeño.
                Revise las preguntas con bajo cumplimiento para organizar capacitaciones o "charlas de 5 minutos" específicas sobre esos temas.
            </p>
        </div>
      </div>
    </div>
  );
};