import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import patientReducer from "./slices/patientSlice";
import prescriptionReducer from "./slices/prescriptionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    prescription: prescriptionReducer,
  },
});
