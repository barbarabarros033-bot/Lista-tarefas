import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import type { Tab } from '../types';
import { CheckSquare, BarChart2, Calendar, LogOut, User, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, user, logout } = useTasks();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tasks', label: 'Tarefas', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'analytics', label: 'Análises', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendário', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <CheckSquare className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Task<span className="text-blue-600">Flow</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navigation.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User Profile & Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-400 font-medium">Conta ativa</p>
                    <p className="text-sm text-slate-700 font-semibold leading-3">{user.name}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Sair da conta"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-2">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner animate-in slide-in-from-top duration-200">
            {navigation.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 mt-2 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-800 font-semibold">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Deseja realmente sair?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Sua sessão simulada será encerrada. Suas tarefas continuarão salvas no LocalStorage deste navegador.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/10 transition-all"
              >
                Confirmar Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
