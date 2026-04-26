/**
 * COMPONENTE WELCOME / BIENVENIDA
 * Sección de introducción a Picnic Magazine
 */
function Welcome() {
  const welcomeText = [
    'Si estás leyendo esto seguramente ya sabés dónde estás. ¡Bienvenidx a PICNIC! Este es nuestro primer número y te agradecemos profundamente que lo estés leyendo. También si estás acá, en un principio, hay una gran probabilidad de que compartamos bastantes gustos. Eso es también lo que hacemos. Recapitulemos: PICNIC, la revista del arte fino, tiene como razón de ser la creación de contenidos periodísticos sobre arte en general (¡no dejamos afuera a nadie!). Nos gusta el cine, la música, el teatro, la pintura, la escultura, la literatura, la poesía. Todo tipo de arte.',
    '¿Por qué arte fino? Consideramos que toda expresión artística, si atraviesa un sentimiento, tiene una razón de ser. Si hacés una búsqueda rápida en Google sobre qué es el arte fino, seguramente te salga que es un tipo de arte visual creado principalmente con propósitos estéticos, intelectuales o emocionales, en contraposición a las artes decorativas o utilitarias.',
    'Por eso mismo es que consideramos que hacemos periodismo de arte fino. El arte fino nos emociona y por eso es que todos los días elegimos poner el cuerpo a su disposición: ir a lugares donde se respire arte fino y nos rodee por completo y, justamente por eso, es que nos pareció incluso más interesante también hablar con los artistas y hacerles toda clase de preguntas.',
    'Creemos que también es otra forma de popularizar el arte y democratizarlo. Hay momentos en que pensamos: "si nadie graba esto, ¿realmente existió?" Consideramos que hay artistas que nos gustan tanto que queremos compartirlos con todo el mundo. Esa será la base de siempre. Y, por último, en la base de la revista también estás vos, ¡fiel lectorx! Ahora vos también tenés la potestad de contarle a todo el mundo que hay un lugar en donde hablan de lo que te gusta'
  ];

  return (
    <section id="bienvenida" className="seccion-bienvenida">
      <div className="bienvenida-content">
        {welcomeText.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export default Welcome;
