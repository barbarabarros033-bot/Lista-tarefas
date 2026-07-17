import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import type { Task, Category, Priority } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ClipboardList, Clock, CheckCircle, Pencil, Moon } from 'lucide-react';

export const CalendarTab: React.FC = () => {
  const { tasks, toggleDarkMode, toggleTaskComplete, updateTask } = useTasks();
  
  // Estado para o Mês e Ano exibidos
  const [currentDate, setCurrentDate] = useState(new Date());
  // Estado para o Dia Selecionado para detalhamento
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navegar para o mês anterior
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navegar para o próximo mês
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Ir para o mês atual
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Gerar a grade de dias do calendário
  const calendarCells = useMemo(() => {
    const cells: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];
    
    // Primeiro dia da semana do mês atual (ex: 0 = Domingo, 1 = Segunda...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Total de dias no mês atual
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Total de dias no mês anterior
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    // Adicionar dias do mês anterior para preencher a primeira semana
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthTotalDays - i);
      const dateStr = prevDate.toISOString().split('T')[0];
      cells.push({ date: prevDate, isCurrentMonth: false, dateStr });
    }

    // Adicionar dias do mês atual
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      // Garantir formato local correto de data YYYY-MM-DD sem fuso horário
      const yearStr = currDate.getFullYear();
      const monthStr = String(currDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(currDate.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
      cells.push({ date: currDate, isCurrentMonth: true, dateStr });
    }

    // Adicionar dias do próximo mês para completar a grade de 42 células (6 linhas)
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      cells.push({ date: nextDate, isCurrentMonth: false, dateStr });
    }

    return cells;
  }, [year, month]);

  // Agrupar tarefas por data de vencimento
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!map[task.dueDate]) {
        map[task.dueDate] = [];
      }
      map[task.dueDate].push(task);
    });
    return map;
  }, [tasks]);

  // Mapear estilos rápidos das categorias
  const categoryDotColors: Record<Category, string> = {
    Trabalho: 'bg-blue-500',
    Pessoal: 'bg-emerald-500',
    Estudos: 'bg-amber-500',
    Outros: 'bg-purple-500',
  };

  const priorityBadge: Record<Priority, string> = {
    Alta: 'bg-red-50 text-red-700',
    Média: 'bg-orange-50 text-orange-700',
    Baixa: 'bg-slate-100 text-slate-600',
  };

  // Detalhamento de tarefas do dia selecionado
  const selectedDayTasks = tasksByDate[selectedDateStr] || [];

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-');
    return `${d} de ${monthNames[parseInt(m) - 1]} de ${y}`;
  }, [selectedDateStr]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Grade do Calendário (Ocupa 2 colunas) */}
      <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
        {/* Cabeçalho do Calendário */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5.5 h-5.5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">
              {monthNames[month]} de {year}
            </h2>
            <button
              onClick={toggleDarkMode}
              className="flex items-center p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Alternar modo escuro"
            >
              <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hoje
            </button>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={prevMonth}
                className="p-2 text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 text-slate-600 hover:bg-slate-50 border-l border-slate-200 transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Nome dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Grade de Dias */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell, index) => {
            const dayTasks = tasksByDate[cell.dateStr] || [];
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDateStr;
            
            // Separar concluídas e pendentes
            const pendingTasks = dayTasks.filter(t => !t.completed);
            const hasCompletedOnly = dayTasks.length > 0 && pendingTasks.length === 0;

            return (
              <button
                key={index}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`relative flex flex-col items-center justify-between min-h-[70px] p-1.5 rounded-2xl border transition-all cursor-pointer ${
                  !cell.isCurrentMonth
                    ? 'text-slate-300 border-transparent hover:bg-slate-50/50'
                    : isToday
                    ? 'border-blue-200 bg-blue-50/10 hover:bg-blue-50/20'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50/20'
                    : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                }`}
              >
                {/* Número do Dia */}
                <span
                  className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isSelected
                      ? 'text-blue-600 font-extrabold'
                      : 'text-slate-700'
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                {/* Indicadores de Tarefas */}
                <div className="flex flex-wrap justify-center gap-1 w-full mt-1.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        task.completed
                          ? 'bg-slate-300'
                          : categoryDotColors[task.category] || 'bg-slate-400'
                      }`}
                      title={task.title}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] font-extrabold text-slate-400 leading-none">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>

                {/* Destaque se todas do dia estão completas */}
                {hasCompletedOnly && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhamento do Dia Selecionado (Ocupa 1 coluna) */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col h-full min-h-[350px]">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
          Tarefas do Dia
        </h3>
        <p className="text-sm text-slate-700 font-semibold mb-4 pb-3 border-b border-slate-100">
          {formattedSelectedDate}
        </p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {selectedDayTasks.length > 0 ? (
            selectedDayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-slate-50/50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      task.completed ? 'bg-slate-100 text-slate-400' : priorityBadge[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {task.category}
                  </span>
                </div>
                <h4
                  className={`text-sm font-bold text-slate-800 leading-tight break-words ${
                    task.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 break-words">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                  {/* Botão de marcar concluída */}
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="flex items-center gap-1 text-emerald-500 hover:text-emerald-600"
                    title="Alternar concluída"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  {/* Botão de editar título */}
                  <button
                    onClick={() => {
                      const newTitle = prompt('Editar título', task.title);
                      if (newTitle !== null && newTitle.trim() !== '' && newTitle !== task.title) {
                        updateTask(task.id, { title: newTitle.trim() });
                      }
                    }}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
                    title="Editar título"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {/* Status textual */}
                  <div className="flex items-center gap-1">
                    {task.completed ? (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Concluída
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5" />
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Nenhum compromisso</p>
              <p className="text-xs text-slate-400 max-w-[180px] mx-auto mt-0.5">
                Não há tarefas agendadas para esta data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
