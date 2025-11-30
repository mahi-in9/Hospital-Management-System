import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createPatient,
  fetchPatient,
  updatePatient,
} from "../redux/slices/patientSlice";

const PatientForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedPatient, loading } = useSelector((state) => state.patient);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "MALE",
    phone: "",
    address: "",
    patientType: "OPD",
    department: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchPatient(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedPatient && id) {
      setForm({
        firstName: selectedPatient.firstName || "",
        lastName: selectedPatient.lastName || "",
        dateOfBirth: selectedPatient.dateOfBirth
          ? selectedPatient.dateOfBirth.split("T")[0]
          : "",
        gender: selectedPatient.gender || "MALE",
        phone: selectedPatient.phone || "",
        address: selectedPatient.address || "",
        patientType: selectedPatient.patientType || "OPD",
        department: selectedPatient.department || "",
      });
    }
  }, [selectedPatient, id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      await dispatch(updatePatient({ id, data: form }));
    } else {
      await dispatch(createPatient(form));
    }

    navigate("/patients");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">
        {id ? "Edit Patient" : "New Patient"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First name"
            className="input-field"
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last name"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="input-field"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="input-field"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="input-field"
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="input-field"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            name="patientType"
            value={form.patientType}
            onChange={handleChange}
            className="input-field"
          >
            <option value="OPD">OPD</option>
            <option value="IPD">IPD</option>
          </select>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Department"
            className="input-field"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {id ? "Update" : "Create"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/patients")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
