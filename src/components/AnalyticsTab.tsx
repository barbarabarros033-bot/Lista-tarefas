import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import type { Category, Priority } from '../types';
import { PieChart, AlertTriangle, CheckCircle, BarChart3, Sparkles } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { tasks } = useTasks();

  const analyticsData = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Atrasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter((t) => {
      if (t.completed) return false;
      const taskDate = new Date(t.dueDate + 'T00:00:00');
      return taskDate < today;
    }).length;

    // Distribuição por categoria
    const categoryCount: Record<Category, number> = {
      Trabalho: 0,
      Pessoal: 0,
      Estudos: 0,
      Outros: 0,
    };
    tasks.forEach((t) => {
      if (categoryCount[t.category] !== undefined) {
        categoryCount[t.category]++;
      }
    });

    // Distribuição por prioridade
    const priorityCount: Record<Priority, number> = {
      Alta: 0,
      Média: 0,
      Baixa: 0,
    };
    tasks.forEach((t) => {
      if (priorityCount[t.priority] !== undefined) {
        priorityCount[t.priority]++;
      }
    });

    // Categoria mais frequente
    let topCategory: Category = 'Trabalho';
    let maxCatVal = -1;
    (Object.keys(categoryCount) as Category[]).forEach((cat) => {
      if (categoryCount[cat] > maxCatVal) {
        maxCatVal = categoryCount[cat];
        topCategory = cat;
      }
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      overdue,
      categoryCount,
      priorityCount,
      topCategory: total > 0 ? topCategory : 'Nenhuma',
    };
  }, [tasks]);

  // Constantes para o Gráfico de Rosca (Donut Chart) SVG
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference * (1 - analyticsData.completionRate / 100);

  // Mapeamento de estilos para o gráfico de barras por categoria
  const catColors: Record<Category, { bar: string; text: string; bg: string }> = {
    Trabalho: { bar: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
    Pessoal: { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    Estudos: { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
    Outros: { bar: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
  };

  // Mapeamento para prioridades
  const prioColors: Record<Priority, { bar: string; text: string; bg: string }> = {
    Alta: { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
    Média: { bar: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
    Baixa: { bar: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' },
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-3xl text-center shadow-sm">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
          <PieChart className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-slate-800 mb-1">Sem dados de análise disponíveis</h4>
        <p className="text-sm text-slate-400 max-w-sm">
          Adicione e gerencie suas tarefas primeiro para visualizar suas estatísticas de produtividade.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid de Métricas Avançadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Taxa de Conclusão */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Taxa de Conclusão</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Gráfico Donut SVG */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-100 fill-none"
                strokeWidth="12"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-800">{analyticsData.completionRate}%</span>
              <span className="text-xs font-semibold text-slate-400">Eficiência</span>
            </div>
          </div>

          <div className="flex justify-between w-full mt-4 text-xs font-semibold border-t border-slate-50 pt-4">
            <div className="text-center flex-1 border-r border-slate-100">
              <p className="text-slate-400">Pendente</p>
              <p className="text-base font-bold text-slate-700">{analyticsData.pending}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-slate-400">Concluído</p>
              <p className="text-base font-bold text-slate-700">{analyticsData.completed}</p>
            </div>
          </div>
        </div>

        {/* Resumo de Produtividade */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Insights</h3>
          
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tarefas Atrasadas</p>
              <p className="text-lg font-bold text-slate-800">{analyticsData.overdue}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Foco Principal</p>
              <p className="text-lg font-bold text-slate-800">{analyticsData.topCategory}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance Global</p>
              <p className="text-lg font-bold text-slate-800">
                {analyticsData.completionRate >= 80
                  ? 'Excelente'
                  : analyticsData.completionRate >= 50
                  ? 'Moderada'
                  : 'Precisa Focar'}
              </p>
            </div>
          </div>
        </div>

        {/* Distribuição de Prioridades */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Distribuição por Prioridade</h3>
            <div className="space-y-4">
              {(Object.keys(analyticsData.priorityCount) as Priority[]).map((prio) => {
                const count = analyticsData.priorityCount[prio];
                const pct = analyticsData.total > 0 ? Math.round((count / analyticsData.total) * 100) : 0;
                const colors = prioColors[prio];

                return (
                  <div key={prio} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${colors.bar}`} />
                        {prio}
                      </span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras SVG Horizontal por Categoria */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          Tarefas por Categoria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lado Esquerdo: Lista detalhada */}
          <div className="space-y-4">
            {(Object.keys(analyticsData.categoryCount) as Category[]).map((cat) => {
              const count = analyticsData.categoryCount[cat];
              const pct = analyticsData.total > 0 ? Math.round((count / analyticsData.total) * 100) : 0;
              const colors = catColors[cat];

              return (
                <div key={cat} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/20">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-lg ${colors.bar}`} />
                    <span className="text-sm font-semibold text-slate-700">{cat}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{count}</span>
                    <span className="text-xs text-slate-400 font-semibold ml-1.5">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lado Direito: Gráfico de Barras Visual */}
          <div className="flex flex-col justify-center space-y-4">
            {(Object.keys(analyticsData.categoryCount) as Category[]).map((cat) => {
              const count = analyticsData.categoryCount[cat];
              const pct = analyticsData.total > 0 ? Math.round((count / analyticsData.total) * 100) : 0;
              const colors = catColors[cat];

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>{cat}</span>
                    <span className="font-bold text-slate-700">{count} tarefas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
