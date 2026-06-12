import PagoResultado from '../PagoResultado';

export const metadata = { title: 'Pago rechazado — Picnic' };

export default function PagoErrorPage() {
  return (
    <PagoResultado
      variant="error"
      titulo="No pudimos procesar tu pago"
      subtitulo="Mercado Pago rechazó la transacción."
      mensaje="No se te cobró nada. Probá con otro medio de pago o revisá los datos de tu tarjeta."
      primaryHref="/"
      primaryText="Intentar de nuevo"
    />
  );
}
