import { welcome } from '../data/data';

/**
 * COMPONENTE WELCOME / BIENVENIDA
 * Sección de introducción a Picnic Magazine.
 * El texto vive en data.js. Inserta un pull quote después del párrafo
 * indicado por welcome.pullQuoteAfter.
 */
function Welcome() {
  const { paragraphs, pullQuote, pullQuoteAfter } = welcome;

  return (
    <section id="bienvenida" className="seccion-bienvenida">
      <div className="bienvenida-content">
        {paragraphs.map((paragraph, index) => (
          <div key={index}>
            <p>{paragraph}</p>
            {pullQuote && index === pullQuoteAfter && (
              <blockquote className="bienvenida-pull-quote">
                {pullQuote}
              </blockquote>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Welcome;
