import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "../Styles/Profile.css";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    farm: "",
    phone: "",
    location: "",
    size: "",
    crops: "",
    description: "",
  });

  // 🔄 CARGAR DATOS
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setForm({
          name: data.name || "",
          email: data.email || user.email || "",
          farm: data.farm || "",
          phone: data.phone || "",
          location: data.location || "",
          size: data.size || "",
          crops: data.crops || "",
          description: data.description || "",
        });
      } else {
        setForm((prev) => ({
          ...prev,
          email: user.email,
        }));
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  // ✏️ HANDLE CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ VALIDACIÓN BÁSICA
  const validate = () => {
    if (!form.name) return "El nombre es obligatorio";
    if (!form.farm) return "La finca es obligatoria";
    return null;
  };

  // 💾 GUARDAR
  const handleSave = async () => {
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const user = auth.currentUser;
      if (!user) return;

      await setDoc(
        doc(db, "users", user.uid),
        {
          ...form,
          email: user.email,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setMessage("Perfil actualizado correctamente 🚀");
    } catch (error) {
      console.error(error);
      setMessage("Error al guardar ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader">Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <h2>Perfil del Agricultor 🌱</h2>

      {message && <div className="message">{message}</div>}

      <div className="profile-grid">
        {/* CARD */}
        <div className="profile-card">
          <div className="avatar">👤</div>
          <h3>{form.name || "Sin nombre"}</h3>
          <p>{form.farm || "Sin finca"}</p>
          <p>{form.email}</p>
        </div>

        {/* FORM */}
        <div className="profile-form">
          <h3>Información del Perfil</h3>

          <div className="grid">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre completo" />
            <input name="email" value={form.email} disabled />

            <input name="farm" value={form.farm} onChange={handleChange} placeholder="Nombre de la finca" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" />

            <input name="location" value={form.location} onChange={handleChange} placeholder="Ubicación" />
            <input name="size" value={form.size} onChange={handleChange} placeholder="Hectáreas" />

            <input name="crops" value={form.crops} onChange={handleChange} placeholder="Cultivos" />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción de la finca"
            />
          </div>

          <button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}