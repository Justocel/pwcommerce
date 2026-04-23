import './styles/global.css';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Welcome from './components/Welcome';
import Events from './components/Events';
import VideoSection from './components/VideoSection';
import Revistas from './components/Revistas';
import Integrantes from './components/Integrantes';
import Footer from './components/Footer';
import { videosGracias, videosPicnic, secciones } from './data/data';

/**
 * COMPONENTE APP
 * Contenedor principal de la aplicación Picnic Magazine
 *
 * Estructura:
 * 1. Header + Navegación
 * 2. Hero (video de fondo)
 * 3. Welcome (sección de bienvenida)
 * 4. Events (eventos pasados y futuros)
 * 5. Videos Gracias por la intercomunicación
 * 6. Videos Picnic en la tierra
 * 7. Revistas (carrito de compras)
 * 8. Integrantes (equipo)
 * 9. Footer
 */
function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Welcome />
      <Events />
      <VideoSection
        sectionData={secciones.gracias}
        videos={videosGracias}
      />
      <VideoSection
        sectionData={secciones.picnic}
        videos={videosPicnic}
      />
      <Revistas />
      <Integrantes />
      <Footer />
    </div>
  );
}

export default App;
