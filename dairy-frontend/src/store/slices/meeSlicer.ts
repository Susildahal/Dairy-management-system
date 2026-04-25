import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axiosInstance"

interface MeeState {
  data: unknown | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

export const getmee = createAsyncThunk("get/mee", async () => {
  const response = await axiosInstance.get("/users/me")
  return response.data.data
})

const initialState: MeeState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
}

const meeSlicer = createSlice({
  name: "mee",
  initialState,
  reducers: {
    clearMeeData: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getmee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getmee.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(getmee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Failed to fetch user data"
        state.lastFetched = Date.now() // Track attempt to avoid infinite fetch loops
        // Clear user data on authentication failure
        if (action.error.message?.includes('401') || action.error.message?.includes('Unauthorized')) {
          state.data = null
        }
      })
  },
})

export const { clearMeeData } = meeSlicer.actions
export default meeSlicer.reducer