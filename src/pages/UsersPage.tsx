import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';

const UsersPage: React.FC = () => {
  const users = useAppStore((s) => s.users);
  const addUser = useAppStore((s) => s.addUser);
  const removeUser = useAppStore((s) => s.removeUser);
  const authUser = useAppStore((s) => s.authUser);

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('staff');
  const [error, setError] = useState('');

  const handleAddUser = () => {
    if (!newName) { setError('Inserisci il nome.'); return; }
    addUser(newName, newRole);
    setNewName(''); setNewRole('staff'); setError(''); setShowModal(false);
  };

  return (
    <div className="p-4 md:p-8 lg:px-12 max-w-[1440px] mx-auto w-full pb-28 md:pb-12 min-h-screen animate-[fadeIn_0.3s_ease]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestione Utenti</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-container text-on-primary font-label-md px-4 py-2 rounded-full hover:bg-primary transition-colors shadow-sm cursor-pointer active:scale-95"
        >
          + Aggiungi
        </button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.email}
            className="bg-[#FFFDD0] rounded-3xl p-4 border border-[#E5E0D6] flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-container text-on-primary rounded-full flex items-center justify-center font-label-md">
                {user.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-body-lg text-body-lg text-on-surface">{user.name}</h4>
                <p className="font-body-sm text-outline">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-label-sm bg-primary-container/20 text-primary-container px-2.5 py-1 rounded-full capitalize">{user.role}</span>
              {user.email !== 'gaia.bilardi25@gmail.com' && authUser?.role === 'admin' && (
                <button
                  onClick={() => removeUser(user.email)}
                  className="text-outline hover:text-error transition-colors cursor-pointer p-1 active:scale-90"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#FFFDD0] rounded-3xl p-6 w-full max-w-md border border-[#E5E0D6] shadow-xl animate-[scaleIn_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Nuovo Utente</h3>
            {error && <p className="text-error font-body-sm mb-2">{error}</p>}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 rounded-full border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md bg-surface-container-lowest"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setNewRole('staff')}
                  className={`flex-1 py-2.5 rounded-full font-label-md transition-colors cursor-pointer active:scale-95 ${
                    newRole === 'staff' ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface border border-outline-variant'
                  }`}
                >
                  Staff
                </button>
                <button
                  onClick={() => setNewRole('admin')}
                  className={`flex-1 py-2.5 rounded-full font-label-md transition-colors cursor-pointer active:scale-95 ${
                    newRole === 'admin' ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface border border-outline-variant'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-variant transition-colors font-label-md border border-outline-variant cursor-pointer active:scale-95"
              >
                Annulla
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 rounded-full bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-md cursor-pointer active:scale-95"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
