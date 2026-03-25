import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Clock, Phone, Mail, FolderOpen, CreditCard, Users, TrendingUp } from 'lucide-react';
import { useApi } from "../../../hooks/useApi";
import DocumentManagerModal from './DocumentManagerModal'; 

const ClientDrawer = ({ isOpen, onClose, client, onLogInteraction }) => {
  const [fullClientData, setFullClientData] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const { request, loading } = useApi();

  useEffect(() => {
    if (!isOpen || !client?._id) return;
    const fetchDetails = async () => {
      try {
        const data = await request(`/clients/${client._id}`);
        setFullClientData(data);
      } catch (err) { console.error(err); }
    };
    fetchDetails();
    return () => setFullClientData(null);
  }, [isOpen, client?._id, request]);

  const refreshClientData = async () => {
    try {
      const data = await request(`/clients/${client._id}`);
      setFullClientData(data);
    } catch (err) { console.error(err); }
  };

  if (!client) return null;

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={onClose}>
          <Transition.Child as={Fragment} enter="ease-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-500" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-500" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-2xl">
                      
                      {/* HEADER SECTION */}
                      <div className="px-8 pt-10 pb-6 bg-slate-800 dark:bg-slate-950 text-white relative border-b border-white/5">
                         <div className="relative flex justify-between items-start mb-8">
                           <div>
                              <div className="flex items-center gap-3 mb-3">
                                 <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest">
                                   {client.category || 'General'}
                                 </span>
                                 <span className="text-slate-500 text-[10px] font-mono tracking-wider">{client.pan}</span>
                              </div>
                              <h2 className="text-3xl font-black uppercase tracking-tight">{client.name}</h2>
                           </div>
                           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                              <X size={24} />
                           </button>
                         </div>

                         {/* NEW COMPACT STATS BAR (Header) */}
                         <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
                            <div className="flex flex-col gap-1">
                               <span className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                 <CreditCard size={10} className="text-amber-500" /> Client ID
                               </span>
                               <span className="text-[11px] font-mono font-bold text-slate-200">{client.wealthEliteId || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-x border-white/5 px-4">
                               <span className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                 <Users size={10} className="text-amber-500" /> Role
                               </span>
                               <span className="text-[11px] font-bold text-slate-200 uppercase">{client.isFamilyHead ? 'Head' : 'Member'}</span>
                            </div>
                            <div className="flex flex-col gap-1 pl-4">
                               <span className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                 <TrendingUp size={10} className="text-amber-500" /> AUM
                               </span>
                               <span className="text-[11px] font-bold text-amber-500">₹{client.aum?.toLocaleString('en-IN')}</span>
                            </div>
                         </div>

                         {/* ACTION BUTTONS */}
                         <div className="flex items-center gap-4 mt-6">
                              <a href={`tel:${fullClientData?.contactDetails?.phoneNo}`} className="p-2 bg-slate-700 dark:bg-slate-800 rounded-lg hover:bg-amber-600 transition-colors">
                                  <Phone size={14} />
                              </a>
                              <a href={`mailto:${fullClientData?.contactDetails?.email}`} className="p-2 bg-slate-700 dark:bg-slate-800 rounded-lg hover:bg-amber-600 transition-colors">
                                  <Mail size={14} />
                              </a>
                              <button 
                                onClick={() => setIsDocModalOpen(true)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all ml-auto"
                              >
                                <FolderOpen size={16} className="text-amber-500" />
                                Documents
                              </button>
                         </div>
                      </div>

                      {/* BODY SECTION: INTERACTION TIMELINE ONLY */}
                      <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
                        {loading ? (
                           <div className="flex justify-center py-20 animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Intelligence...</div>
                        ) : (
                          <section>
                            <div className="flex items-center gap-4 mb-10">
                              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white whitespace-nowrap">
                                Historical Timeline
                              </h3>
                              <div className="h-px w-full bg-slate-100 dark:bg-white/5" />
                            </div>

                            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-12">
                              {fullClientData?.interactions?.length > 0 ? (
                                fullClientData.interactions.map((log) => (
                                  <div key={log._id} className="relative pl-10 group">
                                    {/* Timeline Node */}
                                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-amber-500 shadow-sm group-hover:scale-125 transition-transform" />
                                    
                                    <div className="flex flex-col gap-1">
                                      <time className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </time>
                                      
                                      <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group-hover:border-amber-500/30 transition-all">
                                        <p className="text-[14px] font-medium text-slate-800 dark:text-slate-300 leading-relaxed italic">
                                          "{log.summary}"
                                        </p>
                                        {log.type && (
                                          <span className="inline-block mt-3 text-[9px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                                            {log.type}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="pl-10 text-center py-10">
                                  <Clock className="mx-auto text-slate-200 dark:text-slate-700 mb-3" size={32} />
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No interaction history found.</p>
                                </div>
                              )}
                            </div>
                          </section>
                        )}
                      </div>
                      
                      {/* FOOTER ACTION */}
                      <div className="px-8 py-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
                        <button 
                          onClick={onLogInteraction} 
                          className="w-full bg-amber-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                          Log New Interaction
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <DocumentManagerModal 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)} 
        onRefresh={refreshClientData} 
        client={fullClientData || client} 
      />
    </>
  );
};

export default ClientDrawer;