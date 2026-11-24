import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LogOut } from 'lucide-react';
import { formatSupabaseAuthError, supabase } from '../lib/supabase';
import { upsertUserProfile } from '../services/placesService';

type AccountMode = 'login' | 'register' | 'forgot';

interface AccountViewProps {
  user: User | null;
}

export const AccountView: React.FC<AccountViewProps> = ({ user }) => {
  const [mode, setMode] = useState<AccountMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (nextMode: AccountMode) => {
    setMode(nextMode);
    setError(null);
    setInfoMessage(null);
    setResetSent(false);
    setShowPassword(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Zəhmət olmasa düzgün email daxil edin.');
      return;
    }
    if (password.length < 6) {
      setError('Parol ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        setError(formatSupabaseAuthError(signInError.message));
      } else {
        if (data.user) {
          void upsertUserProfile(data.user);
        }
        setPassword('');
      }
    } catch {
      setError('Şəbəkə xətası baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError('Adınızı daxil edin.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Zəhmət olmasa düzgün email daxil edin.');
      return;
    }
    if (password.length < 6) {
      setError('Parol ən azı 6 simvol olmalıdır.');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (signUpError) {
        setError(formatSupabaseAuthError(signUpError.message));
      } else if (!data.session) {
        setInfoMessage(
          `${trimmedEmail} ünvanına təsdiq linki göndərildi. Emailinizi təsdiqləyib daxil olun.`
        );
        setPassword('');
      } else {
        if (data.user) {
          void upsertUserProfile(data.user);
        }
        setPassword('');
      }
    } catch {
      setError('Qeydiyyat zamanı şəbəkə xətası baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Bərpa üçün düzgün email daxil edin.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: window.location.origin,
      });
      if (resetError) {
        setError(formatSupabaseAuthError(resetError.message));
      } else {
        setResetSent(true);
      }
    } catch {
      setError('Şəbəkə xətası baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      await supabase.auth.signOut();
      setPassword('');
      switchMode('login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName =
    typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : 'Xoş gəlmisiniz';

  return (
    <section
      aria-label="Hesabım"
      className="tripx-enter flex w-full flex-1 items-center justify-center px-4 py-6 sm:px-6"
    >
      <div className="w-full max-w-sm rounded-3xl border border-[#141A23]/[0.07] bg-white p-6 shadow-[0_12px_32px_rgba(17,34,51,0.06)] transition-colors duration-200 sm:p-7 dark:border-[#EEF2F6]/[0.08] dark:bg-[#161B22] dark:shadow-[0_16px_36px_rgba(0,0,0,0.42)]">
        {user ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F0F3] text-[#1F5D6B] dark:bg-[#1D323A] dark:text-[#6BC0D1]">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h1 className="font-display text-lg font-semibold text-[#141A23] dark:text-[#EEF2F6]">
                {displayName}
              </h1>
              <p className="text-sm text-[#5B6472] dark:text-[#94A0B2]">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSubmitting}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#141A23]/12 bg-transparent px-4 py-2.5 text-sm font-medium text-[#141A23] transition-colors duration-150 hover:bg-[#F7F8FA] active:scale-[0.98] disabled:opacity-50 dark:border-[#EEF2F6]/14 dark:text-[#EEF2F6] dark:hover:bg-[#1E252F] cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Çıxılır...' : 'Çıxış et'}</span>
            </button>
          </div>
        ) : (
          <>
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-5">
                <div className="space-y-1">
                  <h1 className="font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
                    Hesabım
                  </h1>
                  <p className="text-sm text-[#5B6472] dark:text-[#94A0B2]">
                    Davam etmək üçün hesabınıza daxil olun.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-medium text-[#3B4554] dark:text-[#B4C0CE]"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ad@numune.az"
                      className="h-12 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] px-3.5 text-sm text-[#141A23] placeholder:text-[#8A94A3] transition-colors duration-150 focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3] dark:focus:bg-[#11161D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-medium text-[#3B4554] dark:text-[#B4C0CE]"
                    >
                      Parol
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] pr-12 pl-3.5 text-sm text-[#141A23] placeholder:text-[#8A94A3] transition-colors duration-150 focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3] dark:focus:bg-[#11161D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Parolu gizlət' : 'Parolu göstər'}
                        className="absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center rounded-r-xl text-[#5B6472] transition-colors hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:text-[#EEF2F6] cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                        ) : (
                          <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="min-h-[36px] px-1 text-xs font-medium text-[#1F5D6B] transition-colors hover:text-[#164652] dark:text-[#6BC0D1] dark:hover:text-[#8FD1DE] cursor-pointer"
                      >
                        Şifrəmi unutdum
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]"
                  >
                    {error}
                  </p>
                )}

                <div className="space-y-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
                  >
                    {isSubmitting ? 'Yoxlanılır...' : 'Daxil ol'}
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    disabled={isSubmitting}
                    className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[#141A23]/12 bg-transparent px-4 py-2.5 text-sm font-medium text-[#141A23] transition-all duration-150 hover:bg-[#F7F8FA] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:border-[#EEF2F6]/14 dark:text-[#EEF2F6] dark:hover:bg-[#1E252F] cursor-pointer"
                  >
                    Qeydiyyat
                  </button>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    aria-label="Girişə qayıt"
                    className="-ml-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5B6472] transition-colors hover:bg-[#F7F8FA] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
                  >
                    <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
                  </button>
                  <div>
                    <h1 className="font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
                      Qeydiyyat
                    </h1>
                  </div>
                </div>

                {infoMessage ? (
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-2xl bg-[#F0F7F8] p-4 text-sm text-[#164652] dark:bg-[#1B2C33] dark:text-[#BFE4EC]">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#1F5D6B] dark:text-[#6BC0D1]"
                        aria-hidden="true"
                      />
                      <p className="leading-relaxed">{infoMessage}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
                    >
                      Girişə qayıt
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="register-name"
                          className="block text-xs font-medium text-[#3B4554] dark:text-[#B4C0CE]"
                        >
                          Ad və soyad
                        </label>
                        <input
                          id="register-name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Adınız"
                          className="h-12 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] px-3.5 text-sm text-[#141A23] placeholder:text-[#8A94A3] transition-colors duration-150 focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3] dark:focus:bg-[#11161D]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="register-email"
                          className="block text-xs font-medium text-[#3B4554] dark:text-[#B4C0CE]"
                        >
                          Email
                        </label>
                        <input
                          id="register-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ad@numune.az"
                          className="h-12 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] px-3.5 text-sm text-[#141A23] placeholder:text-[#8A94A3] transition-colors duration-150 focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3] dark:focus:bg-[#11161D]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="register-password"
                          className="block text-xs font-medium text-[#3B4554] dark:text-[#B4C0CE]"
                        >
                          Parol
                        </label>
                        <div className="relative">
                          <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ən azı 6 simvol"
                            className="h-12 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] pr-12 pl-3.5 text-sm text-[#141A23] placeholder:text-[#8A94A3] transition-colors duration-150 focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3] dark:focus:bg-[#11161D]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Parolu gizlət' : 'Parolu göstər'}
                            className="absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center rounded-r-xl text-[#5B6472] transition-colors hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:text-[#EEF2F6] cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                            ) : (
                              <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p
                        role="alert"
                        className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]"
                      >
                        {error}
                      </p>
                    )}

                    <div className="space-y-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] disabled:opacity-60 dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
                      >
                        {isSubmitting ? 'Yaradılır...' : 'Qeydiyyatdan keç'}
                      </button>

                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="flex min-h-[44px] w-full items-center justify-center text-xs font-medium text-[#5B6472] transition-colors hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:text-[#EEF2F6] cursor-pointer"
                      >
                        Artıq hesabınız var? Daxil ol
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} noValidate className="space-y-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    aria-label="Girişə qayıt"
                    className="-ml-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5B6472] transition-colors hover:bg-[#F7F8FA] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
                  >
                    <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
                  </button>
                  <h1 className="font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
                    Şifrəni bərpa et
                  </h1>
                </div>

                {resetSent ? (
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-2xl bg-[#F0F7F8] p-4 text-sm text-[#164652] dark:bg-[#1B2C33] dark:text-[#BFE4EC]">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#1F5D6B] dark:text-[#6BC0D1]"
                        aria-hidden="true"
                      />
                      <p className="leading-relaxed">
                        <strong>{email}</strong> ünvanına şifrə bərpa təlimatı göndərildi.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
                    >
                      Girişə qayıt
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-[#5B6472] dark:text-[#94A0B2]">
                      Hesabınıza bağlı email ünvanını yazın, bərpa linki göndərək.
                    </p>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="forgot-email"
                        className="block text-xs font-medium text-[#3B4554] dark:text-[#B4C0CE]"
                      >
                        Email
                      </label>
                      <input
                        id="forgot-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ad@numune.az"
                        className="h-12 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] px-3.5 text-sm text-[#141A23] placeholder:text-[#8A94A3] transition-colors duration-150 focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3] dark:focus:bg-[#11161D]"
                      />
                    </div>

                    {error && (
                      <p
                        role="alert"
                        className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]"
                      >
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] disabled:opacity-60 dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
                    >
                      {isSubmitting ? 'Göndərilir...' : 'Bərpa linki göndər'}
                    </button>
                  </>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
};
