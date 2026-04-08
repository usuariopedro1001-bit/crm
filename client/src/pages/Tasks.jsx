import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  Trash2,
  Calendar,
  Loader2,
  Filter
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    priority: 'Média',
    leadId: ''
  });
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchLeads();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      fetchTasks();
      setIsModalOpen(false);
      setNewTask({ title: '', dueDate: '', priority: 'Média', leadId: '' });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      await api.put(`/tasks/${id}`, { completed: !completed });
      fetchTasks();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Excluir esta tarefa?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Média': return 'text-zinc-300 bg-zinc-800 border-zinc-700';
      case 'Baixa': return 'text-zinc-500 bg-zinc-900 border-zinc-800';
      default: return 'text-zinc-500 bg-zinc-900 border-zinc-800';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Tarefas<span className="text-red-600">.</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gestão de Produtividade Diária</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-xl shadow-red-900/20 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Nova Tarefa
        </button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="bg-zinc-900/50 p-20 rounded-[3rem] border-2 border-dashed border-zinc-800 text-center">
            <div className="bg-zinc-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700 border border-zinc-800 shadow-inner">
              <CheckCircle size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Foco Total!</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Você concluiu todos os seus objetivos pendentes.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task._id} 
              className={`bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 shadow-2xl flex items-center gap-6 group transition-all duration-500 hover:border-red-500/30 ${task.completed ? 'opacity-40 grayscale' : ''}`}
            >
              <button 
                onClick={() => toggleTask(task._id, task.completed)}
                className={`transition-all duration-500 p-1 rounded-xl border-2 ${task.completed ? 'bg-green-500 border-green-500 text-zinc-950' : 'bg-transparent border-zinc-700 text-transparent hover:border-red-500 hover:text-red-500'}`}
              >
                <CheckCircle size={22} strokeWidth={3} />
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-black text-white uppercase tracking-tight truncate transition-all duration-500 ${task.completed ? 'line-through text-zinc-600' : 'group-hover:text-red-500'}`}>
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-5 mt-2">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      <Clock size={12} strokeWidth={3} className="text-red-600" />
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {task.leadId && (
                    <div className="flex items-center gap-2 text-[10px] text-white font-black bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 uppercase tracking-widest">
                      <AlertCircle size={12} strokeWidth={3} className="text-red-600" />
                      Lead: {leads.find(l => l._id === task.leadId)?.name || '...'}
                    </div>
                  )}
                </div>
              </div>

              <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black border ${getPriorityColor(task.priority)} uppercase tracking-[0.2em] shadow-sm`}>
                {task.priority}
              </div>

              <button 
                onClick={() => deleteTask(task._id)}
                className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20"
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Nova Task</h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Defina seus próximos passos</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <Plus className="rotate-45" size={28} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Descrição da Tarefa</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all text-white font-bold uppercase text-sm"
                  placeholder="EX: RETORNAR PROPOSTA PARA CLIENTE"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Data Limite</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all text-white font-bold appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all text-white font-bold appearance-none"
                  >
                    <option value="Alta">ALTA</option>
                    <option value="Média">MÉDIA</option>
                    <option value="Baixa">BAIXA</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Vínculo Estratégico</label>
                <select
                  value={newTask.leadId}
                  onChange={(e) => setNewTask({...newTask, leadId: e.target.value})}
                  className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all text-white font-bold appearance-none"
                >
                  <option value="">NENHUM LEAD VINCULADO</option>
                  {leads.map(lead => (
                    <option key={lead._id} value={lead._id}>{lead.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-900/20 mt-4 active:scale-95"
              >
                Confirmar Tarefa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;