import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Mail, Phone, Loader2, Save, KeyRound, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Original data
  const [originalData, setOriginalData] = useState<any>(null);

  // Form State
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');

  // Dialog State
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.getProfile();
        setOriginalData(data);
        setNombreCompleto(data.nombre_completo || '');
        setCedula(data.cedula || '');
        setCorreo(data.correo || '');
        setTelefono(data.telefono || '');
      } catch (err) {
        console.error("Error al cargar el perfil", err);
        setMessage({ text: 'Error al cargar los datos del perfil.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const formatCedula = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10, 11)}`;
  };

  const formatTelefono = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 10);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (correo !== originalData.correo) {
      setShowEmailConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    setShowEmailConfirm(false);
    setSaving(true);
    setMessage({ text: '', type: '' });

    const changedData: any = {};
    if (nombreCompleto !== originalData.nombre_completo) changedData.nombre_completo = nombreCompleto;
    if (cedula !== originalData.cedula) changedData.cedula = cedula;
    if (correo !== originalData.correo) changedData.correo = correo;
    if (telefono !== originalData.telefono) changedData.telefono = telefono;

    if (Object.keys(changedData).length === 0) {
      setSaving(false);
      setMessage({ text: 'No se realizaron cambios.', type: 'info' });
      return;
    }

    try {
      await apiService.updateProfile(changedData);
      setMessage({ text: 'Perfil actualizado exitosamente.', type: 'success' });
      setOriginalData({ ...originalData, ...changedData });
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al actualizar el perfil.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const executePasswordReset = async () => {
    setShowPasswordConfirm(false);
    setMessage({ text: '', type: '' });
    try {
      await apiService.forgotPassword(originalData.correo);
      setMessage({ text: 'Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al solicitar el restablecimiento de contraseña.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 mb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden border border-white/40"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-beige via-brand-gold to-brand-beige-dark" />
        
        <header className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-2 tracking-tight">Mi Perfil</h2>
          <p className="text-brand-gray text-base">Actualiza tu información personal y preferencias.</p>
        </header>

        {message.text && (
          <div className={cn(
            "mb-6 p-4 rounded-xl text-sm border",
            message.type === 'error' ? "bg-red-50 text-red-600 border-red-100" : 
            message.type === 'success' ? "bg-green-50 text-green-700 border-green-100" :
            "bg-blue-50 text-blue-700 border-blue-100"
          )}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveClick} className="space-y-6">
          <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-4">Datos de Cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-brand-black">Nombre Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-brand-black">Cédula</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={cedula}
                    onChange={(e) => setCedula(formatCedula(e.target.value))}
                    maxLength={13}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-brand-black">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-brand-black">Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(formatTelefono(e.target.value))}
                    maxLength={12}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all font-mono text-sm"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(true)}
              className="w-full md:w-auto px-6 py-2.5 rounded-full font-medium text-brand-black hover:bg-gray-100 border border-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound size={18} />
              Cambiar contraseña
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto bg-brand-black text-white px-8 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all disabled:opacity-80 flex items-center gap-2 justify-center shadow-md active:scale-95"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Guardar cambios
            </button>
          </div>
        </form>
      </motion.div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showEmailConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEmailConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 text-yellow-600 mb-4">
                <AlertTriangle size={24} />
                <h3 className="font-semibold text-lg text-brand-black">Cambio de correo</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                ¿Estás seguro de que deseas cambiar tu correo electrónico? Tu cuenta quedará desverificada y recibirás un nuevo correo de verificación en la nueva dirección. Deberás verificarla antes de poder iniciar sesión nuevamente.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEmailConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button onClick={executeSave} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-black text-white hover:bg-gray-800 transition-colors">Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}

        {showPasswordConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPasswordConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 text-brand-gold-dark mb-4">
                <KeyRound size={24} />
                <h3 className="font-semibold text-lg text-brand-black">Restablecer contraseña</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                ¿Estás seguro de que deseas restablecer tu contraseña? Se enviará un enlace a tu correo electrónico.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowPasswordConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button onClick={executePasswordReset} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-black text-white hover:bg-gray-800 transition-colors">Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
