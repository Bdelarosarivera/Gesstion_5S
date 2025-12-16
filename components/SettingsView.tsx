import React, { useState } from 'react';
import { AppConfig, Question } from '../types';
import { Plus, Trash2, Save, Settings as SettingsIcon, Users, MapPin, HelpCircle } from 'lucide-react';

interface SettingsViewProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<'areas' | 'responsables' | 'questions'>('areas');
  
  // Local state for inputs
  const [newArea, setNewArea] = useState('');
  const [newResponsable, setNewResponsable] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddArea = () => {
    if (newArea.trim()) {
      onUpdateConfig({
        ...config,
        areas: [...config.areas, newArea.trim().toUpperCase()]
      });
      setNewArea('');
    }
  };

  const handleDeleteArea = (area: string) => {
    if (confirm(`¿Eliminar área ${area}?`)) {
      onUpdateConfig({
        ...config,
        areas: config.areas.filter(a => a !== area)
      });
    }
  };

  const handleAddResponsable = () => {
    if (newResponsable.trim()) {
      onUpdateConfig({
        ...config,
        responsables: [...config.responsables, { name: newResponsable.trim().toUpperCase() }]
      });
      setNewResponsable('');
    }
  };

  const handleDeleteResponsable = (name: string) => {
    if (confirm(`¿Eliminar responsable ${name}?`)) {
      onUpdateConfig({
        ...config,
        responsables: config.responsables.filter(r => r.name !== name)
      });
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const nextId = config.questions.length > 0 
        ? Math.max(...config.questions.map(q => q.id)) + 1 
        : 1;
      
      onUpdateConfig({
        ...config,
        questions: [...config.questions, { id: nextId, text: newQuestion.trim() }]
      });
      setNewQuestion('');
    }
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm(`¿Eliminar pregunta ID ${id}?`)) {
      onUpdateConfig({
        ...config,
        questions: config.questions.filter(q => q.id !== id)
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-24 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
        <div className="bg-gray-200 p-2 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-gray-700" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800">Configuración del Sistema</h2>
            <p className="text-sm text-gray-500">Gestione los parámetros globales de la auditoría.</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('areas')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'areas' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4" /> Áreas
        </button>
        <button
          onClick={() => setActiveTab('responsables')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'responsables' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" /> Responsables
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'questions' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Preguntas
        </button>
      </div>

      <div className="p-6">
        {/* AREAS TAB */}
        {activeTab === 'areas' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Nombre de nueva área..."
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddArea}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
            <ul className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
              {config.areas.map((area) => (
                <li key={area} className="p-3 hover:bg-gray-50 flex justify-between items-center group">
                  <span className="font-medium text-gray-700">{area}</span>
                  <button onClick={() => handleDeleteArea(area)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* RESPONSABLES TAB */}
        {activeTab === 'responsables' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newResponsable}
                onChange={(e) => setNewResponsable(e.target.value)}
                placeholder="Nombre del responsable..."
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddResponsable}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
            <ul className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
              {config.responsables.map((resp) => (
                <li key={resp.name} className="p-3 hover:bg-gray-50 flex justify-between items-center group">
                  <span className="font-medium text-gray-700">{resp.name}</span>
                  <button onClick={() => handleDeleteResponsable(resp.name)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Texto de la nueva pregunta..."
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
            <ul className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
              {config.questions.map((q) => (
                <li key={q.id} className="p-3 hover:bg-gray-50 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {q.id}
                    </span>
                    <span className="text-gray-700 text-sm">{q.text}</span>
                  </div>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
