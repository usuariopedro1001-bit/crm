import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  DollarSign, 
  Edit2, 
  Trash2,
  Send,
  Clock,
  MessageSquare,
  Loader2,
  Tag,
  PhoneCall,
  Video,
  FileText
} from 'lucide-react';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newInteraction, setNewInteraction] = useState('');
  const [interactionType, setInteractionType] = useState('Nota');
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do lead:', error);
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!newInteraction.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/leads/${id}/interactions`, { 
        content: newInteraction,
        type: interactionType
      });
      setLead(response.data);
      setNewInteraction('');
      setInteractionType('Nota');
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async () => {
    if (lead?.assignedTo) return;
    setClaiming(true);
    try {
      const response = await api.post(`/leads/${id}/claim`);
      setLead(response.data);
    } catch (error) {
      console.error('Erro ao reivindicar lead:', error);
    } finally {
      setClaiming(false);
    }
  };

  const getInteractionIcon = (type) => {
    switch (type) {
      case 'Chamada': return <PhoneCall size={16} />;
      case 'Reunião': return <Video size={16} />;
      case 'Email': return <Mail size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lead': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Contato': return 'bg-red-600/10 text-red-500 border-red-600/20';
      case 'Reunião': return 'bg-red-700/10 text-red-600 border-red-700/20';
      case 'Proposta': return 'bg-red-800/10 text-red-700 border-red-800/20';
      case 'Fechado': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Perdido': return 'bg-zinc-800 text-zinc-500 border-zinc-700';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/leads')}
          className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-red-500/50 rounded-2xl transition-all duration-300 shadow-xl"
        >
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">{lead.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{lead.company}</p>
            <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${lead.assignedToName ? 'bg-green-600/10 border-green-600/20 text-green-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
              {lead.assignedToName ? (lead.assignedTo === user?.id ? 'Você é responsável' : `Responsável: ${lead.assignedToName}`) : 'Sem responsável'}
            </span>
          </div>
          {!lead.assignedTo && (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] transition-all disabled:opacity-50"
            >
              {claiming ? 'Reivindicando...' : 'Reivindicar este lead'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 relative z-10">Perfil do Cliente</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-zinc-800/50 p-3 rounded-2xl text-red-500 border border-zinc-800">
                  <Building2 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Empresa</p>
                  <p className="text-sm font-bold text-zinc-100 uppercase">{lead.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-zinc-800/50 p-3 rounded-2xl text-red-500 border border-zinc-800">
                  <Phone size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">WhatsApp</p>
                  <p className="text-sm font-bold text-zinc-100">{lead.whatsapp}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-zinc-800/50 p-3 rounded-2xl text-red-500 border border-zinc-800">
                  <Mail size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">E-mail</p>
                  <p className="text-sm font-bold text-zinc-100">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-zinc-800/50 p-3 rounded-2xl text-red-500 border border-zinc-800">
                  <Tag size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Origem</p>
                  <p className="text-sm font-bold text-zinc-100 uppercase tracking-tighter">{lead.source || 'Indicação'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-zinc-800/50 p-3 rounded-2xl text-red-500 border border-zinc-800 shadow-inner">
                  <DollarSign size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Valor de Negócio</p>
                  <p className="text-lg font-black text-white tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Briefing Inicial</h3>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 min-h-[100px]">
              <p className="text-zinc-400 text-xs font-medium italic leading-relaxed">
                "{lead.notes || 'Sem observações registradas.'}"
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col min-h-full">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <MessageSquare size={24} className="text-red-600" strokeWidth={3} />
              Linha do Tempo
            </h3>

            <form onSubmit={handleAddInteraction} className="mb-12 bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-inner">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {['Nota', 'Chamada', 'Email', 'Reunião'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInteractionType(type)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                        interactionType === type 
                          ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/30' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea
                    rows="3"
                    placeholder={`REGISTRAR NOVA ${interactionType.toUpperCase()}...`}
                    value={newInteraction}
                    onChange={(e) => setNewInteraction(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all text-sm text-white placeholder-zinc-700 font-bold uppercase tracking-wide resize-none"
                  ></textarea>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={submitting || !newInteraction.trim()}
                      className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300 text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50 shadow-xl shadow-red-900/20 active:scale-95"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} strokeWidth={3} />}
                      Salvar Registro
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="space-y-8 relative">
              {lead.interactions?.length === 0 ? (
                <div className="text-center py-20 text-zinc-600 font-black uppercase tracking-[0.2em] italic text-xs">
                  Nenhuma atividade registrada.
                </div>
              ) : (
                [...lead.interactions].reverse().map((interaction, index) => (
                  <div key={index} className="flex gap-6 relative group">
                    {index !== lead.interactions.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-zinc-800 group-hover:bg-red-900/30 transition-colors"></div>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-500 group-hover:scale-110 shadow-2xl">
                      <div className="text-zinc-400 group-hover:text-white transition-colors">
                        {getInteractionIcon(interaction.type)}
                      </div>
                    </div>
                    <div className="flex-1 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 group-hover:border-red-900/30 transition-all duration-500 shadow-inner">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">
                          {interaction.type || 'Nota'}
                        </span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                          {new Date(interaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs font-bold uppercase tracking-wide leading-relaxed">
                        {interaction.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
