import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Building2,
  Filter,
  X,
  Download,
  ArrowUpDown,
  ExternalLink,
  Tag
} from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sourceFilter, setSourceFilter] = useState('Todas');
  const [sortBy, setSortBy] = useState('recente');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    value: '',
    status: 'Lead',
    source: 'Indicação',
    notes: ''
  });

  const { user } = useAuth();
  const statuses = ['Lead', 'Contato', 'Reunião', 'Proposta', 'Fechado', 'Perdido'];
  const sources = ['Google', 'Instagram', 'LinkedIn', 'WhatsApp', 'Indicação', 'Outros'];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      fetchLeads();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (error) {
        console.error('Erro ao excluir lead:', error);
      }
    }
  };

  const openModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        company: lead.company,
        whatsapp: lead.whatsapp,
        email: lead.email,
        value: lead.value,
        status: lead.status,
        source: lead.source || 'Indicação',
        notes: lead.notes || ''
      });
    } else {
      setEditingLead(null);
      setFormData({
        name: '',
        company: '',
        whatsapp: '',
        email: '',
        value: '',
        status: 'Lead',
        source: 'Indicação',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Empresa', 'WhatsApp', 'Email', 'Valor', 'Status', 'Origem', 'Criado em'];
    const csvData = leads.map(l => [
      l.name,
      l.company,
      l.whatsapp,
      l.email,
      l.value,
      l.status,
      l.source || 'Indicação',
      new Date(l.createdAt).toLocaleDateString('pt-BR')
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_crm_pro_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleClaim = async (id) => {
    try {
      await api.post(`/leads/${id}/claim`);
      fetchLeads();
    } catch (error) {
      console.error('Erro ao reivindicar lead:', error);
    }
  };

  const filteredLeads = leads
     .filter(lead => {
       const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                            lead.company.toLowerCase().includes(search.toLowerCase());
       const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter;
       const matchesSource = sourceFilter === 'Todas' || (lead.source || 'Indicação') === sourceFilter;
       return matchesSearch && matchesStatus && matchesSource;
     })
    .sort((a, b) => {
      if (sortBy === 'recente') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'valor-maior') return b.value - a.value;
      if (sortBy === 'valor-menor') return a.value - b.value;
      if (sortBy === 'nome') return a.name.localeCompare(b.name);
      return 0;
    });

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

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Leads<span className="text-red-600">.</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gestão de Base de Clientes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-300 text-xs font-black uppercase tracking-widest"
          >
            <Download size={16} strokeWidth={2.5} />
            Exportar
          </button>
          <button
            onClick={() => openModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex flex-col lg:flex-row gap-6 bg-zinc-900/50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input
              type="text"
              placeholder="PESQUISAR CLIENTE OU EMPRESA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 text-xs font-bold text-white placeholder-zinc-700 tracking-widest uppercase transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-zinc-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600/50 appearance-none min-w-[160px] cursor-pointer hover:border-zinc-700 transition-colors"
              >
                <option value="Todos">TODOS OS STATUS</option>
                {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Tag size={16} className="text-zinc-600" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600/50 appearance-none min-w-[160px] cursor-pointer hover:border-zinc-700 transition-colors"
              >
                <option value="Todas">TODAS AS ORIGENS</option>
                {sources.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600/50 appearance-none min-w-[160px] cursor-pointer hover:border-zinc-700 transition-colors"
            >
              <option value="recente">MAIS RECENTES</option>
              <option value="valor-maior">MAIOR VALOR</option>
              <option value="valor-menor">MENOR VALOR</option>
              <option value="nome">NOME (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5 border-b border-zinc-800">Cliente / Empresa</th>
                <th className="px-8 py-5 border-b border-zinc-800">Contato</th>
                <th className="px-8 py-5 border-b border-zinc-800 text-center">Origem</th>
                <th className="px-8 py-5 border-b border-zinc-800">Valor Negociado</th>
                <th className="px-8 py-5 border-b border-zinc-800">Status</th>
                <th className="px-8 py-5 border-b border-zinc-800 text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">Sincronizando dados...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest italic">Nenhum registro encontrado</td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-zinc-800/30 transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div 
                        className="font-black text-white cursor-pointer hover:text-red-500 transition-colors uppercase tracking-tight"
                        onClick={() => navigate(`/leads/${lead._id}`)}
                      >
                        {lead.name}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 items-center text-[10px] uppercase tracking-[0.15em] font-black">
                        <span className="px-2 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 flex items-center gap-2">
                          <Building2 size={12} strokeWidth={2.5} className="text-zinc-700" />
                          {lead.company}
                        </span>
                        <span className={`px-2 py-1 rounded-full uppercase tracking-[0.15em] ${lead.assignedToName ? 'bg-green-600/10 text-green-300 border-green-600/20' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                          {lead.assignedToName ? `Responsável: ${lead.assignedToName}` : 'Sem responsável'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[11px] text-zinc-300 font-bold flex items-center gap-2">
                        <Phone size={12} className="text-red-600" strokeWidth={2.5} />
                        {lead.whatsapp}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium flex items-center gap-2 mt-1 italic">
                        {lead.email}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-[0.15em]">
                        {lead.source || 'Indicação'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-white tracking-tighter">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusColor(lead.status)} shadow-sm`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {!lead.assignedTo && (
                          <button
                            onClick={() => handleClaim(lead._id)}
                            className="p-2.5 text-green-400 hover:text-white hover:bg-green-600/15 rounded-xl transition-all border border-transparent hover:border-green-500/20"
                          >
                            <Plus size={16} strokeWidth={2.5} />
                          </button>
                        )}
                        <button 
                          onClick={() => openModal(lead)}
                          className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all border border-transparent hover:border-zinc-700"
                        >
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lead._id)}
                          className="p-2.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Dark Premium */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  {editingLead ? 'Editar Registro' : 'Novo Registro'}
                </h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Preencha os dados estratégicos</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-2xl transition-all border border-transparent hover:border-zinc-700"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome do Lead</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                    placeholder="EX: PEDRO LEON"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Empresa / Organização</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                    placeholder="EX: TECH SOLUTIONS"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">WhatsApp Comercial</label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                    placeholder="+55 (00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">E-mail de Contato <span className="text-zinc-500">(opcional)</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                    placeholder="CONTATO@EMPRESA.COM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Etapa do Funil</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all appearance-none"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Origem do Lead</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all appearance-none"
                >
                  {sources.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Observações Estratégicas</label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all resize-none"
                  placeholder="DIGITE INFORMAÇÕES RELEVANTES SOBRE O LEAD..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95"
                >
                  {editingLead ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
