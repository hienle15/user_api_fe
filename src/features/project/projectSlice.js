import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;



export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async () => {
    const res = await axios.get(`${API_URL}/projects`);
    return res.data.data;
  }
);
export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/projects`, projectData);
      return { ...projectData, message: res.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/projects/${id}`, projectData);
      return res.data.data;
    } catch (err) {
      console.error("🔥 updateProject error:", err); // thêm log
      return rejectWithValue(err?.response?.data?.message || err.message || "Unknown error");
    }
  }
);

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
    try {
        const res = await axios.delete(`${API_URL}/projects/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});
const projectsSlice = createSlice({
    name: 'projects',
    initialState: {
        projects: [],
        loading: false,
        error: null,
        message: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            //fetch
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //create
            .addCase(createProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projects.push(action.payload);
                state.message = action.payload.message;
            })
            .addCase(createProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //update
            .addCase(updateProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = state.projects.map(p => p.id === action.payload.id ? action.payload : p);
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //delete
            .addCase(deleteProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.loading = false;
               state.projects = state.projects.filter(p => p.id !== action.payload);

            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});
export default projectsSlice.reducer;