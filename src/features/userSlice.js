import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
    const res = await axios.get(`${API_URL}/users`);

    return res.data.data;
});
export const createUser = createAsyncThunk('users/createUser', async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/users`, userData);
        return res.data;
    } catch (error) {
        // Return the complete error response
        return rejectWithValue(error.response?.data || {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
    }
});
export const updateUser = createAsyncThunk('users/updateUser',
    async ({ id, userData }, { rejectWithValue }) => {
        try {
          const res = await axios.put(`${API_URL}/users/${id}`, userData);
            return res.data;
        } catch (error) {
            // Return the complete error response
            return rejectWithValue(error.response?.data || {
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
        }
    }
);
export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
         const res = await axios.delete(`${API_URL}/users/${id}`);
            return { id, ...res.data }; // Return both id and response data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Delete failed');
        }
    }
);
const userSlice = createSlice({// tạo state ban đầu, định nghĩa reducers, tự động tạo action
    name: 'users',
    initialState: {
        users: [],
        loading: false,
        error: null,
    },
    reducers: [],// không cần action đồng bộ 
    extraReducers: (builder) => {
        //get
        builder
            .addCase(fetchUsers.pending, (state) => {// khi đang gọi api
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {//khi gọi api thành công
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {// khi gọi api thất bại
                state.loading = false;
                state.error = action.error.message;
            })
            //post
            .addCase(createUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.push(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                // Store the complete error info
                state.error = action.payload?.message || action.error.message;
            })

            //put
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                // Sửa lại cách access data từ payload
                const updatedUser = action.payload.data;
                state.users = state.users.map(user =>
                    user.id === updatedUser.id ? updatedUser : user
                );
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                // Store the complete error info 
                state.error = action.payload?.message || action.error.message;
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the deleted user from state
                state.users = state.users.filter(user => user.id !== action.payload.id);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});
export default userSlice.reducer;