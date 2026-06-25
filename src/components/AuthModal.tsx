import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (view === 'login') {
        await login({ correo, contrasena });
        onClose();
        window.location.href = '/dashboard';
      } else {
        if (contrasena !== confirmar) {
          throw new Error('Las contraseñas no coinciden');
        }
        await register({
          correo,
          nombre_completo: nombreCompleto,
          contrasena,
          cedula,
          telefono
        });
        setSuccessMsg('Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta antes de iniciar sesión.');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('403') || err.message.toLowerCase().includes('verif'))) {
        setError('Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.');
      } else {
        setError(err.message || 'Ocurrió un error. Verifique sus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              {view === 'login' ? 'Acceder al Sistema' : 'Crear una nueva cuenta'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'signup' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="Juan Pérez"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Cédula</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={cedula}
                        onChange={(e) => setCedula(formatCedula(e.target.value))}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="000-0000000-0"
                        maxLength={13}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(formatTelefono(e.target.value))}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="809-000-0000"
                        maxLength={12}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  {view === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        onClose();
                        navigate('/forgot-password');
                      }}
                      className="text-xs font-medium text-yellow-700 hover:text-yellow-800 transition-colors"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {view === 'signup' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmar}
                        onChange={(e) => setConfirmar(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex items-start pt-2">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        required
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-600 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-500 cursor-pointer">
                      Acepto los términos de servicio y políticas de privacidad del portal.
                    </label>
                  </div>
                </>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                  {successMsg}
                </div>
              )}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                  {view === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {view === 'login' ? '¿No tiene una cuenta? ' : '¿Ya tiene una cuenta? '}
                <button
                  onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                  className="font-semibold text-gray-900 hover:underline focus:outline-none"
                >
                  {view === 'login' ? 'Regístrese aquí' : 'Inicie sesión aquí'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
