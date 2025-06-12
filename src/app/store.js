import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import projectsReducer from "../features/project/projectSlice";
const store = configureStore({
  reducer: {
    users: userReducer,
     projects: projectsReducer,
  }
});

export default store;