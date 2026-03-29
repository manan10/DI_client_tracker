import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[120]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-800">
                <div className="absolute right-4 top-4">
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {title || 'Confirm Action'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        {message || 'Are you sure you want to proceed? This action cannot be undone.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-all active:scale-95"
                    onClick={onConfirm}
                  >
                    {loading ? 'Redacting...' : 'Confirm Deletion'}
                    {!loading && <Trash2 size={14} />}
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-xl bg-white dark:bg-slate-800 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all sm:mt-0"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ConfirmationModal;