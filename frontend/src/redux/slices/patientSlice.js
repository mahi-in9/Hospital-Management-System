import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

const initialState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
};

export const fetchPatients = createAsyncThunk(
  "patient/fetchPatients",
  async ({ page = 1, limit = 20, search = "" } = {}) => {
    const res = await apiClient.get("/patients", {
      params: { page, limit, search },
    });
    return res.data.data;
  }
);

export const fetchPatient = createAsyncThunk(
  "patient/fetchPatient",
  async (id) => {
    const res = await apiClient.get(`/patients/${id}`);
    return res.data.data;
  }
);

export const createPatient = createAsyncThunk(
  "patient/createPatient",
  async (data) => {
    const res = await apiClient.post("/patients", data);
    return res.data.data;
  }
);

export const updatePatient = createAsyncThunk(
  "patient/updatePatient",
  async ({ id, data }) => {
    const res = await apiClient.put(`/patients/${id}`, data);
    return res.data.data;
  }
);

export const deletePatient = createAsyncThunk(
  "patient/deletePatient",
  async (id) => {
    const res = await apiClient.delete(`/patients/${id}`);
    return res.data.data;
  }
);

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.patients || action.payload;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(fetchPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPatient = action.payload;
      })
      .addCase(fetchPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(createPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.unshift(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.selectedPatient = action.payload;
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter(
          (p) => p._id !== action.payload._id
        );
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setSelectedPatient } = patientSlice.actions;
export default patientSlice.reducer;
