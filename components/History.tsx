import React from 'react';
import { AuditRecord, ActionItem } from '../types';
import { QUESTIONS } from '../constants'; // Fallback only
import * as XLSX from 'xlsx';
import { Edit2, Trash2, Download, FileSpreadsheet, Calendar, User, MapPin } from 'lucide-react';

interface HistoryProps {
  records: AuditRecord[];
  actions: ActionItem[];
  onEdit: (record: AuditRecord) => void;
  onDelete: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ records, actions, onEdit, onDelete }) => {
  
  const handleExportExcel = () => {
    // 1. Audit Data Sheet
    const auditData = records.map(r => {
      const row: any = {
        'ID Auditoría': r.id.substring(0, 8),
        'Fecha': new Date(r.date).toLocaleString(),
        'Área': r.area,
        'Responsable': r.responsable || 'N/A',
        'Auditor': r.auditor,
        'Puntaje': `${r.score}%`
      };
      
      // Add answers (Note: this relies on the question IDs stored in the answer. 
      // If questions change in config, the ID link remains, but text might differ if not looked up from current config.
      // For export, we just list "P{id}" if text not found, or use the stored Answer ID.)
      r.answers.forEach(a => {
        row[`Pregunta ${a.questionId}`] = a.rating;
      });
      
      return row;
    });

    // 2. Action Plan Sheet
    const actionData = actions.map(a => ({
        'ID Acción': a.id.substring(0, 8),
        'ID Auditoría': a.auditId.substring(0, 8),
        'Fecha Creación': new Date(a.createdAt).toLocaleDateString(),
        'Área': a.area,
        'Hallazgo': a.questionText,
        'Tipo': a.issueType,
        'Acción Sugerida': a.suggestedAction,
        'Responsable': a.responsable,
        'Fecha Compromiso': new Date(a.dueDate).toLocaleDateString(),
        'Estado': a.status === 'PENDING' ? 'Pendiente' : a.status === 'IN_PROGRESS' ? 'En Proceso' : 'Cerrado',
        'Comentarios': a.comments || ''
    }));

    const wb = XLSX.utils.book_new();

    const wsAudits = XLSX.utils.json_to_sheet(auditData);
    XLSX.utils.book_append_sheet(wb, wsAudits, "Resultados Auditoría");

    const wsActions = XLSX.utils.json_to_sheet(actionData);
    XLSX.utils.book_append_sheet(wb, wsActions, "Plan de Acción");

    XLSX.writeFile(wb, "Reporte_Integral_5S.xlsx");
  };

  const getScoreBadge = (score: number) => {
    let colorClass = '';
    if (score >= 90) colorClass = 'bg-green-100 text-green-800 border-green-200';
    else if (score >= 70) colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    else colorClass = 'bg-red-100 text-red-800 border-red-200';

    return (
      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border ${colorClass}`}>
        {score}%
      </span>
    );
  };

  return (
    <div className="space-y-6 mb-24 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Historial</h2>
          <p className="text-sm text-gray-500">{records.length} auditorías registradas</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar Reporte Integral
        </button>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay registros</h3>
            <p className="text-gray-500 mt-1">Comience una nueva auditoría para ver los datos aquí.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {record.area}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.responsable || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.auditor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getScoreBadge(record.score)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => onEdit(record)}
                            className="text-blue-600 hover:text-blue-900 mr-4 transition-colors" 
                            title="Editar"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => onDelete(record.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

           {/* Mobile Card View */}
           <div className="grid grid-cols-1 gap-4 sm:hidden">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${
                    record.score >= 90 ? 'bg-green-500' : record.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                
                <div className="flex justify-between items-start pl-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{record.area}</h3>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                  {getScoreBadge(record.score)}
                </div>

                <div className="pl-3 grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-gray-400 font-semibold">Responsable</span>
                        <span className="font-medium truncate">{record.responsable || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-gray-400 font-semibold">Auditor</span>
                        <span className="font-medium truncate">{record.auditor}</span>
                    </div>
                </div>

                <div className="pl-3 flex justify-end gap-3 border-t border-gray-100 pt-3">
                    <button 
                        onClick={() => onEdit(record)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                    >
                        <Edit2 className="w-4 h-4 mr-1" /> Editar
                    </button>
                    <button 
                        onClick={() => onDelete(record.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center"
                    >
                        <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                    </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
