import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Send, Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, adminOnly: true },
    { to: '/dashboard/inbox', label: 'Bandeja de Entrada', icon: <Inbox size={20} /> },
    { to: '/dashboard/portal', label: 'Portal Ciudadano', icon: <Send size={20} /> },
  ].filter(link => !link.adminOnly || user?.es_admin);

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-sm border border-gray-100 text-brand-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>

      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <img src="/logo-icon.png" alt="GovTech Icon" className="h-8 object-contain drop-shadow-sm mix-blend-multiply" />
          <h1 className="font-semibold text-xl tracking-tight text-brand-black">GovTech</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-beige text-brand-gold-dark" 
                  : "text-brand-gray hover:bg-gray-50 hover:text-brand-black"
              )}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <NavLink
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
              isActive 
                ? "bg-brand-beige text-brand-gold-dark" 
                : "text-brand-gray hover:bg-gray-50 hover:text-brand-black"
            )}
          >
            <User size={20} className={cn("transition-colors", window.location.pathname === '/dashboard/profile' ? "text-brand-gold-dark" : "text-gray-500")} />
            Mi Perfil
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-brand-black hover:bg-gray-50 transition-all opacity-80 hover:opacity-100 focus:outline-none"
          >
            <LogOut size={20} className="text-gray-500" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
