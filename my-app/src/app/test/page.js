"use client";
import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function TestPage() {
  const [telefono, setTelefono] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toUpperCase();
    if (!t) return clientes;
    return clientes.filter(
      (c) =>
        (c.nombre || "").toUpperCase().includes(t) ||
        (c.telefono || "").toUpperCase().includes(t) ||
        (c.direccion || "").toUpperCase().includes(t)
    );
  }, [q, clientes]);

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) console.error(error);
    setClientes(data || []);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  const cleanPhone = (v) =>
    v.replace(/[^\d+]/g, "").slice(0, 15); // formatea suave

  async function guardar() {
    if (!telefono) {
      toast("El teléfono es obligatorio");
      return;
    }
    setSaving(true);
    const payload = {
      telefono: cleanPhone(telefono),
      nombre: (nombre || "").toUpperCase().trim(),
      direccion: (direccion || "").toUpperCase().trim(),
    };

    const { data, error } = await supabase.from("clientes").insert([payload]).select("*");
    setSaving(false);

    if (error) {
      console.error(error);
      toast("No se pudo guardar. Revisa políticas RLS.");
      return;
    }
    toast("Cliente guardado ✅");
    setTelefono("");
    setNombre("");
    setDireccion("");
    setClientes((prev) => [...prev, ...(data || [])]);
  }

  async function eliminar(telefono) {
    if (!confirm("¿Eliminar este cliente?")) return;
    const { error } = await supabase.from("clientes").delete().eq("telefono", telefono);
    if (error) {
      console.error(error);
      toast("No se pudo eliminar. Revisa políticas RLS.");
      return;
    }
    setClientes((prev) => prev.filter((x) => x.telefono !== telefono));
    toast("Cliente eliminado 🗑️");
  }

  function toast(msg) {
    const el = document.createElement("div");
    el.className = "lf-toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 1800);
  }

  const canSave = !!telefono && !saving;

  return (
    <main className="lf-wrap">
      <section className="lf-card">
        <header className="lf-header">
          <h1>📱 Prueba de conexión con Supabase</h1>
          <div className="lf-subtitle">El dato clave es el <b>Teléfono</b></div>
        </header>

        {/* FORM */}
        <div className="lf-form">
          <div className="lf-field">
            <label>Teléfono</label>
            <input
              inputMode="tel"
              placeholder="Ej: 912345678"
              value={telefono}
              onChange={(e) => setTelefono(cleanPhone(e.target.value))}
            />
          </div>

          <div className="lf-field">
            <label>Nombre</label>
            <input
              placeholder="Ej: Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="lf-field">
            <label>Dirección</label>
            <input
              placeholder="Ej: Av. Principal 123"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>

          <div className="lf-actions">
            <button className="lf-btn" disabled={!canSave} onClick={guardar}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="lf-card">
        <div className="lf-list-header">
          <h2>📋 Lista de Clientes</h2>
          <input
            className="lf-search"
            placeholder="Buscar por nombre, teléfono o dirección"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="lf-empty">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="lf-empty">Sin resultados</div>
        ) : (
          <ul className="lf-list">
            {filtered.map((c) => (
              <li key={c.telefono} className="lf-item">
                <div className="lf-item-text">
                  <strong>{(c.nombre || "").toUpperCase()}</strong>
                  <span> — {c.telefono} — {(c.direccion || "").toUpperCase()}</span>
                </div>
                <div className="lf-item-actions">
                  <button className="lf-btn ghost" onClick={() => eliminar(c.telefono)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
