'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthProvider';
import { trackEvent } from '@/lib/analytics';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completá email y contraseña');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const data = await register(email, password, nombre);
      trackEvent('signup', { userId: data?.user?.id || null });
      if (!data.session) {
        // Confirmación de email activada: el usuario tiene que clickear el link
        setInfo(
          'Te mandamos un mail para confirmar tu cuenta. Revisalo y volvé a iniciar sesión.'
        );
        setLoading(false);
        return;
      }
      router.push(next);
    } catch (err) {
      setError(err.message || 'No pudimos crear la cuenta');
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <p className="auth-sub">
          Registrate para guardar tus compras y bajar las revistas cuando
          quieras.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span>Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="auth-field">
            <span>Repetir contraseña</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-alt">
          ¿Ya tenés cuenta?{' '}
          <Link href={`/login${next ? `?next=${next}` : ''}`}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
      <Footer />
    </>
  );
}
