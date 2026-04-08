import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  LogOut, 
  PlusCircle,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/kanban', icon: Kanban, label: 'Pipeline' },
    { path: '/leads', icon: Users, label: 'Leads' },
    { path: '/team', icon: PlusCircle, label: 'Equipe' },
    { path: '/tasks', icon: CheckCircle, label: 'Tarefas' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-900 h-screen flex flex-col sticky top-0">
      <div className="p-8">
        <h1 className="text-2xl font-black text-red-600 flex items-center gap-2 tracking-tighter italic">
          <TrendingUp size={32} strokeWidth={3} />
          <span>CRM<span className="text-white">PRO</span></span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-red-600/10 text-red-500 font-bold border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
                  : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-red-500' : 'group-hover:text-red-500 transition-colors'} />
              <span className="text-sm tracking-wide uppercase font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-zinc-900 bg-zinc-950/50">
        <div className="mb-6 px-4 py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{user?.name}</p>
          <p className="text-[10px] text-zinc-500 truncate font-medium">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
