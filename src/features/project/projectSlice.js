import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

// Tạo channel để giao tiếp giữa các tab
const projectsChannel = new BroadcastChannel('projects-channel');

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

      // Broadcast with the new project data
      projectsChannel.postMessage({
        type: 'PROJECT_CREATED',
        project: res.data.data,
        timestamp: Date.now()
      });

      return {
        ...res.data.data, // Use the response data instead of projectData
        message: res.data.message
      };
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
      //   return res.data.data;
      // Gửi thông điệp đến tất cả các tab rằng dự án đã được cập nhật
      projectsChannel.postMessage({
        type: 'PROJECT_UPDATED',
        project: res.data.data,
        timestamp: Date.now()
      });
      // return {
      //   ...res.data.data,    // Sử dụng data từ response
      //   message: res.data.message
      // };
       return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/projects/${id}`);
      // Trigger localStorage event
      projectsChannel.postMessage({
        type: 'PROJECT_DELETE',
        project: res.data.data,
        timestamp: Date.now()
      });
      // Gửi thông điệp đến tất cả các tab rằng dự án đã được xóa

      return id;
    } catch (err) {

      return rejectWithValue(err.response?.data?.message);
    }
  }
);
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
        // Add new project to beginning of array for immediate visibility
        state.projects.unshift(action.payload);
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

// Hàm này sẽ được gọi trong component để thiết lập polling
export function useProjectPolling() {
  const dispatch = useAppDispatch(); // Giả sử bạn có hook này để lấy dispatch

  useEffect(() => {
    const pollingInterval = setInterval(() => {
      dispatch(fetchProjects());
    }, 60000); // 1 phút

    return () => clearInterval(pollingInterval);
  }, [dispatch]);
}