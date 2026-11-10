export default function Irrigation() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Riego Automático 💧
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow border">

        <p className="mb-4">Estado del sistema:</p>

        <span className="text-green-600 font-bold">
          Sistema activo
        </span>

        <button className="block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
          Activar Riego Manual
        </button>

      </div>
    </div>
  );
}