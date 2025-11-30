import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // In a real app you'd fetch details by roomId and tenant context
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button className="mb-6 text-sm text-indigo-600" onClick={() => navigate(-1)}>← Back</button>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-semibold">Room: {roomId}</h3>
          <p className="text-gray-600 mt-2">This is a placeholder room page. Replace with room-specific UI: schedules, equipment, assigned staff and patients.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">Current Patients</div>
              <div className="mt-3 text-lg font-medium">—</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">Assigned Staff</div>
              <div className="mt-3 text-lg font-medium">—</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
