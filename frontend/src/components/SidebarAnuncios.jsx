export default function SidebarAnuncios({ items = [] }) {
  return (
    <aside className="space-y-3">
      {items.map(n => (
        <div
          key={n.id_notificacion || n.id_publicacion}
          className="bg-amber-50 border-l-4 border-amber-400 p-3 hover:bg-amber-100"
        >
          <h4 className="font-medium">{n.titulo}</h4>
          <p className="text-xs">
            {n.descripcion || n.contenido?.slice(0, 80)}
          </p>
        </div>
      ))}
    </aside>
  );
}