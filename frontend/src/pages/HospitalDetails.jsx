import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../api/client";

const HospitalDetails = () => {
  const { tenantId } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchHospital = async () => {
      try {
        const res = await apiClient.get(`/hospitals/${tenantId}`);
        if (mounted) setHospital(res.data.data);
      } catch (err) {
        if (mounted)
          setError(err.response?.data?.message || "Failed to load hospital");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHospital();
    return () => {
      mounted = false;
    };
  }, [tenantId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded shadow-sm border">
        <h2 className="text-2xl font-semibold mb-2">{hospital.name}</h2>
        <p className="text-sm text-secondary-600 mb-2">
          {hospital.city}, {hospital.state}
        </p>
        <p className="text-sm text-secondary-500 mb-4">{hospital.address}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Contact:</strong> {hospital.contactNumber}
            </p>
            <p>
              <strong>Admin Email:</strong> {hospital.adminEmail}
            </p>
            <p>
              <strong>License:</strong> {hospital.licenseNumber}
            </p>
          </div>
          <div>
            <p>
              <strong>Status:</strong> {hospital.status}
            </p>
            <p>
              <strong>Tenant ID:</strong> {hospital.tenantId}
            </p>
            <p className="mt-4">
              <Link to="/register-hospital" className="btn btn-primary">
                Register Hospital
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;
