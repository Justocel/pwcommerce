'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthProvider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completá email y contraseña');
      return;
    }
    await login(email);
    router.push(next);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>
        <p className="auth-sub">
          Ingresá con tu email para acceder a las revistas que ya compraste.
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
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit">
            Entrar
          </button>
        </form>
        <p className="auth-alt">
          ¿No tenés cuenta?{' '}
          <Link href={`/registrarme${next ? `?next=${next}` : ''}`}>
            Registrate
          </Link>
        </p>
        <p className="auth-disclaimer">
          Modo demo: cualquier email y contraseña funcionan. Cuando se conecte
          la base de datos, se valida acá.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  );
}
