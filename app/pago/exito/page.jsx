import PagoResultado from '../PagoResultado';

export const metadata = { title: 'Compra confirmada — Picnic' };

export default function PagoExitoPage() {
  return (
    <PagoResultado
      variant="exito"
      titulo="¡Compra confirmada!"
      subtitulo="Tu pago fue aprobado por Mercado Pago."
      mensaje="Ya podés leer la revista en tu biblioteca. Si todavía no la ves, recargá la página."
      primaryHref="/mis-revistas"
      primaryText="Ir a mis revistas"
    />
  );
}
