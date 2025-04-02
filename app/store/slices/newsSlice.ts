import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Article, fetchCryptoNews } from '../../services/newsApi';

// Define news state
interface NewsState {
  data: Article[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: NewsState = {
  data: [],
  loading: false,
  error: null,
};

// Thunk to fetch news data
export const fetchNewsData = createAsyncThunk(
  'news/fetchNewsData',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const newsData = await fetchCryptoNews(limit);
      return newsData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch news data');
    }
  }
);

// Create the news slice
export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    // Manually set news data (for testing/demo purposes)
    setNewsItems: (state, action: PayloadAction<Article[]>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  // Add async reducers for API calls
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNewsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
      });
  },
});

// Export actions
export const { setNewsItems } = newsSlice.actions;

// Export reducer
export default newsSlice.reducer; 