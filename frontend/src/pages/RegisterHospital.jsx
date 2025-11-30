import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import apiClient from "../api/client";

const registrationSchema = yup.object().shape({
  name: yup.string().required("Hospital name is required").min(3),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zipCode: yup.string().required("Zip code is required"),
  contactNumber: yup.string().required("Contact number is required"),
  adminEmail: yup
    .string()
    .email("Invalid email")
    .required("Admin email is required"),
  phone: yup.string().required("Phone is required"),
  licenseNumber: yup.string().required("License number is required"),
  domain: yup
    .string()
    .required("Hospital domain is required")
    .matches(/^[a-z0-9-]+$/, "Domain must be lowercase alphanumeric"),
});

const RegisterHospital = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/register-hospital", data);
      setSuccess(true);
      setRegistrationData(response.data.data);

      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="card-body text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-primary-700">
                Registration Successful!
              </h2>

              <div className="bg-secondary-50 p-4 rounded-lg space-y-2 text-left">
                <p>
                  <strong>Tenant ID:</strong> {registrationData?.tenantId}
                </p>
                <p>
                  <strong>Hospital:</strong> {registrationData?.hospitalName}
                </p>
                <p>
                  <strong>Admin Email:</strong> {registrationData?.adminEmail}
                </p>
                <p>
                  <strong>Temporary Password:</strong>{" "}
                  {registrationData?.temporaryPassword}
                </p>
              </div>

              <p className="text-secondary-600 text-sm">
                A verification email has been sent to{" "}
                {registrationData?.adminEmail}. Please verify your email before
                logging in.
              </p>

              <p className="text-xs text-secondary-500">
                Redirecting to login in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-primary-700">
              Hospital Registration
            </h1>
            <p className="text-secondary-600 mt-2">
              Register your hospital to get started
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="card-body space-y-4"
          >
            {error && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="input-field"
                  placeholder="XYZ Hospital"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Domain (Lowercase) *
                </label>
                <input
                  type="text"
                  {...register("domain")}
                  className="input-field"
                  placeholder="xyz-hospital"
                />
                {errors.domain && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.domain.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  {...register("address")}
                  className="input-field"
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  License Number *
                </label>
                <input
                  type="text"
                  {...register("licenseNumber")}
                  className="input-field"
                  placeholder="LIC-12345"
                />
                {errors.licenseNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.licenseNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  {...register("city")}
                  className="input-field"
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  {...register("state")}
                  className="input-field"
                  placeholder="NY"
                />
                {errors.state && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Zip Code *
                </label>
                <input
                  type="text"
                  {...register("zipCode")}
                  className="input-field"
                  placeholder="10001"
                />
                {errors.zipCode && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Admin Email *
                </label>
                <input
                  type="email"
                  {...register("adminEmail")}
                  className="input-field"
                  placeholder="admin@hospital.com"
                />
                {errors.adminEmail && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.adminEmail.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  {...register("contactNumber")}
                  className="input-field"
                  placeholder="+1-555-0000"
                />
                {errors.contactNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="input-field"
                  placeholder="+1-555-0000"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register Hospital"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterHospital;
