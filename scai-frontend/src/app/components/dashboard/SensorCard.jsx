export default function SensorCard({ title, value, unit, status, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-500 font-medium">{title}</h3>
        <div className="text-xl">{icon}</div>
      </div>

      <div className="text-4xl font-bold text-gray-800">
        {value}
        <span className="text-lg ml-1 text-gray-400">{unit}</span>
      </div>

      <span className="inline-block mt-3 px-3 py-1 text-sm bg-green-100 text-green-600 rounded-full">
        {status}
      </span>
    </div>
  );
}