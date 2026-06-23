import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronRight, AlertCircle, Clock, CheckCircle2, FileText, Save, Download } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const Inbox = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [search, setSearch] = useState('');
  
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [draftRequest, setDraftRequest] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user, filterPriority, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (user?.es_admin) {
        const queryParams = new URLSearchParams();
        if (filterStatus !== 'Todos') queryParams.append('estado', filterStatus);
        if (filterPriority !== 'Todas') queryParams.append('prioridad', filterPriority);
        data = await apiService.getAdminRequests(queryParams.toString());
      } else {
        data = await apiService.getMyRequests();
        // apply client-side filters for non-admin since endpoint doesn't support query filters according to spec
        if (filterStatus !== 'Todos') {
          data = data.filter((r: any) => r.estado === filterStatus);
        }
        if (filterPriority !== 'Todas') {
          data = data.filter((r: any) => r.prioridad === filterPriority);
        }
      }
      setRequests(data || []);
    } catch (e) {
      console.error(e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = async (req: any | null) => {
    setSelectedRequest(req);
    // 2. Limpieza de estado previo
    setDraftRequest(null);
    setAttachments([]);
    setShowSuccessMessage(false);

    if (!req) {
      return;
    }

    try {
      const details = await apiService.getRequestById(req.id_solicitud);
      setDraftRequest(details);
      
      if (user?.es_admin) {
        try {
          const anexos = await apiService.getAttachments(req.id_solicitud);
          setAttachments(anexos || []);
        } catch (e) {
          console.error("No attachments or error", e);
          setAttachments([]);
        }
      } else {
        setAttachments([]);
      }
    } catch (e) {
      console.error("Error fetching details", e);
      setDraftRequest(JSON.parse(JSON.stringify(req)));
      setAttachments([]);
    }
  };

  const handleDraftChange = (field: string, value: any) => {
    if (draftRequest) {
      setDraftRequest({ ...draftRequest, [field]: value });
      setShowSuccessMessage(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!draftRequest || !user?.es_admin) return;
    setIsSaving(true);
    
    try {
      const updatedRequest = await apiService.updateRequestStatus(draftRequest.id_solicitud, draftRequest.estado);
      
      if (updatedRequest) {
        setRequests(prevRequests => 
          prevRequests.map(r => r.id_solicitud === updatedRequest.id_solicitud ? updatedRequest : r)
        );
        setSelectedRequest(updatedRequest);
        setDraftRequest(updatedRequest);
      } else {
        setRequests(prevRequests => 
          prevRequests.map(r => r.id_solicitud === draftRequest.id_solicitud ? { ...r, estado: draftRequest.estado } : r)
        );
        setSelectedRequest(draftRequest);
      }
      
      setShowSuccessMessage(true);
    } catch (e) {
      console.error(e);
      alert("Error al actualizar el estado. Verifique su conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const term = search.toLowerCase();
    const id = req.id_solicitud?.toString().toLowerCase() || '';
    const desc = req.descripcion?.toLowerCase() || '';
    const title = req.titulo?.toLowerCase() || '';
    return id.includes(term) || desc.includes(term) || title.includes(term);
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-brand-black text-white border-brand-gold';
      case 'Media': return 'bg-brand-beige-dark text-brand-black border-transparent';
      case 'Baja': return 'bg-gray-100 text-brand-gray border-transparent';
      default: return 'bg-gray-100 text-brand-gray border-transparent';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendiente': return <AlertCircle size={16} className="text-brand-gold-dark" />;
      case 'Progreso': return <Clock size={16} className="text-blue-500" />;
      case 'En progreso': return <Clock size={16} className="text-blue-500" />;
      case 'Resuelta': return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 relative">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          selectedRequest ? "hidden md:flex md:w-1/2 lg:w-2/3" : "w-full"
        )}
      >
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-brand-black">Bandeja Inteligente</h2>
            <p className="text-brand-gray mt-1">Gestión y visualización de casos</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar palabra..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none cursor-pointer"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="Todas">Prioridad: Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </header>

        <div className="flex items-center gap-6 border-b border-gray-100 mb-6 px-1">
          {(['Todos', 'Pendiente', 'Progreso', 'Resuelta'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative",
                filterStatus === status 
                  ? "text-brand-black" 
                  : "text-brand-gray hover:text-brand-black"
              )}
            >
              {status === 'Todos' ? 'Todos' : 
               status === 'Pendiente' ? 'Pendientes' :
               status === 'Progreso' ? 'En Proceso' : 'Resueltos'}
              
              {filterStatus === status && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold-dark"
                  initial={false}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {loading ? (
            <div className="p-8 text-center text-brand-gray">Cargando...</div>
          ) : (
            <div className="overflow-y-auto flex-1 p-2">
              <AnimatePresence>
                {filteredRequests.map(req => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={req.id_solicitud}
                    onClick={() => handleSelectRequest(req)}
                    className={cn(
                      "group p-4 mb-2 rounded-xl cursor-pointer border-l-4 transition-all duration-200 hover:bg-brand-light flex items-center justify-between gap-4",
                      selectedRequest?.id_solicitud === req.id_solicitud ? "bg-brand-beige border-l-brand-gold shadow-sm" : "bg-white border-l-transparent hover:border-l-gray-300",
                      req.prioridad === 'Alta' && selectedRequest?.id_solicitud !== req.id_solicitud && "border-l-brand-black"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-sm">REQ-{req.id_solicitud}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border", getPriorityColor(req.prioridad))}>
                          {req.prioridad || 'Media'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                          {getStatusIcon(req.estado)}
                          {req.estado}
                        </span>
                      </div>
                      <p className="text-brand-black font-medium truncate">{req.tipo_solicitud} - {req.titulo}</p>
                      <p className="text-sm text-gray-500 truncate mt-1">{req.descripcion}</p>
                    </div>
                    <div className="text-brand-gray opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} />
                    </div>
                  </motion.div>
                ))}
                {filteredRequests.length === 0 && (
                  <div className="p-8 text-center text-brand-gray">No hay solicitudes que coincidan con los filtros.</div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {draftRequest && (
          <motion.div
            key={draftRequest.id_solicitud} // 3. Uso de KEY para forzar renderizado
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden absolute md:relative z-10 top-0 right-0"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-brand-light">
              <div>
                <h3 className="text-xl font-bold">REQ-{draftRequest.id_solicitud}</h3>
                <p className="text-sm text-gray-500">{new Date(draftRequest.fecha_creacion).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => handleSelectRequest(null)}
                className="text-gray-400 hover:text-brand-black bg-white rounded-full p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {user?.es_admin && (
                  <div className="bg-brand-beige p-5 rounded-2xl space-y-5 border border-brand-gold/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-brand-gold-dark flex items-center justify-center text-white">
                        <CheckCircle2 size={14} />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-brand-black">Administración</h4>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Progreso / Estado</label>
                      <div className="relative">
                        <select 
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 rounded-xl border appearance-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50 font-medium transition-colors",
                            draftRequest.estado === 'Pendiente' ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                            draftRequest.estado === 'Progreso' ? "bg-blue-50 border-blue-200 text-blue-800" :
                            "bg-green-50 border-green-200 text-green-800"
                          )}
                          value={draftRequest.estado}
                          onChange={(e) => handleDraftChange('estado', e.target.value)}
                        >
                          <option value="Pendiente">Pendiente de Revisión</option>
                          <option value="Progreso">En Proceso</option>
                          <option value="Resuelta">Resuelta</option>
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          {getStatusIcon(draftRequest.estado)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Categoría</label>
                        <div className="w-full px-3 py-2 rounded-lg border border-white bg-white text-sm shadow-sm text-brand-black font-medium opacity-70">
                          {draftRequest.tipo_solicitud}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Prioridad</label>
                        <div className="w-full px-3 py-2 rounded-lg border border-white bg-white text-sm shadow-sm text-brand-black font-medium opacity-70">
                          {draftRequest.prioridad || 'Media'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {draftRequest.descripcion !== undefined && draftRequest.descripcion !== null && (
                  <div>
                    <h4 className="font-semibold text-brand-black mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      {draftRequest.titulo}
                    </h4>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-brand-gray text-sm italic leading-relaxed whitespace-pre-wrap">
                        "{draftRequest.descripcion || 'Sin descripción'}"
                      </p>
                    </div>
                  </div>
                )}

                {Array.isArray(attachments) && attachments.length > 0 && user?.es_admin && (
                  <div>
                    <h4 className="font-semibold text-brand-black mb-2 text-sm uppercase tracking-wider text-brand-gold-dark mt-4">Anexos</h4>
                    <div className="space-y-2">
                      {attachments.map((anexo) => (
                        <div key={anexo.id_anexo} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                          <span className="text-sm font-medium text-gray-700">{anexo.nombre_archivo}</span>
                          <button 
                            onClick={() => apiService.downloadAttachment(anexo.id_anexo, anexo.nombre_archivo)}
                            className="text-brand-gold-dark hover:text-brand-black bg-brand-beige px-3 py-1 rounded flex items-center gap-1 text-sm font-medium transition-colors"
                          >
                            <Download size={14} /> Descargar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            {user?.es_admin && (
              <div className="p-4 border-t border-gray-100 bg-white">
                {showSuccessMessage && (
                  <div className="mb-3 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    <span>Cambios guardados con éxito</span>
                  </div>
                )}
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving || (selectedRequest && draftRequest.estado === selectedRequest.estado)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
