import { Plus } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="px-10 py-4 flex justify-between items-center bg-white sticky top-0 z-50 shadow-md border-b-2 border-[#B8860B]">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-amber-400 to-yellow-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img
            src={logo}
            alt="Dalal Investment Logo"
            className="relative w-14 h-14 rounded-full border-2 border-amber-500 shadow-xl object-cover bg-white"
          />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tighter leading-none text-[#0F172A]">
            DALAL <span className="text-blue-700">INVESTMENT</span>
          </h1>
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Financial Product Distributor
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Surat Branch
          </p>
          <p className="text-xs font-black text-slate-700">
            {new Date().toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#0F172A] text-white px-6 py-3 rounded-md font-bold text-sm hover:bg-blue-900 transition-all shadow-lg active:scale-95 border-b-4 border-blue-700">
          <Plus size={18} strokeWidth={3} />
          NEW INTERACTION
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
