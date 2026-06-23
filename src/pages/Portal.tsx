import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle, UploadCloud, Paperclip, X } from 'lucide-react';
import { apiService } from '../services/apiService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const Portal = () => {
  // Form State
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCedula = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10, 11)}`;
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCedula(formatCedula(e.target.value));
    if (errors.cedula) setErrors(prev => ({ ...prev, cedula: '' }));
  };

  const formatTelefono = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 10);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefono(formatTelefono(e.target.value));
    if (errors.telefono) setErrors(prev => ({ ...prev, telefono: '' }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir el selector de archivos
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!cedula.trim()) newErrors.cedula = "La Cédula de Identidad es obligatoria.";
    if (!nombre.trim()) newErrors.nombre = "El Nombre Completo es obligatorio.";
    if (!telefono.trim()) newErrors.telefono = "El Número de Teléfono es obligatorio.";
    if (!text.trim()) newErrors.text = "Debe describir su solicitud o situación.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '') || '';
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let anexos = [];
      if (file) {
        const b64 = await fileToBase64(file);
        anexos.push({
          nombre_archivo: file.name,
          archivo_base64: b64
        });
      }

      await apiService.createRequest({
        titulo: `Solicitud de ${nombre}`,
        descripcion: text,
        anexos: anexos.length > 0 ? anexos : undefined
      });
      
      setSuccess(true);
    } catch (error) {
      console.error("Failed to create request", error);
      alert("Error al enviar la solicitud. Verifique su conexión e intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setText('');
    setCedula('');
    setNombre('');
    setTelefono('');
    setEmail('');
    setFile(null);
    setErrors({});
    setSuccess(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 mb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden border border-white/40"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-beige via-brand-gold to-brand-beige-dark" />
        
        <header className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-2 tracking-tight">Reporte Ciudadano</h2>
          <p className="text-brand-gray text-base">Complete el siguiente formulario para registrar su solicitud.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          
          {/* 1. BLOQUE DE DATOS PERSONALES */}
          <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-4">1. Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-brand-black mb-1">Cédula de Identidad <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="000-0000000-0"
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all text-brand-black placeholder-gray-400 font-mono text-sm",
                    errors.cedula ? "border-red-400 focus:ring-red-400/50" : "border-gray-200 focus:ring-brand-gold/50"
                  )}
                  value={cedula}
                  onChange={handleCedulaChange}
                  disabled={isSubmitting}
                  maxLength={13}
                />
                {errors.cedula && <p className="mt-1 text-xs text-red-500">{errors.cedula}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Ej: Juan Pérez"
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all text-brand-black placeholder-gray-400",
                    errors.nombre ? "border-red-400 focus:ring-red-400/50" : "border-gray-200 focus:ring-brand-gold/50"
                  )}
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors(prev => ({ ...prev, nombre: '' }));
                  }}
                  disabled={isSubmitting}
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-1">Número de Teléfono <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  placeholder="809-000-0000"
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all text-brand-black placeholder-gray-400 font-mono text-sm",
                    errors.telefono ? "border-red-400 focus:ring-red-400/50" : "border-gray-200 focus:ring-brand-gold/50"
                  )}
                  value={telefono}
                  onChange={handleTelefonoChange}
                  disabled={isSubmitting}
                  maxLength={12}
                />
                {errors.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-1">
                  Correo Electrónico <span className="text-gray-400 font-normal italic">(Opcional)</span>
                </label>
                <input 
                  type="email" 
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all text-brand-black placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* 2. BLOQUE DEL REPORTE */}
          <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-4">2. Detalle del Reporte</h3>
            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Describa su solicitud o situación <span className="text-red-500">*</span></label>
              <textarea 
                className={cn(
                  "w-full h-32 p-4 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all resize-none text-brand-black placeholder-gray-400",
                  errors.text ? "border-red-400 focus:ring-red-400/50" : "border-gray-200 focus:ring-brand-gold/50"
                )}
                placeholder="Ej: Llevamos tres semanas sin agua y la situación es insoportable..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (errors.text) setErrors(prev => ({ ...prev, text: '' }));
                }}
                disabled={isSubmitting}
              />
              {errors.text && <p className="mt-1 text-xs text-red-500">{errors.text}</p>}
            </div>
          </div>

          {/* 3. BLOQUE DE EVIDENCIA */}
          <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-4">3. Evidencia</h3>
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isSubmitting && !file && fileInputRef.current?.click()}
              className={cn(
                "w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all",
                isDragging ? "border-brand-gold bg-brand-beige/50" : "border-gray-200",
                !file && !isSubmitting ? "hover:border-brand-gold hover:bg-brand-light cursor-pointer" : "",
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              
              {file ? (
                <div className="w-full flex items-center justify-between bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-beige rounded-full flex items-center justify-center text-brand-gold-dark shrink-0">
                      <Paperclip size={20} />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="font-medium text-sm text-brand-black truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isSubmitting}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                    title="Eliminar archivo"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-brand-gray pointer-events-none">
                  <div className="w-12 h-12 bg-brand-beige rounded-full flex items-center justify-center text-brand-gold-dark mb-3 transition-transform group-hover:scale-110">
                    <UploadCloud size={24} />
                  </div>
                  <p className="font-medium text-brand-black text-sm">Adjuntar evidencia (Fotos o Documentos)</p>
                  <p className="text-xs text-gray-500 mt-1">Arrastra tus archivos aquí o haz clic para buscar</p>
                </div>
              )}
            </div>
          </div>

          {/* 4. ACCIÓN Y ENVÍO */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-black text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-all disabled:opacity-80 flex items-center gap-3 w-full md:w-auto justify-center shadow-md hover:shadow-lg active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Procesando con IA...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </form>

        {/* MODAL DE ÉXITO ESTILIZADO */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center text-center p-8"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-beige via-brand-gold to-brand-beige-dark" />
              
              <motion.div 
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0, transition: { type: 'spring', damping: 15, delay: 0.1 } }}
                className="w-24 h-24 bg-brand-beige rounded-full flex items-center justify-center text-brand-gold-dark mb-8 shadow-sm border border-brand-gold/20"
              >
                <CheckCircle size={48} strokeWidth={1.5} />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className="text-3xl font-bold text-brand-black mb-4 tracking-tight"
              >
                Solicitud Registrada Exitosamente
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                className="text-brand-gray text-lg max-w-md mb-10 leading-relaxed"
              >
                Su reporte ha sido recibido por nuestro sistema de Inteligencia Artificial. Se le ha asignado una categoría y prioridad automática para su pronta revisión institucional.
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                onClick={handleResetForm}
                className="bg-brand-beige hover:bg-[#e6ddc5] text-brand-gold-dark border border-brand-gold/30 px-8 py-3.5 rounded-full font-medium transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
              >
                Crear un nuevo reporte
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
