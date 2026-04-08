import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Users, UserPlus } from 'lucide-react';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/auth/team-members');
      setTeamMembers(response.data);
    } catch (err) {
      console.error('Erro ao buscar membros da equipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Preencha todos os campos para adicionar um membro.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/auth/team-members', formData);
      setFormData({ name: '', email: '', password: '' });
      fetchTeamMembers();
    } catch (err) {
      console.error('Erro ao adicionar membro:', err);
      setError(err.response?.data?.error || 'Não foi possível adicionar o membro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Equipe<span className="text-red-600">.</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Adicione colegas ao mesmo CRM.</p>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Novo membro
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6">Lista de membros</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-zinc-500 uppercase text-xs tracking-[0.2em] font-black">Carregando membros...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-zinc-500 uppercase text-xs tracking-[0.2em] font-black">Nenhum membro encontrado.</div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-3xl bg-red-600/10 flex items-center justify-center text-red-500">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-white font-black uppercase tracking-tight">{member.name}</p>
                    <p className="text-zinc-400 text-[11px] uppercase tracking-[0.2em]">{member.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-600/10 text-red-500 p-3 rounded-2xl">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Adicionar colega</h2>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mt-1">Cadastro rápido para usar o mesmo CRM.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none text-white font-bold transition-all"
                placeholder="Senha mínima de 6 caracteres"
              />
            </div>
            {error && <p className="text-sm text-red-500 uppercase tracking-[0.15em] font-black">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all duration-300 font-black uppercase tracking-widest shadow-xl shadow-red-900/20 disabled:opacity-50"
            >
              {submitting ? 'Adicionando...' : 'Adicionar membro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Team;
