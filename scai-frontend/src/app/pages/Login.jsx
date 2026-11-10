import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {
  const [tab, setTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [farm, setFarm] = useState("");

  const navigate = useNavigate();

  // LOGIN
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert("Error al iniciar sesión");
    }
  };

  // REGISTER
const register = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // 🔥 GUARDAR EN FIRESTORE
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      farm: farm,
      createdAt: new Date(),
    });

    navigate("/dashboard");
  } catch (error) {
  console.error(error);
  alert(error.message);
}
};

  // RESET PASSWORD
  const resetPassword = async () => {
    if (!email) return alert("Ingresa tu correo");
    await sendPasswordResetEmail(auth, email);
    alert("Correo enviado");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#dbe9e4]">

      <div className="w-full max-w-md text-center">

        {/* LOGO */}
        <h1 className="text-2xl font-bold text-green-700 mb-2">
          🌱 SCAI-PRO
        </h1>

        <p className="text-gray-600 mb-6">
          Sistema de Monitoreo Agrícola Inteligente
        </p>

        {/* TABS */}
        <div className="flex bg-gray-200 rounded-full p-1 mb-6">
         <button
  onClick={() => setTab("login")} 
  className={`flex-1 py-2 rounded-full text-sm text-black ${
    tab === "login"
      ? "bg-white shadow font-semibold"
      : ""
  }`}
>
  Iniciar Sesión
</button>
          
 <button
  onClick={() => setTab("register")}
  className={`flex-1 py-2 rounded-full text-sm text-black ${
    tab === "register"
      ? "bg-white shadow font-semibold"
      : ""
  }`}
>
          
            Registrarse
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-left">

          {/* LOGIN */}
          {tab === "login" && (
            <>
              <h2 className="font-semibold text-lg mb-1">
                Bienvenido de vuelta
              </h2>

              <p className="text-gray-500 mb-4 text-sm">
                Ingresa tus credenciales para acceder
              </p>

              <label className="text-sm">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full mt-1 mb-3 p-3 rounded-lg bg-gray-100 outline-none"
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="text-sm">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 mb-3 p-3 rounded-lg bg-gray-100 outline-none"
                onChange={(e) => setPassword(e.target.value)}
              />

              <p
                onClick={resetPassword}
                className="text-green-600 text-sm mb-4 cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </p>

              <button
                onClick={login}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
              >
                Iniciar Sesión
              </button>
            </>
          )}

          {/* REGISTER (MISMO LUGAR, COMO FIGMA) */}
          {tab === "register" && (
            <>
              <h2 className="font-semibold text-lg mb-1">
                Crear cuenta
              </h2>

              <p className="text-gray-500 mb-4 text-sm">
                Completa el formulario para registrarte
              </p>

              <label className="text-sm">Nombre completo</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                className="w-full mt-1 mb-3 p-3 rounded-lg bg-gray-100 outline-none"
                onChange={(e) => setName(e.target.value)}
              />

              <label className="text-sm">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full mt-1 mb-3 p-3 rounded-lg bg-gray-100 outline-none"
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="text-sm">Nombre de la finca</label>
              <input
                type="text"
                placeholder="Mi Finca"
                className="w-full mt-1 mb-3 p-3 rounded-lg bg-gray-100 outline-none"
                onChange={(e) => setFarm(e.target.value)}
              />

              <label className="text-sm">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 mb-4 p-3 rounded-lg bg-gray-100 outline-none"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={register}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
              >
                Registrarse
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}