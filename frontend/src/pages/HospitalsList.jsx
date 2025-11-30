import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

const HospitalsList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchHospitals = async (p = 1, q = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/hospitals", {
        params: { page: p, limit: 20, search: q },
      });
      const data = res.data.data;
      setHospitals(data.hospitals || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchHospitals(1, search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Hospitals</h2>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals"
            className="input-field"
          />
          <button type="submit" className="btn">
            Search
          </button>
        </form>
      </div>

      {loading && <p>Loading hospitals...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {hospitals.map((h) => (
          <div
            key={h.tenantId}
            className="p-4 bg-white rounded shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{h.name}</h3>
                <p className="text-sm text-secondary-600">
                  {h.city}, {h.state}
                </p>
                <p className="text-sm text-secondary-500 mt-2">{h.address}</p>
              </div>
              <div className="text-right">
                <Link
                  to={`/hospitals/${h.tenantId}`}
                  className="btn btn-primary"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          Page {page} of {totalPages}
        </div>
        <div>
          <button
            disabled={page <= 1}
            onClick={() => fetchHospitals(page - 1, search)}
            className="btn mr-2"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchHospitals(page + 1, search)}
            className="btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalsList;
