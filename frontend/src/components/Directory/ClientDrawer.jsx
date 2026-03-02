import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Clock, ShieldCheck } from 'lucide-react';
import { useApi } from "../../hooks/useApi";

const ClientDrawer = ({ isOpen, onClose, client, onLogInteraction }) => {
  const [fullClientData, setFullClientData] = useState(null);
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

  if (!client) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-500" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-500" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md md:max-w-2xl">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    <div className="px-8 py-8 bg-slate-900 text-white flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">{client.name}</h2>
                        <p className="text-amber-500 text-xs font-bold tracking-[0.2em] mt-1">{client.pan}</p>
                      </div>
                      <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={24} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-8">
                      {loading ? (
                         <div className="flex justify-center py-20 animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">Loading History...</div>
                      ) : (
                        <div className="space-y-10">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total AUM</p>
                              <p className="text-xl font-black text-slate-900">₹{client.aum?.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700">{client.category}</span>
                            </div>
                          </div>

                          {/* Timeline Section */}
                          <section>
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Clock size={14} className="text-amber-600" /> Timeline</h3>
                            <div className="border-l-2 border-slate-100 ml-3 space-y-8">
                              {fullClientData?.interactions?.map((log) => (
                                <div key={log._id} className="relative pl-8">
                                  <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white border-4 border-amber-500 shadow-sm" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(log.date).toLocaleDateString('en-IN')}</p>
                                  <p className="text-sm font-bold text-slate-800 mt-1">{log.summary}</p>
                                  {log.complianceCheck && <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded"><ShieldCheck size={10} /> COMPLIANT</span>}
                                </div>
                              ))}
                            </div>
                          </section>
                        </div>
                      )}
                    </div>
                    
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
                      <button onClick={onLogInteraction} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Log New Interaction</button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ClientDrawer;