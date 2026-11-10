import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <h1 className="text-green-600 font-bold text-lg">
        🌱 SCAI-PRO
      </h1>

      <div className="flex gap-4">
        <button onClick={() => navigate("/nutrients")}>Nutrientes</button>
        <button onClick={() => navigate("/profile")}>Perfil</button>
        <button onClick={logout}>Salir</button>
      </div>

    </div>
  );
}