import React from 'react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Modern Hospital Management
            </h1>
            <p className="text-lg text-gray-700 max-w-xl">
              A multi-tenant, secure, and easy-to-use Hospital Management System. Register your hospital, manage patients, prescriptions, and staff — all from one beautiful dashboard.
            </p>

            <div className="flex space-x-4">
              <a href="/signup" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Sign up</a>
              <a href="/register-hospital" className="inline-block px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg shadow hover:bg-indigo-50 transition">Register Hospital</a>
              <a href="/hospitals/demo-hospital/immersive" className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-lg shadow hover:bg-indigo-50 transition">Enter Hospital (3D)</a>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              Trusted by hospitals and clinics. Start your free trial today.
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">Live Metrics</div>
                  <div className="text-2xl font-semibold text-gray-900">12,432</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Active Patients</div>
                  <div className="text-2xl font-semibold text-indigo-600">1,024</div>
                </div>
              </div>

              <div className="h-40 bg-gradient-to-r from-indigo-100 to-blue-50 rounded-lg flex items-center justify-center text-indigo-700"> 
                <svg width="160" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14 12 22 12 22C12 22 19 14 19 9C19 5.13 15.87 2 12 2Z" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11.5V13" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 7H13" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="mt-4 text-sm text-gray-600">Get started in minutes. No credit card required.</div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="font-semibold text-lg">Patient Management</h3>
            <p className="text-sm text-gray-600 mt-2">Register and search patients, manage admissions, and export records.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="font-semibold text-lg">Prescription Workflow</h3>
            <p className="text-sm text-gray-600 mt-2">Create prescriptions, support templates, and track dispensing.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="font-semibold text-lg">Role-based Access</h3>
            <p className="text-sm text-gray-600 mt-2">Fine-grained RBAC ensures each user sees only what they should.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
