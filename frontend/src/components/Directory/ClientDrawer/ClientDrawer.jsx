import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Clock, ShieldCheck, Phone, Mail, Users, FolderOpen } from 'lucide-react';
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

  // Function to refresh data after an upload
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
        {/* FIXED: Added arbitrary value brackets for z-index */}
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
                      
                      {/* Header */}
                      <div className="px-8 py-10 bg-slate-900 dark:bg-black text-white relative">
                         <div className="relative flex justify-between items-start">
                           <div>
                              <div className="flex items-center gap-3 mb-3">
                                 <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest">
                                   {client.category || 'General'}
                                 </span>
                                 <span className="text-slate-500 text-[10px] font-mono tracking-wider">{client.pan}</span>
                              </div>
                              <h2 className="text-3xl font-black uppercase tracking-tight">{client.name}</h2>
                              
                              <div className="flex items-center gap-4 mt-6">
                                  <a href={`tel:${fullClientData?.contactDetails?.phoneNo}`} className="p-2 bg-slate-800 rounded-lg hover:bg-amber-600 transition-colors">
                                      <Phone size={14} className="text-white" />
                                  </a>
                                  <a href={`mailto:${fullClientData?.contactDetails?.email}`} className="p-2 bg-slate-800 rounded-lg hover:bg-amber-600 transition-colors">
                                      <Mail size={14} className="text-white" />
                                  </a>

                                  <button 
                                    onClick={() => setIsDocModalOpen(true)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 transition-all ml-4"
                                  >
                                    <FolderOpen size={16} />
                                    Documents
                                  </button>
                              </div>
                           </div>
                           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                              <X size={24} />
                           </button>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-10">
                        {loading ? (
                           <div className="flex justify-center py-20 animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Portfolio...</div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Valuation (AUM)</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">₹{client.aum?.toLocaleString('en-IN')}</p>
                              </div>
                              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Client ID</p>
                                  <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono uppercase">{client.wealthEliteId || 'N/A'}</p>
                              </div>
                            </div>

                            <section className="p-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <div className="flex items-center gap-3 mb-4">
                                  <Users size={18} className="text-amber-600" />
                                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Relationship Status</h3>
                               </div>
                               <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-500 font-bold">Family Role</span>
                                  <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                                      {client.isFamilyHead ? 'Family Head' : 'Family Member'}
                                  </span>
                               </div>
                            </section>

                            <section>
                              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-2">
                                  <Clock size={16} className="text-amber-600" /> Interaction Log
                              </h3>
                              <div className="border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8">
                                {fullClientData?.interactions?.length > 0 ? (
                                  fullClientData.interactions.map((log) => (
                                    <div key={log._id} className="relative pl-8 group">
                                      <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-amber-500" />
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                        {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </p>
                                      <p className="text-sm font-bold text-slate-800 dark:text-slate-300 mt-2 leading-relaxed italic">
                                        "{log.summary}"
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="pl-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No history recorded.</p>
                                )}
                              </div>
                            </section>
                          </>
                        )}
                      </div>
                      
                      <div className="px-8 py-8 bg-white dark:bg-black border-t border-slate-100 dark:border-slate-800">
                         <button 
                          onClick={onLogInteraction} 
                          className="w-full bg-amber-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-700 transition-all shadow-xl active:scale-95"
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

      {/* FIXED MODAL PROPS */}
      <DocumentManagerModal 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)} // Simply set to false
        onRefresh={refreshClientData} // Passed this so the UI updates after upload
        client={fullClientData || client} 
      />
    </>
  );
};

export default ClientDrawer;