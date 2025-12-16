import React, { useState } from 'react';
import { ActionItem, ActionStatus } from '../types';
import { CheckCircle2, Circle, Clock, AlertCircle, Search, Filter, Save, X, Users } from 'lucide-react';

interface ActionPlanViewProps {
  actions: ActionItem[];
  onUpdateAction: (action: ActionItem) => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ actions, onUpdateAction }) => {
  const [filterStatus, setFilterStatus] = useState<ActionStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);

  const filteredActions = actions.filter(a => {
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesSearch = 
        a.area.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.suggestedAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CLOSED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusLabel = (status: ActionStatus) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Proceso';
      case 'CLOSED': return 'Cerrado';
    }
  };

  const handleSaveEdit = () => {
    if (editingAction) {
      onUpdateAction(editingAction);
      setEditingAction(null);
    }
  };

  return (
    <div className="space-y-6 mb-24 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Planes de Acción</h2>
          <p className="text-sm text-gray-500">Gestión de hallazgos y acciones correctivas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-48 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="IN_PROGRESS">En Proceso</option>
                <option value="CLOSED">Cerrados</option>
            </select>
        </div>
      </div>

      {/* Action Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-red-600">{actions.filter(a => a.status === 'PENDING').length}</div>
            <div className="text-xs font-medium text-red-800 uppercase tracking-wide">Pendientes</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-yellow-600">{actions.filter(a => a.status === 'IN_PROGRESS').length}</div>
            <div className="text-xs font-medium text-yellow-800 uppercase tracking-wide">En Proceso</div>
        </div>
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-600">{actions.filter(a => a.status === 'CLOSED').length}</div>
            <div className="text-xs font-medium text-green-800 uppercase tracking-wide">Cerrados</div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-400">No se encontraron acciones.</p>
            </div>
        ) : (
            filteredActions.map(action => (
                <div key={action.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {editingAction?.id === action.id ? (
                        // EDIT MODE
                        <div className="p-4 space-y-4 bg-blue-50">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-blue-900">Editando Acción</h3>
                                <button onClick={() => setEditingAction(null)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500">Acción Correctiva Sugerida</label>
                                <textarea 
                                    value={editingAction.suggestedAction}
                                    onChange={(e) => setEditingAction({...editingAction, suggestedAction: e.target.value})}
                                    className="w-full p-2 border border-blue-200 rounded-md text-sm bg-white text-gray-900"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Responsable</label>
                                    <input 
                                        type="text" 
                                        value={editingAction.responsable}
                                        onChange={(e) => setEditingAction({...editingAction, responsable: e.target.value})}
                                        className="w-full p-2 border border-blue-200 rounded-md text-sm bg-white text-gray-900"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Fecha Compromiso</label>
                                    <input 
                                        type="date" 
                                        value={editingAction.dueDate.split('T')[0]}
                                        onChange={(e) => setEditingAction({...editingAction, dueDate: new Date(e.target.value).toISOString()})}
                                        className="w-full p-2 border border-blue-200 rounded-md text-sm bg-white text-gray-900"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Comentarios</label>
                                <textarea 
                                    value={editingAction.comments || ''}
                                    onChange={(e) => setEditingAction({...editingAction, comments: e.target.value})}
                                    placeholder="Agregar notas de seguimiento..."
                                    className="w-full p-2 border border-blue-200 rounded-md text-sm bg-white text-gray-900"
                                    rows={2}
                                />
                            </div>

                             <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Estado</label>
                                <div className="flex gap-2">
                                    {(['PENDING', 'IN_PROGRESS', 'CLOSED'] as ActionStatus[]).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setEditingAction({...editingAction, status: s})}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                                editingAction.status === s 
                                                ? (s === 'CLOSED' ? 'bg-green-600 text-white' : s === 'IN_PROGRESS' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white')
                                                : 'bg-white text-gray-500 border-gray-300'
                                            }`}
                                        >
                                            {getStatusLabel(s)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveEdit}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Guardar Cambios
                            </button>
                        </div>
                    ) : (
                        // VIEW MODE
                        <div className="p-4 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                            action.status === 'PENDING' ? 'bg-red-100 text-red-700' :
                                            action.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {getStatusLabel(action.status)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(action.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-gray-500">{action.area}</div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-900 font-medium mb-1">
                                        <span className="text-red-500 font-bold mr-1">Hallazgo:</span> 
                                        {action.questionText}
                                    </p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="font-semibold text-gray-700">Acción:</span> {action.suggestedAction}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {action.responsable}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Vence: {new Date(action.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                                {action.comments && (
                                    <div className="text-xs text-gray-500 italic border-l-2 border-blue-200 pl-2 mt-2">
                                        "{action.comments}"
                                    </div>
                                )}
                            </div>

                            <div className="flex md:flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                                <button 
                                    onClick={() => setEditingAction(action)}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                >
                                    Gestionar
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
