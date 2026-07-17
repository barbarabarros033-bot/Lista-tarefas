import React, { useState } from 'react';
import type { Task, Category, Priority } from '../types';
import { useTasks } from '../context/TaskContext';
import { Calendar, Trash2, Edit3, Check, Clock, AlertCircle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
  const { toggleTaskComplete, deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);

  // Mapeamento de estilos para categorias
  const categoryStyles: Record<Category, { bg: string; text: string; border: string }> = {
    Trabalho: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    Pessoal: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    Estudos: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    Outros: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  };

  // Mapeamento de estilos para prioridades
  const priorityStyles: Record<Priority, { bg: string; text: string; dot: string }> = {
    Alta: { bg: 'bg-red-50 text-red-700', text: 'text-red-700', dot: 'bg-red-500' },
    Média: { bg: 'bg-orange-50 text-orange-700', text: 'text-orange-700', dot: 'bg-orange-500' },
    Baixa: { bg: 'bg-slate-50 text-slate-600', text: 'text-slate-600', dot: 'bg-slate-400' },
  };

  // Formatação de data amigável
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Verificar se a tarefa está atrasada
  const isOverdue = () => {
    if (task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.dueDate + 'T00:00:00');
    return taskDate < today;
  };

  const handleToggle = () => {
    toggleTaskComplete(task.id);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteTask(task.id);
    }, 300); // Aguarda a animação de fade-out
  };

  const catStyle = categoryStyles[task.category] || categoryStyles.Outros;
  const prioStyle = priorityStyles[task.priority] || priorityStyles.Baixa;
  const overdue = isOverdue();

  return (
    <div
      className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 mb-3.5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${
        task.completed
          ? 'opacity-55 border-slate-200 bg-slate-50/50'
          : overdue
          ? 'border-red-100 bg-red-50/5 hover:border-red-200'
          : 'border-slate-100 hover:border-slate-200'
      } ${isDeleting ? 'scale-95 opacity-0 -translate-y-4 duration-300' : ''}`}
    >
      {/* Lado Esquerdo: Checkbox + Título + Tags */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Checkbox Customizado */}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5 ${
            task.completed
              ? 'bg-blue-600 border-blue-600 text-white'
              : overdue
              ? 'border-red-300 hover:border-red-400 hover:bg-red-50/50'
              : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/30'
          }`}
          aria-label={task.completed ? "Desmarcar tarefa" : "Marcar tarefa como concluída"}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Informações da Tarefa */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Tag Categoria */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              {task.category}
            </span>

            {/* Tag Prioridade */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${prioStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${prioStyle.dot}`} />
              {task.priority}
            </span>

            {/* Alerta de Atrasada */}
            {overdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                Atrasada
              </span>
            )}
          </div>

          {/* Título da Tarefa */}
          <h4
            className={`text-base font-semibold leading-tight text-slate-800 break-words ${
              task.completed ? 'line-through text-slate-400 font-medium' : ''
            }`}
          >
            {task.title}
          </h4>

          {/* Descrição (se houver) */}
          {task.description && (
            <p
              className={`text-sm text-slate-500 mt-1 max-w-2xl break-words line-clamp-2 ${
                task.completed ? 'text-slate-400' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Data de Vencimento */}
          <div className="flex items-center gap-1.5 text-xs font-medium mt-2 text-slate-400">
            {overdue ? (
              <div className="flex items-center gap-1 text-red-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Venceu em {formatDate(task.dueDate)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Vence em {formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações (Editar, Excluir) */}
      <div className="flex items-center justify-end gap-1 mt-4 md:mt-0 ml-0 md:ml-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
        {!task.completed && (
          <button
            onClick={() => onEdit(task)}
            className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            title="Editar Tarefa"
          >
            <Edit3 className="w-4.5 h-4.5" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          title="Excluir Tarefa"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};
