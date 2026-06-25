import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Scale, ArrowRight, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthModal } from '../components/AuthModal';

export const Landing: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentObjIndex, setCurrentObjIndex] = useState(0);

  const objectives = [
    {
      title: "Optimizar la gestión ciudadana",
      description: "Reducir la carga operativa de las instituciones dominicanas mediante la automatización inteligente de la clasificación y priorización de solicitudes ciudadanas."
    },
    {
      title: "Aplicar inteligencia artificial al servicio público",
      description: "Integrar modelos de lenguaje natural para analizar, categorizar y priorizar solicitudes en categorías como Petición, Queja, Sugerencia, Reclamo y Denuncia."
    },
    {
      title: "Garantizar accesibilidad digital",
      description: "Ofrecer una plataforma web intuitiva y accesible que permita a cualquier ciudadano dominicano registrar y dar seguimiento a sus solicitudes desde cualquier dispositivo."
    }
  ];

  const nextObj = () => setCurrentObjIndex((prev) => (prev + 1) % objectives.length);
  const prevObj = () => setCurrentObjIndex((prev) => (prev - 1 + objectives.length) % objectives.length);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans selection:bg-yellow-200 selection:text-gray-900">
      {/* Navigation */}
      <nav className="absolute top-0 w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="GovTech Icon" className="h-10 object-contain drop-shadow-sm mix-blend-multiply" />
          <span className="text-2xl font-bold text-gray-900 tracking-tight">GovTech</span>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2"
        >
          Iniciar Sesión
        </button>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 lg:pt-48 lg:pb-32">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-600/10 text-yellow-800 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-600"></span>
              </span>
              Portal Ciudadano Inteligente
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Hacia un Estado más <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800">rápido</span>, atento y transparente.
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
              Conectando la ciudadanía con soluciones eficientes a través de Inteligencia Artificial. Simplificamos tus trámites para que recuperes tu tiempo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="group flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gray-900/20"
              >
                Acceder al Portal
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-medium transition-all active:scale-[0.98]"
              >
                Conocer más
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 to-white rounded-[3rem] blur-3xl opacity-50"></div>
            <div className="relative bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-2xl shadow-gray-200/50">
              <div className="space-y-6">
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-50 text-yellow-600 shrink-0">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Clasificación Inmediata</h4>
                    <p className="text-sm text-gray-500">IA que analiza y categoriza en milisegundos.</p>
                  </div>
                </div>
                
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-start gap-4 transform translate-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 text-gray-900 shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Totalmente Seguro</h4>
                    <p className="text-sm text-gray-500">Tus datos están protegidos y encriptados.</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 text-gray-900 shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Conexión Institucional</h4>
                    <p className="text-sm text-gray-500">Comunicación directa con los ministerios.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Pilares</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Tecnología de vanguardia diseñada para mejorar la experiencia tanto de ciudadanos como de operadores institucionales.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-xl hover:shadow-gray-200/50"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-gray-900">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clasificación Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos procesamiento de lenguaje natural avanzado para entender y categorizar automáticamente cada solicitud ciudadana.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-xl hover:shadow-gray-200/50"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-gray-900">
                <Scale size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Priorización Equitativa</h3>
              <p className="text-gray-600 leading-relaxed">
                Detección inteligente de casos urgentes y vulnerables para asegurar una atención justa, oportuna y sin discriminación.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-xl hover:shadow-gray-200/50"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-gray-900">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestión Transparente</h3>
              <p className="text-gray-600 leading-relaxed">
                Trazabilidad total en cada paso del proceso, optimizando el tiempo y los recursos de las instituciones públicas.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Objetivos</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Lo que buscamos lograr con esta plataforma</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-8 md:px-16">
            <div className="min-h-[200px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentObjIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="w-full p-8 rounded-3xl bg-white border border-gray-100 transition-all hover:shadow-xl hover:shadow-gray-200/50"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{objectives[currentObjIndex].title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {objectives[currentObjIndex].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <button 
              onClick={prevObj}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors z-10 focus:outline-none"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextObj}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors z-10 focus:outline-none"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {objectives.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentObjIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all focus:outline-none ${idx === currentObjIndex ? 'bg-yellow-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Ir al objetivo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};
