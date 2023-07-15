import { createSlice } from '@reduxjs/toolkit'

export const searchInPageBoxSlic = createSlice({
  name: 'searchInPageBox',

  initialState: {
    value: false
  },

  reducers: {
    toggleSearchInPageBox: (state) => {
      state.value = !state.value
    }
  }
})

export const { toggleSearchInPageBox } = searchInPageBoxSlic.actions
export default searchInPageBoxSlic.reducer
