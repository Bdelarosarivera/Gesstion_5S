
import React, { useState } from 'react';
import { ActionItem, ActionStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, Search, Save, X, Users, Trash2, Edit2, Eraser } from 'lucide-react';

interface ActionPlanViewProps {
  actions: ActionItem[];
  onUpdateAction: (action: ActionItem) => void;
  onDeleteAction: (actionId: string) => void;
  onClearActions: () => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ actions, onUpdateAction, onDeleteAction, onClearActions }) => {
  const [filterStatus, setFilterStatus] = useState<ActionStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);

  const filteredActions = (actions || []).filter(a => {
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesSearch = 
        (a.area || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.suggestedAction || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.questionText || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.responsable || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusLabel = (status: ActionStatus) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Proceso';
      case 'CLOSED': return 'Cerrado';
    }
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingAction) {
      onUpdateAction(editingAction);
      setEditingAction(null);
    }
  };

  const onConfirmDeleteAction = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Desea eliminar este hallazgo del plan de acción definitivamente?')) {
      onDeleteAction(id);
    }
  };

  const onConfirmClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('ATENCIÓN: ¿Está seguro de eliminar TODOS los planes de acción de la lista? Esta acción no se puede deshacer.')) {
      onClearActions();
    }
  };

  return (
    <div className="space-y-6 mb-24 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Planes de Acción</h2>
          <p className="text-sm text-gray-500">Gestión estratégica de hallazgos críticos.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <button 
                type="button"
                onClick={onConfirmClearAll}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
                <Eraser className="w-3.5 h-3.5" /> Limpiar Todo el Plan
            </button>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-700 bg-[#1e293b] text-white rounded-xl text-xs w-full sm:w-40 focus:ring-blue-500 outline-none"
                />
            </div>
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-700 bg-[#1e293b] text-white rounded-xl text-xs focus:ring-blue-500 outline-none"
            >
                <option value="ALL">Todos</option>
                <option value="PENDING">Pendientes</option>
                <option value="IN_PROGRESS">En Proceso</option>
                <option value="CLOSED">Cerrados</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-black text-red-500">{(actions || []).filter(a => a.status === 'PENDING').length}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pendientes</div>
        </div>
        <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-black text-yellow-500">{(actions || []).filter(a => a.status === 'IN_PROGRESS').length}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">En Proceso</div>
        </div>
        <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-black text-green-500">{(actions || []).filter(a => a.status === 'CLOSED').length}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cerrados</div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredActions.length === 0 ? (
            <div className="text-center py-16 bg-[#1e293b]/50 rounded-3xl border border-gray-800 border-dashed">
                <AlertCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No se registran hallazgos para los filtros aplicados.</p>
            </div>
        ) : (
            filteredActions.map(action => (
                <div key={action.id} className="bg-[#1e293b] rounded-2xl shadow-sm border border-gray-800 overflow-hidden hover:border-gray-700 transition-all">
                    {editingAction?.id === action.id ? (
                        <div className="p-5 space-y-4 bg-blue-900/10 animate-fade-in">
                            <div className="flex justify-between items-center border-b border-blue-500/20 pb-3">
                                <h3 className="font-black text-blue-400 text-xs uppercase tracking-widest">Edición de Tarea Correctiva</h3>
                                <button type="button" onClick={() => setEditingAction(null)} className="text-gray-400 hover:text-white p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Hallazgo Original (Pregunta)</label>
                                <textarea 
                                    value={editingAction.questionText}
                                    onChange={(e) => setEditingAction({...editingAction, questionText: e.target.value})}
                                    className="w-full p-3 border border-gray-700 rounded-xl text-sm bg-[#0f172a] text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Plan de Acción / Resolución</label>
                                <textarea 
                                    value={editingAction.suggestedAction}
                                    onChange={(e) => setEditingAction({...editingAction, suggestedAction: e.target.value})}
                                    className="w-full p-3 border border-gray-700 rounded-xl text-sm bg-[#0f172a] text-white font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Responsable</label>
                                    <input type="text" value={editingAction.responsable} onChange={(e) => setEditingAction({...editingAction, responsable: e.target.value})} className="w-full p-2.5 border border-gray-700 rounded-xl text-sm bg-[#0f172a] text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Compromiso</label>
                                    <input type="date" value={editingAction.dueDate.split('T')[0]} onChange={(e) => setEditingAction({...editingAction, dueDate: new Date(e.target.value).toISOString()})} className="w-full p-2.5 border border-gray-700 rounded-xl text-sm bg-[#0f172a] text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                             <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Estado Operativo</label>
                                <div className="flex gap-2">
                                    {(['PENDING', 'IN_PROGRESS', 'CLOSED'] as ActionStatus[]).map(s => (
                                        <button 
                                          key={s} 
                                          type="button"
                                          onClick={() => setEditingAction({...editingAction, status: s})} 
                                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${editingAction.status === s ? (s === 'CLOSED' ? 'bg-green-600 border-green-600 text-white' : s === 'IN_PROGRESS' ? 'bg-yellow-600 border-yellow-600 text-white' : 'bg-red-600 border-red-600 text-white') : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'}`}
                                        >
                                          {getStatusLabel(s)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="button" onClick={handleSaveEdit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all mt-4"><Save className="w-4 h-4" /> Actualizar Registro</button>
                        </div>
                    ) : (
                        <div className="p-5 flex flex-col md:flex-row gap-5">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${action.status === 'PENDING' ? 'bg-red-500/10 text-red-500' : action.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>{getStatusLabel(action.status)}</span>
                                        <span className="text-[10px] text-gray-600 font-bold">{new Date(action.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-[11px] font-black text-blue-500 uppercase tracking-tighter bg-blue-500/5 px-2 py-0.5 rounded-md border border-blue-500/10">{action.area}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-100 font-semibold mb-2 flex items-start gap-2 leading-relaxed">
                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <span>{action.questionText}</span>
                                    </p>
                                    <div className="text-xs text-gray-400 bg-[#0f172a] p-4 rounded-2xl border border-gray-800 shadow-inner group-hover:border-gray-700 transition-colors">
                                        <p className="font-black text-gray-500 text-[9px] uppercase tracking-[0.2em] mb-2">Plan de Resolución Sugerido:</p>
                                        <span className="text-gray-300 leading-relaxed font-medium">"{action.suggestedAction}"</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 pt-2 font-bold uppercase tracking-tight">
                                    <span className="flex items-center gap-1.5 bg-[#0f172a] px-2 py-1 rounded-md border border-gray-800"><Users className="w-3.5 h-3.5 text-blue-500" /> Resp: {action.responsable}</span>
                                    <span className={`flex items-center gap-1.5 bg-[#0f172a] px-2 py-1 rounded-md border border-gray-800 ${new Date(action.dueDate) < new Date() && action.status !== 'CLOSED' ? 'text-red-500 border-red-500/20 animate-pulse' : ''}`}>
                                        <Clock className="w-3.5 h-3.5" /> Límite: {new Date(action.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex md:flex-col items-stretch justify-center border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-5 gap-2 min-w-[130px]">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setEditingAction(action); }} 
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-xl font-black text-[10px] uppercase hover:bg-blue-500 hover:text-white transition-all"
                                    title="Editar hallazgo y plan"
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> Gestionar
                                </button>
                                <button 
                                    type="button"
                                    onClick={(e) => onConfirmDeleteAction(e, action.id)} 
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all"
                                    title="Eliminar esta acción"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  );
};
