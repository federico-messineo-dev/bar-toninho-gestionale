import React, { useState } from 'react';
import { UserItem } from '../types';

interface UsersViewProps {
  users: UserItem[];
  onAddUser: (user: UserItem) => void;
  onUpdateUser: (user: UserItem) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'Admin' | 'Staff'>('Staff');

  const handleOpenAdd = () => {
    setNameInput('');
    setRoleInput('Staff');
    setShowAddModal(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setNameInput(u.name);
    setRoleInput(u.role);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: nameInput,
        role: roleInput,
      });
      setEditingUser(null);
    } else {
      const newUser: UserItem = {
        id: `u-${Date.now()}`,
        name: nameInput,
        role: roleInput,
        status: 'online',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBi9w5HxQXm6-b25Ttv31aUFZ-xjm9VynoTbQhXVD5w0P8pylUKwnBkQaaWWNPd-k5dhLLqJb4HAT08CA3GQK74ntZXfzG1pRSn72rM3g1EDdq-xPrFwvW4eK_KP7tNo-OS4oYfSd512ze1_b3EXen_tfrWf5PcV_-RT5LTOPBI-lE0WNJYjanI9tSvyBSD_UksJ54Y52VnBfWnf1qg6Ll5kDaVHyJOVae5TL067mIwJbFo9t8tGpHA',
      };
      onAddUser(newUser);
      setShowAddModal(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 pb-28 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold mb-1">
            Gestione Utenti
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Gestisci gli accessi e i ruoli del tuo staff per Caffè Toninho.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center space-x-2 shadow-md cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span>Aggiungi utente</span>
        </button>
      </div>

      {/* Users Cards List */}
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-[#FFFDD0] rounded-xl p-4 md:p-6 border border-[#E5E0D6] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover-lift ${
              user.status === 'offline' ? 'opacity-85' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-primary overflow-hidden border-2 border-surface ${
                  user.status === 'offline' ? 'grayscale' : ''
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary-container font-semibold leading-tight">
                  {user.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold ${
                      user.role === 'Admin'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    {user.role}
                  </span>

                  {user.status === 'online' && (
                    <span className="flex items-center space-x-1 font-label-sm text-label-sm text-[#4CAF50]">
                      <span className="w-2 h-2 rounded-full bg-[#4CAF50] inline-block"></span>
                      <span>Online</span>
                    </span>
                  )}

                  {user.status === 'recent' && (
                    <span className="font-label-sm text-label-sm text-on-surface-variant/70">
                      Ultimo accesso: {user.lastAccess || 'recentemente'}
                    </span>
                  )}

                  {user.status === 'offline' && (
                    <span className="flex items-center space-x-1 font-label-sm text-label-sm text-on-surface-variant/50">
                      <span className="w-2 h-2 rounded-full bg-outline inline-block"></span>
                      <span>Offline</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
              <div className="flex-1 md:hidden"></div>
              <button
                onClick={() => handleOpenEdit(user)}
                className="border border-primary text-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary/5 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
                <span>Modifica</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Adding / Editing Users */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-tertiary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDD0] rounded-xl p-6 border border-[#E5E0D6] shadow-xl w-full max-w-md relative">
            <h3 className="font-headline-md text-headline-md text-primary font-bold mb-4">
              {editingUser ? 'Modifica Utente' : 'Aggiungi Nuovo Utente'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Nome e Cognome
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="es. Mario Rossi"
                  className="input-ledger block w-full text-body-md"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Ruolo Staff
                </label>
                <select
                  value={roleInput}
                  onChange={(e) =>
                    setRoleInput(e.target.value as 'Admin' | 'Staff')
                  }
                  className="input-ledger block w-full text-body-md py-2 cursor-pointer"
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 border border-primary text-primary rounded font-label-md text-label-md hover:bg-surface-variant cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded font-label-md text-label-md hover:bg-primary-container shadow-sm cursor-pointer"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
