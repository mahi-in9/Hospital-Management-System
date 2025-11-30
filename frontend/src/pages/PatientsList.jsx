import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchPatients,
  setSelectedPatient,
  deletePatient,
} from "../redux/slices/patientSlice";

const PatientsList = () => {
  const dispatch = useDispatch();
  const { patients, loading, error, currentPage, totalPages } = useSelector(
    (state) => state.patient
  );

  useEffect(() => {
    dispatch(fetchPatients({ page: 1 }));
  }, [dispatch]);

  const handleEdit = (p) => {
    dispatch(setSelectedPatient(p));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this patient?")) {
      dispatch(deletePatient(id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Patients</h2>
        <Link to="/patients/new" className="btn btn-primary">
          New Patient
        </Link>
      </div>

      {loading && <p>Loading patients...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Patient ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-2">{p.patientId}</td>
                <td className="px-4 py-2">
                  {p.firstName} {p.lastName}
                </td>
                <td className="px-4 py-2">{p.phone}</td>
                <td className="px-4 py-2">{p.department}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2">
                  <Link
                    to={`/patients/${p._id}/edit`}
                    className="text-blue-600 mr-3"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div>
          {/* simple pagination controls */}
          <button
            disabled={currentPage <= 1}
            onClick={() => dispatch(fetchPatients({ page: currentPage - 1 }))}
            className="btn mr-2"
          >
            Prev
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => dispatch(fetchPatients({ page: currentPage + 1 }))}
            className="btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientsList;
