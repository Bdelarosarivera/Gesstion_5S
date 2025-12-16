import React from 'react';
import { AuditRecord, ActionItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie, Legend } from 'recharts';
import { Trophy, TrendingUp, AlertTriangle, CheckCircle, PieChart as PieChartIcon, ClipboardList, Activity } from 'lucide-react';

interface DashboardProps {
  records: AuditRecord[];
  actions: ActionItem[];
  onViewConsolidated: () => void;
  onViewActions: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ records, actions, onViewConsolidated, onViewActions }) => {
  // Aggregate average score by Area
  const areaStats: Record<string, { totalScore: number; count: number }> = {};

  records.forEach(r => {
    if (!areaStats[r.area]) {
      areaStats[r.area] = { totalScore: 0, count: 0 };
    }
    areaStats[r.area].totalScore += r.score;
    areaStats[r.area].count += 1;
  });

  const chartData = Object.entries(areaStats)
    .map(([area, stats]) => ({
      name: area,
      score: Math.round(stats.totalScore / stats.count),
      audits: stats.count
    }))
    .sort((a, b) => b.score - a.score); // Sort by score descending

  // Color logic
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBarColor = (score: number) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#eab308';
    return '#ef4444';
  };

  const averageScore = records.length > 0
    ? Math.round(records.reduce((acc, r) => acc + r.score, 0) / records.length)
    : 0;
  
  const openActions = actions.filter(a => a.status !== 'CLOSED').length;
  const closedActions = actions.filter(a => a.status === 'CLOSED').length;

  // Calculate dynamic height for the chart to fit all areas
  const chartHeight = Math.max(300, chartData.length * 60);

  // Pie Chart Data
  const pieData = [
    { name: 'Cumplimiento', value: averageScore },
    { name: 'Brecha', value: 100 - averageScore }
  ];
  const pieColors = [getBarColor(averageScore), '#f3f4f6'];

  return (
    <div className="space-y-8 mb-24 animate-fade-in">
      
      {/* --- NEON DESIGN KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: AUDITORÍAS (Cyan) */}
        <div className="bg-[#0d1b2a] rounded-[24px] border-2 border-cyan-400 p-6 flex flex-col justify-between h-48 relative shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <p className="text-white font-bold text-sm tracking-wider">AUDITORÍAS</p>
                <div className="relative group">
                    <div className="absolute inset-0 bg-cyan-400 blur-sm opacity-40 rounded-full"></div>
                    <div className="relative border-2 border-cyan-400 rounded-full p-1">
                        <CheckCircle className="w-5 h-5 text-cyan-400" />
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-6xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                    {records.length}
                </p>
            </div>
            <div className="h-4"></div> {/* Spacer for alignment */}
        </div>

        {/* CARD 2: PROMEDIO (Green) */}
        <div className="bg-[#0d1b2a] rounded-[24px] border-2 border-[#4ade80] p-6 flex flex-col justify-between h-48 relative shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <p className="text-white font-bold text-sm tracking-wider">PROMEDIO</p>
                <div className="relative group">
                    <div className="absolute inset-0 bg-[#4ade80] blur-sm opacity-40 rounded-full"></div>
                    <div className="relative border-2 border-[#4ade80] rounded-full p-1">
                        <TrendingUp className="w-5 h-5 text-[#4ade80]" />
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-6xl font-bold text-[#4ade80] drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]">
                    {averageScore}%
                </p>
            </div>
            <div className="h-4"></div>
        </div>

        {/* CARD 3: ACCIONES ABIERTAS (Orange) */}
        <div 
            onClick={onViewActions}
            className="bg-[#0d1b2a] rounded-[24px] border-2 border-[#fb923c] p-6 flex flex-col justify-between h-48 relative shadow-[0_0_15px_rgba(251,146,60,0.2)] cursor-pointer hover:shadow-[0_0_25px_rgba(251,146,60,0.4)] transition-all hover:-translate-y-1"
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-white font-bold text-sm tracking-wider">ACCIONES</p>
                    <p className="text-white font-bold text-sm tracking-wider">ABIERTAS</p>
                </div>
                <div className="relative group">
                    <div className="absolute inset-0 bg-[#fb923c] blur-sm opacity-40 rounded-full"></div>
                    <div className="relative border-2 border-[#fb923c] rounded-full p-1">
                        <AlertTriangle className="w-5 h-5 text-[#fb923c]" />
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-6xl font-bold text-[#fb923c] drop-shadow-[0_0_10px_rgba(251,146,60,0.6)]">
                    {openActions}
                </p>
            </div>
            <p className="text-center text-[#fb923c]/80 text-xs font-medium mt-auto">Click para gestionar</p>
        </div>

        {/* CARD 4: CERRADAS (Purple) */}
        <div className="bg-[#0d1b2a] rounded-[24px] border-2 border-[#c084fc] p-6 flex flex-col justify-between h-48 relative shadow-[0_0_15px_rgba(192,132,252,0.2)] transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <p className="text-white font-bold text-sm tracking-wider">CERRADAS</p>
                <div className="relative group">
                    <div className="absolute inset-0 bg-[#c084fc] blur-sm opacity-40 rounded-full"></div>
                    <div className="relative border-2 border-[#c084fc] rounded-full p-1">
                        <CheckCircle className="w-5 h-5 text-[#c084fc]" />
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-6xl font-bold text-[#c084fc] drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]">
                    {closedActions}
                </p>
            </div>
            <div className="h-4"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action Button for Analysis */}
        <button 
            onClick={onViewConsolidated}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 font-bold text-lg"
        >
            <div className="bg-orange-100 p-2 rounded-full">
                <PieChartIcon className="w-6 h-6 text-orange-600" />
            </div>
            Análisis Consolidado
        </button>
        
        {/* Action Button for Plans */}
        <button 
            onClick={onViewActions}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 font-bold text-lg"
        >
            <div className="bg-blue-100 p-2 rounded-full">
                <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            Ver Planes de Acción
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Global Compliance Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Cumplimiento Global</h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                      >
                          <Cell fill={pieColors[0]} />
                          <Cell fill={pieColors[1]} />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                  <span className={`text-3xl font-bold ${
                      averageScore >= 90 ? 'text-green-600' : averageScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {averageScore}%
                  </span>
                  <span className="text-xs text-gray-400 font-medium uppercase">Promedio</span>
              </div>
          </div>
        </div>

        {/* Ranking List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-800">Ranking de Cumplimiento</h3>
          </div>
          <div className="p-0">
            {chartData.length > 0 ? (
              <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                {chartData.map((item, index) => (
                  <div key={item.name} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-gray-200 text-gray-700' : 
                        index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm md:text-base">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.audits} auditoría(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full hidden sm:block overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${item.score}%`,
                            backgroundColor: getBarColor(item.score) 
                          }} 
                        />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(item.score)}`}>
                        {item.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">Sin datos registrados</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Tendencia General por Área</h3>
        {/* Dynamic height based on data length */}
        <div className="w-full" style={{ height: `${chartHeight}px` }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="score" name="Puntaje" radius={[0, 4, 4, 0]} barSize={30}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                    ))}
                    <LabelList dataKey="score" position="right" formatter={(val: any) => `${val}%`} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#666' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Gráfico vacío
            </div>
          )}
        </div>
      </div>
    </div>
  );
};