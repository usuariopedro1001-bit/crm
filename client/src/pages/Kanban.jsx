import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { 
  Plus, 
  MoreVertical, 
  Phone, 
  Building2,
  DollarSign,
  Loader2,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Kanban = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const statuses = ['Lead', 'Contato', 'Reunião', 'Proposta', 'Fechado', 'Perdido'];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Lead': return { color: 'red', label: 'Novo Lead', bg: 'bg-red-500/10' };
      case 'Contato': return { color: 'red', label: 'Em Contato', bg: 'bg-red-600/10' };
      case 'Reunião': return { color: 'red', label: 'Reunião', bg: 'bg-red-700/10' };
      case 'Proposta': return { color: 'red', label: 'Proposta', bg: 'bg-red-800/10' };
      case 'Fechado': return { color: 'red', label: 'Ganhamos', bg: 'bg-red-900/20' };
      case 'Perdido': return { color: 'zinc', label: 'Perdido', bg: 'bg-zinc-800/50' };
      default: return { color: 'zinc', label: status, bg: 'bg-zinc-800/50' };
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const leadId = draggableId;

    // Optimistic update
    const updatedLeads = leads.map(lead => 
      lead._id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);

    try {
      await api.put(`/leads/${leadId}`, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
      fetchLeads(); // Rollback on error
    }
  };

  const getLeadsByStatus = (status) => {
    return leads.filter(lead => lead.status === status);
  };

  const calculateTotalValue = (statusLeads) => {
    return statusLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Pipeline<span className="text-red-600">.</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gerenciamento de Fluxo Comercial</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-3 flex items-center gap-6 shadow-2xl">
            <div className="text-right">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Valor Total em Funil</p>
              <p className="text-xl font-black text-white tracking-tighter">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(leads.reduce((acc, curr) => acc + (curr.value || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-8 flex-1 min-h-0">
          {statuses.map((status) => {
            const config = getStatusConfig(status);
            const statusLeads = getLeadsByStatus(status);
            const totalValue = calculateTotalValue(statusLeads);
            
            return (
              <div key={status} className="flex-shrink-0 w-80 flex flex-col h-full group/col">
                <div className={`bg-zinc-900 p-5 rounded-t-3xl border-t-2 border-x border-zinc-800 flex flex-col gap-2 ${status === 'Fechado' ? 'border-t-green-500' : status === 'Perdido' ? 'border-t-zinc-600' : 'border-t-red-600'} shadow-2xl relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl -mr-8 -mt-8"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="font-black text-white text-xs uppercase tracking-[0.15em]">{config.label}</span>
                    <span className={`bg-zinc-950 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-zinc-800`}>
                      {statusLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest relative z-10">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalValue)}
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-4 bg-zinc-900/30 border-x border-b border-zinc-800/50 rounded-b-3xl transition-all duration-300 min-h-[100px] overflow-y-auto ${
                        snapshot.isDraggingOver ? 'bg-red-950/10' : ''
                      }`}
                    >
                      {statusLeads.map((lead, index) => (
                        <Draggable key={lead._id} draggableId={lead._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => navigate(`/leads/${lead._id}`)}
                              className={`bg-zinc-900 p-5 mb-4 rounded-2xl border border-zinc-800 shadow-xl hover:border-red-500/30 transition-all duration-300 cursor-pointer group/card relative overflow-hidden ${
                                snapshot.isDragging ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-2 ring-red-600/50 scale-105 z-50' : ''
                              }`}
                            >
                              <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 blur-xl -mr-6 -mt-6"></div>
                              
                              <div className="flex justify-between items-start mb-4 relative z-10">
                                <h3 className="font-black text-white group-hover/card:text-red-500 transition-colors truncate flex-1 pr-2 uppercase tracking-tight text-sm">
                                  {lead.name}
                                </h3>
                                <div className="text-zinc-700 group-hover/card:text-red-500 transition-colors">
                                  <ExternalLink size={14} strokeWidth={2.5} />
                                </div>
                              </div>
                              
                              <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                  <div className="bg-zinc-800 p-1.5 rounded-lg text-zinc-400">
                                    <Building2 size={12} strokeWidth={2.5} />
                                  </div>
                                  <span className="truncate">{lead.company}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                  <div className="bg-zinc-800 p-1.5 rounded-lg text-zinc-400">
                                    <User size={12} strokeWidth={2.5} />
                                  </div>
                                  <span>{lead.whatsapp}</span>
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center relative z-10">
                                <div className="text-base font-black text-white tracking-tighter">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-black bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                                  <Calendar size={10} strokeWidth={2.5} />
                                  {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
