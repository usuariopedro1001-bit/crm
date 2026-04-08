import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const totalLeads = leads.length;
  const closedLeads = leads.filter(l => l.status === 'Fechado').length;
  const lostLeads = leads.filter(l => l.status === 'Perdido').length;
  const totalValue = leads.reduce((acc, curr) => acc + (curr.status === 'Fechado' ? curr.value : 0), 0);
  const valueInNegotiation = leads.reduce((acc, curr) => acc + (curr.status !== 'Fechado' && curr.status !== 'Perdido' ? curr.value : 0), 0);
  const averageTicket = closedLeads > 0 ? totalValue / closedLeads : 0;
  const conversionRate = totalLeads > 0 ? (closedLeads / (totalLeads - leads.filter(l => l.status === 'Lead').length)) * 100 : 0;

  const statusData = [
    { name: 'Lead', value: leads.filter(l => l.status === 'Lead').length, color: '#ef4444' },
    { name: 'Contato', value: leads.filter(l => l.status === 'Contato').length, color: '#dc2626' },
    { name: 'Reunião', value: leads.filter(l => l.status === 'Reunião').length, color: '#b91c1c' },
    { name: 'Proposta', value: leads.filter(l => l.status === 'Proposta').length, color: '#991b1b' },
    { name: 'Fechado', value: leads.filter(l => l.status === 'Fechado').length, color: '#7f1d1d' },
    { name: 'Perdido', value: leads.filter(l => l.status === 'Perdido').length, color: '#450a0a' },
  ];

  // Process data for growth chart (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const growthData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    leads: leads.filter(l => l.createdAt.split('T')[0] === date).length,
    vendas: leads.filter(l => l.status === 'Fechado' && l.createdAt.split('T')[0] === date).length
  }));

  // Get recent interactions across all leads
  const recentInteractions = leads
    .flatMap(lead => (lead.interactions || []).map(i => ({ ...i, leadName: lead.name, leadId: lead._id })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const COLORS = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'];

  const stats = [
    { 
      label: 'Leads Captados', 
      value: totalLeads, 
      icon: Users, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10',
      trend: '+12%',
      isPositive: true
    },
    { 
      label: 'Negócios Ganhos', 
      value: closedLeads, 
      icon: CheckCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-600/10',
      trend: '+5%',
      isPositive: true
    },
    { 
      label: 'Receita Total', 
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalValue), 
      icon: DollarSign, 
      color: 'text-zinc-100', 
      bg: 'bg-zinc-800',
      trend: '+18%',
      isPositive: true
    },
    { 
      label: 'Conversão', 
      value: `${conversionRate.toFixed(1)}%`, 
      icon: TrendingUp, 
      color: 'text-red-400', 
      bg: 'bg-red-400/10',
      trend: '-2%',
      isPositive: false
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard<span className="text-red-600">.</span></h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Visão Geral de Performance</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Última atualização</p>
          <p className="text-xs font-bold text-zinc-400 uppercase">{new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl hover:border-red-500/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-3xl -mr-10 -mt-10 group-hover:bg-red-600/10 transition-colors"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black ${stat.isPositive ? 'text-green-500' : 'text-red-500'} bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-700`}>
                  {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
                <p className="text-3xl font-black text-white mt-1 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Fluxo de Aquisição</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Leads vs Vendas (Últimos 7 dias)</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorLeads)" />
                <Line type="monotone" dataKey="vendas" stroke="#ffffff" strokeWidth={4} dot={{r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#ffffff'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Metas Estratégicas</h3>
          <div className="space-y-8 flex-1">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="text-zinc-400">Objetivo de Vendas</span>
                <span className="text-red-500">{Math.round((closedLeads / 10) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-red-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                  style={{ width: `${Math.min((closedLeads / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-zinc-600 font-bold uppercase mt-3">Target: 10 Contratos (Faltam {Math.max(10 - closedLeads, 0)})</p>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="text-zinc-400">Objetivo Financeiro</span>
                <span className="text-white">{Math.round((totalValue / 50000) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-zinc-100 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min((totalValue / 50000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-zinc-600 font-bold uppercase mt-3">Target: R$ 50.000,00</p>
            </div>

            <div className="pt-8 border-t border-zinc-800 mt-auto">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Sumário do Funil</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-2xl">
                  <p className="text-[9px] text-red-500 uppercase font-black tracking-widest mb-1">Perdidos</p>
                  <p className="text-xl font-black text-white">{lostLeads}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-2xl">
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Ativos</p>
                  <p className="text-xl font-black text-white">{leads.length - closedLeads - lostLeads}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Distribuição por Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{ fill: '#27272a' }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={45}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Clock size={20} className="text-red-500" />
              Logs de Atividade
            </h3>
            <button 
              onClick={() => navigate('/leads')}
              className="text-[10px] text-white font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-all duration-300 shadow-lg shadow-red-900/20"
            >
              Ver Tudo
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {recentInteractions.length === 0 ? (
              <div className="py-20 text-center text-zinc-600 italic text-sm font-medium">
                Nenhum registro encontrado.
              </div>
            ) : (
              recentInteractions.map((activity, index) => (
                <div key={index} className="flex items-center gap-5 p-4 hover:bg-zinc-800/50 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-zinc-800 group" onClick={() => navigate(`/leads/${activity.leadId}`)}>
                  <div className="bg-zinc-800 text-red-500 p-3 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <MessageSquare size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-black text-white truncate uppercase tracking-tight group-hover:text-red-500 transition-colors">
                        {activity.leadName}
                      </p>
                      <span className="text-[9px] text-zinc-500 font-black bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                        {new Date(activity.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-1 font-medium italic">
                      "{activity.content}"
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
