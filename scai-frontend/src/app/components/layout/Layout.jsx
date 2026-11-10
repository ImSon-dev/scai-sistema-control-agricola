import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const active = (path) =>
    location.pathname === path
      ? "text-green-600 font-semibold"
      : "text-gray-500";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-soft">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">

        <div>
          <h2 className="text-xl font-bold mb-8">🌱 SCAI-PRO</h2>

          <nav className="flex flex-col gap-5">
            <Link to="/dashboard" className={active("/dashboard")}>
              Dashboard
            </Link>

            <Link to="/nutrients" className={active("/nutrients")}>
              Nutrientes
            </Link>

            <Link to="/irrigation" className={active("/irrigation")}>
              Riego
            </Link>

            <Link to="/profile" className={active("/profile")}>
              Perfil
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-red-500 text-sm text-left hover:underline"
        >
          Cerrar sesión
        </button>

      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}