import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { serviceUrl } from "../Services/url";
import axios from 'axios';

// Signup API
export const signup = createAsyncThunk(
    'auth/signup',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${serviceUrl}/auth/register`, userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response);
        }
    }
);

// Login API
export const login = createAsyncThunk(
    'auth/login',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${serviceUrl}/auth/login`, userData);
            localStorage.setItem('token', response.data.token)
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response);
        }
    }
)

// Update Business Profile API
export const updateBusinessProfile = createAsyncThunk(
    'auth/updateBusinessProfile',
    async (formData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            const response = await axios.post(
                `${serviceUrl}/auth/updateBusinessProfile`,
                formData,
                config
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get Business Profile API
export const getBusinessProfile = createAsyncThunk(
    'auth/getBusinessProfile',
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${serviceUrl}/auth/getBusinessProfile`, {
                params: { email },
            });
            return response.data.businessProfile;
        } catch (error) {
            return rejectWithValue(error.response);
        }
    }
);

// Add Schedule Delivery API
export const addScheduleDeliveries = createAsyncThunk(
    'scheduleDeliveries/addScheduleDeliveries',
    async (scheduleData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            };
            const response = await axios.post(`${serviceUrl}/scheduleDeliveries/addSchedule`, scheduleData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get Schedule Deliveries API
export const getScheduleDeliveries = createAsyncThunk(
    'scheduleDeliveries/getScheduleDeliveries',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found in localStorage!");
            }
            const config = {
                header: {
                    'Authorization': token,
                }
            };
            const response = await axios.get(`${serviceUrl}/scheduleDeliveries/getSchedule`, config);
            return response.data.schedules;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const userSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        error: null,
        loading: false,
        profile: null,
        schedules: [] // Added schedule deliveries state
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBusinessProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBusinessProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(getBusinessProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addScheduleDeliveries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addScheduleDeliveries.fulfilled, (state, action) => {
                state.loading = false;
                // state.schedules.push(action.payload.schedule); // Append new schedule
            })
            .addCase(addScheduleDeliveries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getScheduleDeliveries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getScheduleDeliveries.fulfilled, (state, action) => {
                state.loading = false;
                state.schedules = action.payload;
            })
            .addCase(getScheduleDeliveries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
})

export default userSlice.reducer;
