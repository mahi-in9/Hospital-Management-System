import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prescriptions: [],
  selectedPrescription: null,
  loading: false,
  error: null,
};

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    fetchPrescriptionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPrescriptionsSuccess: (state, action) => {
      state.prescriptions = action.payload;
      state.loading = false;
    },
    fetchPrescriptionsFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedPrescription: (state, action) => {
      state.selectedPrescription = action.payload;
    },
  },
});

export const {
  fetchPrescriptionsStart,
  fetchPrescriptionsSuccess,
  fetchPrescriptionsFailed,
  setSelectedPrescription,
} = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
