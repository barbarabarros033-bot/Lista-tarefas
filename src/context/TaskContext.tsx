import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Task, Tab, Category, Priority } from '../types';

interface User {
  email: string;
}

interface TaskContextType {
  tasks: Task[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addTask: (title: string, category: Category, priority: Priority, dueDate: string, description?: string) => void;
  updateTask: (id: string, updatedFields: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Tarefas iniciais padrão caso o localStorage esteja vazio, para o usuário ver dados de imediato
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Planejar sprint do projeto Antigravity',
    description: 'Definir as principais atividades da equipe e os marcos de entrega.',
    category: 'Trabalho',
    priority: 'Alta',
    dueDate: new Date().toISOString().split('T')[0], // Hoje
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Comprar mantimentos para a semana',
    description: 'Ir ao mercado e focar em opções saudáveis.',
    category: 'Pessoal',
    priority: 'Média',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Estudar conceitos de React Server Components',
    description: 'Ler a documentação oficial e fazer um protótipo simples.',
    category: 'Estudos',
    priority: 'Média',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Depois de amanhã
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Treino de corrida de 5km',
    category: 'Pessoal',
    priority: 'Baixa',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  }
];

// Converte Task (camelCase) para o formato do banco (snake_case)
const toDb = (task: Partial<Task>) => ({
  ...(task.id !== undefined && { id: task.id }),
  ...(task.title !== undefined && { title: task.title }),
  ...(task.description !== undefined && { description: task.description }),
  ...(task.category !== undefined && { category: task.category }),
  ...(task.priority !== undefined && { priority: task.priority }),
  ...(task.dueDate !== undefined && { due_date: task.dueDate }),
  ...(task.completed !== undefined && { completed: task.completed }),
  ...(task.createdAt !== undefined && { created_at: task.createdAt }),
});

// Converte linha do banco (snake_case) para Task (camelCase)
const fromDb = (row: any): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  priority: row.priority,
  dueDate: row.due_date,
  completed: row.completed,
  createdAt: row.created_at,
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Autenticação anônima e carregamento inicial de tarefas do Supabase
  // Carregar usuário autenticado ao montar o provider
  useEffect(() => {
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      if (data.session) {
        const newUser = { email: data.session.user.email } as any;
        setUser(newUser);
        localStorage.setItem('premium_todo_user', JSON.stringify(newUser));
      }
    });
    // Carregar tarefas do Supabase
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        setTasks(INITIAL_TASKS);
      } else {
        setTasks((data ?? []).map(fromDb));
      }
    };
    fetchTasks();
    // Carregar preferências de dark mode do localStorage (mantido)
    const storedDark = localStorage.getItem('premium_todo_dark');
    if (storedDark) {
      setDarkMode(storedDark === 'true');
    }
  }, []);

  // Aplicar/remover classe 'dark' no elemento root quando darkMode mudar
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('premium_todo_dark', String(darkMode));
  }, [darkMode]);

  // Atualizar estado local de tarefas (sem localStorage)
  const setLocalTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  // Autenticação local e Supabase (email e senha)
  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Verificar credencial padrão (admin@taskflow.com / admin123)
    if (trimmedEmail === 'admin@taskflow.com' && trimmedPassword === 'admin123') {
      const newUser = { email: trimmedEmail } as any;
      setUser(newUser);
      localStorage.setItem('premium_todo_user', JSON.stringify(newUser));
      return;
    }

    // 2. Verificar contas locais cadastradas no localStorage (como fallback)
    const stored = localStorage.getItem('taskflow_local_accounts');
    const localAccounts = stored ? JSON.parse(stored) : [];
    const localUser = localAccounts.find(
      (acc: any) => acc.email === trimmedEmail && acc.password === trimmedPassword
    );
    if (localUser) {
      const newUser = { email: trimmedEmail } as any;
      setUser(newUser);
      localStorage.setItem('premium_todo_user', JSON.stringify(newUser));
      return;
    }

    // 3. Tentar autenticação no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password: trimmedPassword });
    if (error) {
      throw new Error(error.message);
    } else if (data.session) {
      const newUser = { email: trimmedEmail } as any;
      setUser(newUser);
      localStorage.setItem('premium_todo_user', JSON.stringify(newUser));
    }
  };

  const signUp = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Salvar localmente no localStorage como fallback imediato
    const stored = localStorage.getItem('taskflow_local_accounts');
    const localAccounts = stored ? JSON.parse(stored) : [];
    if (!localAccounts.some((acc: any) => acc.email === trimmedEmail)) {
      localAccounts.push({ email: trimmedEmail, password: trimmedPassword });
      localStorage.setItem('taskflow_local_accounts', JSON.stringify(localAccounts));
    }

    try {
      // 2. Tentar criar conta no Supabase
      const { data, error } = await supabase.auth.signUp({ email: trimmedEmail, password: trimmedPassword });
      if (error) {
        console.warn('Erro ao cadastrar no Supabase (será usado fallback local):', error.message);
      }
    } catch (err) {
      console.warn('Erro de conexão ao cadastrar no Supabase (usando fallback local):', err);
    }

    // 3. Efetuar login imediato localmente
    const newUser = { email: trimmedEmail } as any;
    setUser(newUser);
    localStorage.setItem('premium_todo_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao sair:', error.message);
    setUser(null);
    localStorage.removeItem('premium_todo_user');
    setActiveTab('tasks');
  };

  const addTask = (
    title: string,
    category: Category,
    priority: Priority,
    dueDate: string,
    description?: string
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    // Inserir no Supabase com snake_case
    supabase.from('tasks').insert([toDb(newTask)]).then(({ error }) => {
      if (error) {
        console.error('Erro ao adicionar tarefa:', error);
      }
      setLocalTasks([newTask, ...tasks]);
    });
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    // Atualizar tarefa no Supabase (converter para snake_case)
    supabase
      .from('tasks')
      .update(toDb(updatedFields))
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Erro ao atualizar tarefa:', error);
        }
        // Atualizar estado local independentemente do erro
        const updatedTasks = tasks.map((task) =>
          task.id === id ? { ...task, ...updatedFields } : task
        );
        setLocalTasks(updatedTasks);
      });
  };

  const deleteTask = (id: string) => {
    // Remover tarefa do Supabase
    supabase.from('tasks').delete().eq('id', id).then(({ error }) => {
      if (error) {
        console.error('Erro ao remover tarefa:', error);
      }
      const filteredTasks = tasks.filter((task) => task.id !== id);
      setLocalTasks(filteredTasks);
    });
  };

  const toggleTaskComplete = (id: string) => {
    // Alternar completado no Supabase
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Erro ao alternar completado:', error);
        }
        const updatedTasks = tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
        setLocalTasks(updatedTasks);
      });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activeTab,
        setActiveTab,
        user,
        login,
        signUp,
        logout,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks deve ser usado dentro de um TaskProvider');
  }
  return context;
};
