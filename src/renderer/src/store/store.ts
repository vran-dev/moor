import { configureStore } from '@reduxjs/toolkit'
import searchInPageBoxSlice from './searchInPageBox'

export default configureStore({
  reducer: {
    searchInPageBox: searchInPageBoxSlice
  }
})
