'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthProvider';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completá email y contraseña');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    await register(email);
    router.push(next);
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
          <button type="submit" className="auth-submit">
            Crear cuenta
          </button>
        </form>
        <p className="auth-alt">
          ¿Ya tenés cuenta?{' '}
          <Link href={`/login${next ? `?next=${next}` : ''}`}>
            Iniciá sesión
          </Link>
        </p>
        <p className="auth-disclaimer">
          Modo demo: no se valida nada. Cuando se conecte la base de datos, los
          datos se guardan en el servidor.
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
