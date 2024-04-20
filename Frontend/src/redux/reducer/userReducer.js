import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    user:null,
    loading:true
};

export const userReducer = createSlice({
    name: "userReducer",
    initialState,
    reducers:{
       userExist : (state , action) => {
         state.loading = false;
         state.user= action.payload.user;
       },
       userNotExist : (state) => {
        state.loading = false;
        state.user= null;
      }
    },
})

export const {userExist , userNotExist} = userReducer.actions