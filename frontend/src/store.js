import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialComplaintState = {
  customer_name: '',
  product_name: '',
  product_strength: '',
  batch_number: '',
  affected_quantity: '',
  manufacturing_date: '',
  expiry_date: '',
  defect_description: '',
  risk_severity: '', // Critical, Major, Minor
  next_action: '',
  suggested_root_cause: '',
  recommended_capa: ''
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState: {
    formData: initialComplaintState,
    chatHistory: [
      {
        sender: 'ai',
        message: 'Hello Shreeja! I am your PharmaPulse AI QMS Co-pilot. Describe a customer complaint or upload a document to auto-populate the log form.'
      }
    ],
    loading: false
  },
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    addMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetForm: (state) => {
      state.formData = initialComplaintState;
    }
  }
});

export const { updateFormData, addMessage, setLoading, resetForm } = complaintSlice.actions;

export const store = configureStore({
  reducer: {
    complaint: complaintSlice.reducer
  }
});