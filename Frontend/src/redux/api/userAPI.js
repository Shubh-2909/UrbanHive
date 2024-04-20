import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";

export const userAPI = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/user/`,
  }),
  tagTypes: ["users"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (user) => ({
        url: "new",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"]
    }),

    deleteUser: builder.mutation({
      query: ({userId , adminUserId}) => ({
        url:`${userId}?id=${adminUserId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["users"]
    }),

    allUsers: builder.query({
      query: (id) => `all?id=${id}`,
      providesTags:["users"]
    })
  }),
});

export const getUser = async (id) => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_SERVER}/api/v1/user/${id}`
    );
    console.log(data)
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const { useLoginMutation , useAllUsersQuery , useDeleteUserMutation} = userAPI;
