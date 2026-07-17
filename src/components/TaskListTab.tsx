import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import type { Task, Category, Priority } from '../types';
import { TaskItem } from './TaskItem';
import { Plus, Search, ArrowUpDown, X, ListTodo, CheckCircle2, Circle, Activity } from 'lucide-react';

export const TaskListTab: React.FC = () => {
  const { tasks, addTask, updateTask } = useTasks();

  // Estados de Filtros e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Pendentes' | 'Concluídas'>('Todas');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [priorityFilter, setPriorityFilter] = useState<string>('Todas');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estados do Formulário (Nova ou Editando)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Trabalho');
  const [priority, setPriority] = useState<Priority>('Média');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Lista de categorias/prioridades para os filtros e formulário
  const categories: Category[] = ['Trabalho', 'Pessoal', 'Estudos', 'Outros'];
  const priorities: Priority[] = ['Alta', 'Média', 'Baixa'];

  // Métricas do Dashboard no topo
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  // Abrir formulário para adicionar
  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('Trabalho');
    setPriority('Média');
    setDueDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  // Abrir formulário para editar
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setIsFormOpen(true);
  };

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate,
      });
    } else {
      addTask(title.trim(), category, priority, dueDate, description.trim() || undefined);
    }

    setIsFormOpen(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
  };

  // Mapear peso da prioridade para ordenação
  const priorityWeight = { Alta: 3, Média: 2, Baixa: 1 };

  // Filtrar e Ordenar tarefas
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Filtro de busca
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filtro de status
        const matchesStatus =
          statusFilter === 'Todas' ||
          (statusFilter === 'Pendentes' && !task.completed) ||
          (statusFilter === 'Concluídas' && task.completed);

        // Filtro de categoria
        const matchesCategory = categoryFilter === 'Todas' || task.category === categoryFilter;

        // Filtro de prioridade
        const matchesPriority = priorityFilter === 'Todas' || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'dueDate') {
          comparison = a.dueDate.localeCompare(b.dueDate);
        } else if (sortBy === 'priority') {
          comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
        } else {
          comparison = a.createdAt.localeCompare(b.createdAt);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [tasks, searchTerm, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* 1. Dashboard de Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Criadas</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.total}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Concluídas</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.completed}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Circle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pendentes</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.pending}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Conclusão</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-800">{metrics.completionRate}%</p>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Ferramentas: Busca, Filtros e Botão Adicionar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        {/* Barra de Busca */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar tarefas pelo título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm placeholder-slate-400 text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controles de Filtros e Ordenação */}
        <div className="flex flex-wrap items-center justify-between w-full lg:w-auto gap-3">
          {/* Categorias Filtro */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm text-slate-600 font-semibold bg-white hover:bg-slate-50 cursor-pointer"
          >
            <option value="Todas">Categorias (Todas)</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Prioridades Filtro */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm text-slate-600 font-semibold bg-white hover:bg-slate-50 cursor-pointer"
          >
            <option value="Todas">Prioridades (Todas)</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Ordenação */}
          <button
            onClick={() => {
              if (sortBy === 'dueDate') {
                setSortBy('priority');
              } else if (sortBy === 'priority') {
                setSortBy('createdAt');
              } else {
                setSortBy('dueDate');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            title="Alterar critério de ordenação"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>
              {sortBy === 'dueDate' ? 'Data' : sortBy === 'priority' ? 'Prioridade' : 'Criação'}
            </span>
          </button>

          {/* Direção da Ordenação */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
          >
            <span className="text-sm font-bold uppercase">{sortOrder}</span>
          </button>

          {/* Botão Novo */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 hover:shadow-lg font-bold text-sm transition-all ml-auto lg:ml-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* 3. Filtros rápidos de Status (Abas Internas) */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        {(['Todas', 'Pendentes', 'Concluídas'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              statusFilter === filter
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* 4. Lista Principal de Tarefas */}
      <div className="space-y-1">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={handleOpenEdit} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-3xl text-center shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
              <ListTodo className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">Nenhuma tarefa encontrada</h4>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              Experimente alterar os filtros de status, categoria ou realizar outra busca para ver suas tarefas.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm transition-all"
            >
              Criar minha primeira tarefa
            </button>
          </div>
        )}
      </div>

      {/* 5. Modal do Formulário de Criação/Edição */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div>
                <label htmlFor="task-title" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Título da Tarefa *
                </label>
                <input
                  id="task-title"
                  type="text"
                  required
                  placeholder="Ex: Finalizar protótipo do dashboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="task-description" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Descrição (opcional)
                </label>
                <textarea
                  id="task-description"
                  placeholder="Adicione detalhes adicionais..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 placeholder-slate-400 resize-none"
                />
              </div>

              {/* Categoria e Prioridade (Grid) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-category" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <select
                    id="task-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm text-slate-700 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task-priority" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Prioridade
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm text-slate-700 bg-white"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label htmlFor="task-due-date" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Data de Conclusão *
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-700"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-colors"
                >
                  {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
