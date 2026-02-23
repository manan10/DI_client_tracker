import { useNavigate } from 'react-router-dom';
import { Users, Database, ArrowRight } from 'lucide-react';

const DirectoryBlock = ({ clientCount }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/directory')}
      className="group bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 cursor-pointer hover:border-blue-300 transition-all relative overflow-hidden"
    >
      <div className="absolute -right-4 -bottom-4 text-slate-50 group-hover:text-blue-50 transition-colors">
        <Database size={160} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
            <Users size={24} />
          </div>
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-xl">
            Client Directory
          </h3>
        </div>
        
        <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6 font-medium">
          Access your full database of {clientCount}+ wealth elite clients. Filter by Tier, search by PAN, and manage contact details in one centralized view.
        </p>
        
        <div className="flex items-center text-blue-700 font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
          Open Full Directory <ArrowRight size={16} className="ml-2" />
        </div>
      </div>
    </div>
  );
};

export default DirectoryBlock;