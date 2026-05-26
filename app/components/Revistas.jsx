'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { secciones } from '../data/data';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { useRevistas } from '../context/RevistasProvider';
import { useEditMode } from '../context/EditModeProvider';
import { trackEvent } from '@/lib/analytics';
import RevistaEditModal from './RevistaEditModal';

const Revista3D = dynamic(() => import('./Revista3D'), {
  ssr: false,
  loading: () => <div className="revista-3d-canvas revista-3d-fallback" />,
});

/**
 * COMPONENTE REVISTAS
 *
 * Public: muestra la primera edición activa con escena 3D y botón de compra.
 * Edit mode: lista todas las ediciones (activas e inactivas) con controles
 * CRUD inline. PDF se sube desde el modal de edición (necesita el UUID).
 */
function Revistas() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    revistas,
    hydrated,
    createRevista,
    updateRevista,
    deleteRevista,
    toggleActiva,
  } = useRevistas();
  const { addToCart, setShowCart, hasInCart } = useCart();
  const { editMode } = useEditMode();
  const [editing, setEditing] = useState(null); // null | 'new' | <revista>

  const handleAdd = async (revistaId) => {
    if (!user) {
      router.push('/login?next=/');
      return;
    }
    const { error } = await addToCart(revistaId);
    if (!error) {
      trackEvent('add_to_cart', {
        userId: user.id,
        metadata: { revista_id: revistaId },
      });
      setShowCart(true);
    }
  };

  const handleSave = async (payload) => {
    if (editing === 'new') return createRevista(payload);
    return updateRevista(editing.id, payload);
  };

  const handlePdfUploaded = async (revistaId, newPath) => {
    await updateRevista(revistaId, { pdf_path: newPath });
    // Refrescá el editing state local para que el modal muestre el nuevo path
    setEditing((cur) =>
      cur && cur !== 'new' && cur.id === revistaId
        ? { ...cur, pdf_path: newPath }
        : cur
    );
  };

  const handleDelete = async (r) => {
    if (
      !confirm(
        `¿Borrar la edición #${r.numero_edicion}? Si ya tiene compras esto va a fallar (FK).`
      )
    )
      return;
    const { error } = await deleteRevista(r.id);
    if (error) {
      alert(
        'No se pudo borrar: ' +
          error.message +
          '\nTip: marcala como "inactiva" en vez de borrarla.'
      );
    }
  };

  const activas = revistas.filter((r) => r.activa);
  const publicas = activas.slice(0, 1); // primera activa para vista pública

  return (
    <section
      id={secciones.revistas.id}
      className={`seccion-placeholder seccion-placeholder--alt${editMode ? ' seccion--edit' : ''}`}
    >
      <div className="seccion-header">
        <h1>{secciones.revistas.titulo}</h1>
        <p className="seccion-descripcion">{secciones.revistas.descripcion}</p>
        {editMode && (
          <button
            className="edit-add-btn"
            onClick={() => setEditing('new')}
            type="button"
          >
            + Nueva edición
          </button>
        )}
      </div>

      {editMode ? (
        <div className="revistas-admin-list">
          {hydrated && revistas.length === 0 && (
            <p className="seccion-descripcion">No hay ediciones aún.</p>
          )}
          {revistas.map((r) => (
            <article
              key={r.id}
              className={`revista-admin-card${!r.activa ? ' revista-admin-card--inactive' : ''}`}
            >
              {r.portada_path ? (
                <img
                  src={r.portada_path}
                  alt={`Edición ${r.numero_edicion}`}
                  className="revista-admin-portada"
                />
              ) : (
                <div className="revista-admin-portada revista-admin-portada--empty">
                  Sin portada
                </div>
              )}
              <div className="revista-admin-info">
                <h3>
                  #{r.numero_edicion} — {r.titulo}
                </h3>
                <p className="revista-admin-meta">
                  ${r.precio} ·{' '}
                  {r.activa ? 'Activa' : 'Inactiva'} ·{' '}
                  {r.pdf_path ? 'PDF ✓' : 'Sin PDF'}
                </p>
                {r.descripcion && (
                  <p className="revista-admin-desc">{r.descripcion}</p>
                )}
              </div>
              <div className="edit-controls">
                <button type="button" onClick={() => toggleActiva(r.id)}>
                  {r.activa ? 'Desactivar' : 'Activar'}
                </button>
                <button type="button" onClick={() => setEditing(r)}>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  className="edit-delete"
                >
                  Borrar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="revistas-container revistas-container--3d">
          {!hydrated && (
            <div className="revista-item revista-item--3d">
              <Revista3D />
            </div>
          )}
          {hydrated && publicas.length === 0 && (
            <p className="seccion-descripcion">
              No hay revistas disponibles todavía.
            </p>
          )}
          {publicas.map((revista) => {
            const enCart = hasInCart(revista.id);
            return (
              <div key={revista.id} className="revista-item revista-item--3d">
                <Revista3D portadaPath={revista.portada_path} />
                <button
                  className="revista-add-btn revista-add-btn--3d"
                  onClick={() => handleAdd(revista.id)}
                  disabled={enCart}
                  aria-label={
                    enCart
                      ? 'Esta revista ya está en tu carrito'
                      : `Agregar Edición ${revista.numero_edicion} al carrito`
                  }
                >
                  {enCart ? 'En el carrito' : 'Agregar al carrito'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <RevistaEditModal
          revista={editing === 'new' ? null : editing}
          onSave={handleSave}
          onPdfUploaded={handlePdfUploaded}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

export default Revistas;
