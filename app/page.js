import Header from './components/Header';
import Hero from './components/Hero';
import Welcome from './components/Welcome';
import Articulos from './components/Articulos';
import Events from './components/Events';
import PicnicEscena from './components/PicnicEscena';
import Revistas from './components/Revistas';
import Integrantes from './components/Integrantes';
import Footer from './components/Footer';

/**
 * PÁGINA PRINCIPAL DE PICNIC
 *
 * Estructura:
 * 1. Header + Navegación
 * 2. Hero (video de fondo)
 * 3. Welcome (sección de bienvenida)
 * 4. Articulos
 * 5. Events (eventos próximos y pasados)
 * 6. Picnic en la escena (gracias por la intercomunicación + picnic en la tierra)
 * 7. Revistas (carrito de compras)
 * 8. Integrantes (equipo)
 * 9. Footer
 */
export default function Home() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Welcome />
      <Articulos />
      <Events />
      <PicnicEscena />
      <Revistas />
      <Integrantes />
      <Footer />
    </div>
  );
}
