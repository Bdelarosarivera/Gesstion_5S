import React, { useState, useEffect } from 'react';
import { ViewState, AuditRecord, ActionItem, AppConfig } from './types';
import { QUESTIONS, AREA_MAPPING, AREAS } from './constants';
import { AuditForm } from './components/AuditForm';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { AIEditor } from './components/AIEditor';
import { ConsolidatedView } from './components/ConsolidatedView';
import { ActionPlanView } from './components/ActionPlanView';
import { SettingsView } from './components/SettingsView';
import { 
  ClipboardList, 
  LayoutDashboard, 
  Plus, 
  FileText, 
  BarChart3, 
  Settings, 
  Home, 
  Camera 
} from 'lucide-react';

// Initial default config based on constants
const DEFAULT_CONFIG: AppConfig = {
  questions: QUESTIONS,
  areas: AREAS,
  responsables: AREA_MAPPING.map(am => ({ name: am.responsable, area: am.area }))
};

const App: React.FC = () => {
  // Default to 'home' as per new design requirement
  const [view, setView] = useState<ViewState>('home');
  
  // State
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  const [editingRecord, setEditingRecord] = useState<AuditRecord | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('audit_records');
    const savedActions = localStorage.getItem('audit_actions');
    const savedConfig = localStorage.getItem('audit_config');

    if (savedRecords) {
      try { setRecords(JSON.parse(savedRecords)); } catch (e) { console.error(e); }
    }
    if (savedActions) {
      try { setActions(JSON.parse(savedActions)); } catch (e) { console.error(e); }
    }
    if (savedConfig) {
      try { 
        const parsedConfig = JSON.parse(savedConfig);
        const existingIds = new Set(parsedConfig.questions.map((q: any) => q.id));
        const questionsToAdd = QUESTIONS.filter(q => !existingIds.has(q.id));
        if (questionsToAdd.length > 0) {
            parsedConfig.questions = [...parsedConfig.questions, ...questionsToAdd];
        }
        setConfig(parsedConfig); 
      } catch (e) { console.error(e); }
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('audit_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('audit_actions', JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
    localStorage.setItem('audit_config', JSON.stringify(config));
  }, [config]);

  const handleSaveAudit = (record: AuditRecord, newActions: ActionItem[]) => {
    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === record.id ? record : r));
      setEditingRecord(null);
    } else {
      setRecords(prev => [record, ...prev]);
      setActions(prev => [...newActions, ...prev]);
      if (newActions.length > 0) {
        alert(`Se han generado ${newActions.length} acciones correctivas automáticamente.`);
      }
    }
    setView('dashboard'); // Redirect to dashboard stats after save
  };

  const handleUpdateAction = (updatedAction: ActionItem) => {
    setActions(prev => prev.map(a => a.id === updatedAction.id ? updatedAction : a));
  };

  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  const handleEdit = (record: AuditRecord) => {
    setEditingRecord(record);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro? Esto NO eliminará las acciones generadas.")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleCancelForm = () => {
    setEditingRecord(null);
    setView('home');
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in py-8">
            <h2 className="text-4xl font-bold text-[#4285F4] text-center mb-8">
              Sistema de Auditoría 5S
            </h2>
            
            <div className="flex flex-col gap-6 w-full max-w-md px-4">
              {/* Button 1: Nueva Auditoría */}
              <button
                onClick={() => { setEditingRecord(null); setView('form'); }}
                className="group relative flex flex-col items-center justify-center bg-[#36C759] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 h-32 w-full"
              >
                <Plus className="w-10 h-10 mb-2" strokeWidth={2.5} />
                <span className="text-xl font-bold tracking-wide">Nueva Auditoría</span>
              </button>

              {/* Button 2: Ver Auditorías */}
              <button
                onClick={() => setView('history')}
                className="group relative flex flex-col items-center justify-center bg-[#4285F4] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 h-32 w-full"
              >
                <ClipboardList className="w-10 h-10 mb-2" strokeWidth={2.5} />
                <span className="text-xl font-bold tracking-wide">Ver Auditorías</span>
              </button>

              {/* Button 3: Dashboard */}
              <button
                onClick={() => setView('dashboard')}
                className="group relative flex flex-col items-center justify-center bg-[#8C47D8] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 h-32 w-full"
              >
                <BarChart3 className="w-10 h-10 mb-2" strokeWidth={2.5} />
                <span className="text-xl font-bold tracking-wide">Dashboard</span>
              </button>

              {/* Button 4: Consolidado */}
              <button
                onClick={() => setView('consolidated')}
                className="group relative flex flex-col items-center justify-center bg-[#F58137] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 h-32 w-full"
              >
                <FileText className="w-10 h-10 mb-2" strokeWidth={2.5} />
                <span className="text-xl font-bold tracking-wide">Consolidado</span>
              </button>
            </div>
          </div>
        );
      case 'form':
        return <AuditForm initialData={editingRecord} config={config} onSave={handleSaveAudit} onCancel={handleCancelForm} />;
      case 'dashboard':
        return <Dashboard records={records} actions={actions} onViewConsolidated={() => setView('consolidated')} onViewActions={() => setView('actions')} />;
      case 'history':
        return <History records={records} actions={actions} onEdit={handleEdit} onDelete={handleDelete} />;
      case 'ai-editor':
        return <AIEditor />;
      case 'consolidated':
        return <ConsolidatedView records={records} onBack={() => setView('home')} />;
      case 'actions':
        return <ActionPlanView actions={actions} onUpdateAction={handleUpdateAction} />;
      case 'settings':
        return <SettingsView config={config} onUpdateConfig={handleUpdateConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Custom Header - Dark Blue */}
      <header className="bg-[#0d1b2a] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          
          {/* Title Left */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setView('home')}
          >
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
               <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-wide hidden sm:block">
              Sistema Auditoría 5S
            </h1>
          </div>

          {/* Navigation Right */}
          <nav className="flex items-center gap-1 md:gap-4">
            <NavButton 
              label="Inicio" 
              active={view === 'home'} 
              onClick={() => setView('home')} 
              icon={<Home className="w-4 h-4" />} 
            />
            <NavButton 
              label="+ Nueva" 
              active={view === 'form'} 
              onClick={() => { setEditingRecord(null); setView('form'); }} 
              icon={<Plus className="w-4 h-4" />} 
            />
            <NavButton 
              label="Lista" 
              active={view === 'history'} 
              onClick={() => setView('history')} 
              icon={<ClipboardList className="w-4 h-4" />} 
            />
            <NavButton 
              label="Dashboard" 
              active={view === 'dashboard'} 
              onClick={() => setView('dashboard')} 
              icon={<BarChart3 className="w-4 h-4" />} 
            />
            <NavButton 
              label="Consolidado" 
              active={view === 'consolidated'} 
              onClick={() => setView('consolidated')} 
              icon={<FileText className="w-4 h-4" />} 
            />
             {/* Extra utils in header but less prominent */}
            <div className="h-6 w-px bg-white/20 mx-1"></div>
            <button 
                onClick={() => setView('settings')}
                className={`p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${view === 'settings' ? 'bg-white/10 text-white' : ''}`}
                title="Configuración"
            >
                <Settings className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setView('ai-editor')}
                className={`p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${view === 'ai-editor' ? 'bg-white/10 text-white' : ''}`}
                title="Cámara IA"
            >
                <Camera className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 pb-20">
        {renderContent()}
      </main>
      
      {/* Footer / Copyright optional but good for layout structure */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} AuditCheck Pro System
      </footer>
    </div>
  );
};

// Header Nav Button Component
const NavButton: React.FC<{
  label: string; 
  active: boolean; 
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col sm:flex-row items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200
      ${active 
        ? 'bg-white/15 text-white font-medium shadow-inner' 
        : 'text-white/80 hover:bg-white/10 hover:text-white'
      }
    `}
  >
    {icon}
    <span className="text-[10px] sm:text-sm">{label}</span>
  </button>
);

export default App;
