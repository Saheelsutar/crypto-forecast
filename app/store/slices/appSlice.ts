import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state
interface AppState {
  isDarkMode: boolean;
  isNotificationsEnabled: boolean;
}

const initialState: AppState = {
  isDarkMode: false,
  isNotificationsEnabled: false,
};

// Create the slice
export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    toggleNotifications: (state) => {
      state.isNotificationsEnabled = !state.isNotificationsEnabled;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.isNotificationsEnabled = action.payload;
    },
  },
});

// Export the actions
export const { 
  toggleDarkMode, 
  toggleNotifications,
  setDarkMode,
  setNotificationsEnabled
} = appSlice.actions;

// Export the reducer
export default appSlice.reducer; 