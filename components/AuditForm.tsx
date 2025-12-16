import React, { useState, useEffect } from 'react';
import { Rating, Answer, AuditRecord, AppConfig, ActionItem } from '../types';
import { Save, User, MapPin, ClipboardCheck, AlertCircle, UserCircle, Calendar } from 'lucide-react';

interface AuditFormProps {
  initialData?: AuditRecord | null;
  config: AppConfig;
  onSave: (record: AuditRecord, newActions: ActionItem[]) => void;
  onCancel: () => void;
}

export const AuditForm: React.FC<AuditFormProps> = ({ initialData, config, onSave, onCancel }) => {
  const [area, setArea] = useState(config.areas[0] || '');
  const [auditor, setAuditor] = useState('');
  const [responsable, setResponsable] = useState('');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]); // Default to today YYYY-MM-DD
  const [answers, setAnswers] = useState<Record<number, Rating>>({});

  // Initialize data for editing or new form
  useEffect(() => {
    if (initialData) {
      setArea(initialData.area);
      setAuditor(initialData.auditor);
      setResponsable(initialData.responsable || getResponsableForArea(initialData.area));
      setAuditDate(initialData.date.split('T')[0]); // Extract YYYY-MM-DD from ISO string
      const loadedAnswers: Record<number, Rating> = {};
      initialData.answers.forEach(a => {
        loadedAnswers[a.questionId] = a.rating;
      });
      setAnswers(loadedAnswers);
    } else {
      // New form initialization
      if (config.areas.length > 0) {
        const defaultArea = config.areas[0];
        setArea(defaultArea);
        setResponsable(getResponsableForArea(defaultArea));
      }
      setAuditDate(new Date().toISOString().split('T')[0]);
      
      // Load persisting auditor name
      const savedAuditor = localStorage.getItem('last_auditor_name');
      if (savedAuditor) {
        setAuditor(savedAuditor);
      }
    }
  }, [initialData, config]);

  // Update responsable when area changes
  useEffect(() => {
    if (!initialData || (initialData && area !== initialData.area)) {
       setResponsable(getResponsableForArea(area));
    }
  }, [area, initialData]);

  const getResponsableForArea = (areaName: string) => {
    const found = config.responsables.find(r => r.area === areaName);
    return found ? found.name : (config.responsables[0]?.name || '');
  };

  const handleRatingChange = (questionId: number, rating: Rating) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let maxPoints = 0;

    Object.values(answers).forEach(rating => {
      if (rating === Rating.SI) {
        totalPoints += 1;
        maxPoints += 1;
      } else if (rating === Rating.PARCIAL) {
        totalPoints += 0.5;
        maxPoints += 1;
      } else if (rating === Rating.NO) {
        maxPoints += 1;
      }
      // N/A does not contribute to maxPoints
    });

    return maxPoints === 0 ? 0 : Math.round((totalPoints / maxPoints) * 100);
  };

  const currentScore = calculateScore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditor.trim()) {
      alert("Por favor ingrese el nombre del auditor");
      return;
    }

    // Save auditor name for next time
    localStorage.setItem('last_auditor_name', auditor);

    const answerList: Answer[] = Object.entries(answers).map(([qId, rating]) => ({
      questionId: parseInt(qId),
      rating: rating as Rating
    }));

    if (answerList.length !== config.questions.length) {
      if(!confirm("No ha respondido todas las preguntas. ¿Desea guardar de todos modos?")) {
        return;
      }
    }

    const newId = initialData ? initialData.id : crypto.randomUUID();
    
    // Create date ensuring it's interpreted correctly in local time
    // split YYYY-MM-DD and create date object to avoid timezone shifts
    const [year, month, day] = auditDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day); 
    const finalDateISO = dateObj.toISOString();

    const record: AuditRecord = {
      id: newId,
      area,
      auditor,
      responsable,
      date: finalDateISO,
      answers: answerList,
      score: currentScore,
    };

    // Generate Action Items
    const newActions: ActionItem[] = [];
    if (!initialData) { // Only generate actions for new audits to avoid duplicates on edit
        answerList.forEach(ans => {
            if (ans.rating === Rating.NO || ans.rating === Rating.PARCIAL) {
                const q = config.questions.find(q => q.id === ans.questionId);
                if (q) {
                    const dueDate = new Date(dateObj); // Start from audit date
                    dueDate.setDate(dueDate.getDate() + 7); // Default 7 days
                    
                    newActions.push({
                        id: crypto.randomUUID(),
                        auditId: newId,
                        area: area,
                        questionId: q.id,
                        questionText: q.text,
                        issueType: ans.rating === Rating.NO ? 'NO' : 'PARCIAL',
                        suggestedAction: `Corregir hallazgo: "${q.text}"`,
                        responsable: responsable,
                        dueDate: dueDate.toISOString(),
                        status: 'PENDING',
                        createdAt: new Date().toISOString()
                    });
                }
            }
        });
    }

    onSave(record, newActions);
  };

  const getRatingColorClass = (rating: Rating, isSelected: boolean) => {
    if (!isSelected) return 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50';
    switch (rating) {
      case Rating.SI: return 'bg-green-600 border-green-600 text-white shadow-md shadow-green-200';
      case Rating.NO: return 'bg-red-600 border-red-600 text-white shadow-md shadow-red-200';
      case Rating.PARCIAL: return 'bg-yellow-500 border-yellow-500 text-white shadow-md shadow-yellow-200';
      case Rating.NA: return 'bg-gray-600 border-gray-600 text-white';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? 'Editar Auditoría' : 'Nueva Auditoría'}
        </h2>
        <div className={`px-4 py-2 rounded-lg font-bold text-lg border ${
            currentScore >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
            currentScore >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
            'bg-red-50 text-red-700 border-red-200'
        }`}>
            {currentScore}% pts
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Información General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
             {/* Date Selection */}
             <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" /> Fecha de Auditoría
              </label>
              <input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                required
              />
            </div>

            {/* Area Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Área a Auditar
              </label>
              <div className="relative">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 pr-8"
                >
                  {config.areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Responsable Field (Editable but Auto-filled) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-purple-500" /> Responsable del Área
              </label>
              <input
                type="text"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full bg-purple-50 border border-purple-200 text-purple-900 rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-3 font-medium"
                placeholder="Nombre del responsable"
              />
              <p className="text-xs text-gray-400">Se llena automáticamente, pero puede editarlo.</p>
            </div>

            {/* Auditor Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" /> Auditor (Evaluador)
              </label>
              <input
                type="text"
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
                placeholder="Ingrese su nombre completo"
                className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {config.questions.length === 0 ? (
             <div className="p-8 text-center text-gray-500 bg-gray-100 rounded-lg border-dashed border-2 border-gray-300">
                No hay preguntas configuradas. Vaya a Configuración para agregar preguntas.
             </div>
          ) : (
            config.questions.map((q, index) => (
                <div key={q.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                    </span>
                    <p className="text-gray-800 font-medium leading-tight pt-0.5">{q.text}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-2 pl-9">
                    {Object.values(Rating).map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(q.id, rating)}
                        className={`
                        py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-200
                        ${getRatingColorClass(rating, answers[q.id] === rating)}
                        `}
                    >
                        {rating}
                    </button>
                    ))}
                </div>
                </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-4 sticky bottom-20 z-10">
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg font-medium transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Auditoría
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};