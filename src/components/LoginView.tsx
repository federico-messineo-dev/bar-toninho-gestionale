import React, { useState } from 'react';
import { BRAND_LOGO_URL } from '../data/mockData';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('gaia.bilardi25@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="bg-[#1B1512] min-h-screen flex items-center justify-center p-4 font-body-md text-on-surface antialiased">
      <main className="w-full max-w-[390px] mx-auto">
        <div className="bg-surface rounded-xl shadow-lg p-6 border border-surface-variant/50 relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-20"></div>

          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8 mt-3">
            <img
              src={BRAND_LOGO_URL}
              alt="Caffè Toninho Logo"
              className="h-20 w-auto mb-3 object-contain rounded-md"
            />
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary text-center font-bold">
              Caffè Toninho
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Indirizzo Email"
                className="w-full bg-surface-container-lowest border-0 border-b border-outline text-on-surface font-body-md text-body-md py-3 pl-12 pr-4 focus:ring-0 focus:border-b-2 focus:border-secondary transition-all outline-none"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-surface-container-lowest border-0 border-b border-outline text-on-surface font-body-md text-body-md py-3 pl-12 pr-12 focus:ring-0 focus:border-b-2 focus:border-secondary transition-all outline-none"
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            <div className="flex justify-end -mt-2">
              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                Password dimenticata?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-3 rounded-lg shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-200 mt-2 flex justify-center items-center gap-2 cursor-pointer"
            >
              Accedi
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-3 border-t border-surface-variant text-center">
            <p className="font-label-sm text-label-sm text-outline">
              Gestione Inventario Artigianale
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
