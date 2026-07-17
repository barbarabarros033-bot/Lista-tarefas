export type Category = 'Trabalho' | 'Pessoal' | 'Estudos' | 'Outros';

export type Priority = 'Alta' | 'Média' | 'Baixa';

export type Tab = 'tasks' | 'analytics' | 'calendar';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  dueDate: string; // Formato YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}

export interface CategoryInfo {
  name: Category;
  color: string; // Classe de texto Tailwind
  bgColor: string; // Classe de bg Tailwind
  borderColor: string; // Classe de borda Tailwind
}

export interface PriorityInfo {
  name: Priority;
  color: string;
  bgColor: string;
}
