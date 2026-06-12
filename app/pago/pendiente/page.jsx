import PagoResultado from '../PagoResultado';

export const metadata = { title: 'Pago pendiente — Picnic' };

export default function PagoPendientePage() {
  return (
    <PagoResultado
      variant="pendiente"
      titulo="Pago pendiente"
      subtitulo="Tu pago está siendo procesado por Mercado Pago."
      mensaje="Te vamos a habilitar la revista en cuanto se acredite. Esto puede tardar unos minutos (efectivo en Pago Fácil/Rapipago tarda más)."
      primaryHref="/mis-ordenes"
      primaryText="Ver mis órdenes"
    />
  );
}
