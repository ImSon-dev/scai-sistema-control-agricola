import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md p-6">

      <h2 className="text-xl font-bold mb-6">Mi Finca</h2>

      <nav className="flex flex-col gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/nutrients">Nutrientes</Link>
        <Link to="/profile">Perfil</Link>
      </nav>

    </div>
  );
}