import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/order/`,
    }),
    tagTypes:["orders"],
    endpoints: (builder) => ({
        newOrder:builder.mutation({
            query:(order) => ({
                url : "new",
                method:"POST",
                body:order
            }),
            invalidatesTags:["orders"]
        }),
        updateOrder:builder.mutation({
            query:({userId , orderId}) => ({
                url : `${orderId}?id=${userId}`,
                method:"PUT",
            }),
            invalidatesTags:["orders"]
        }),
        deleteOrder:builder.mutation({
            query:({userId , orderId}) => ({
                url : `${orderId}?id=${userId}`,
                method:"DELETE",
            }),
            invalidatesTags:["orders"]
        }),
        myOrders:builder.query({
            query:(id) => `my?id=${id}`,
            providesTags:["orders"]
        }),
        allOrders:builder.query({
            query:(id) => `all?id=${id}`,
            providesTags:["orders"]
        }),
        orderDetails:builder.query({
            query:(id) => id,
            providesTags:["orders"]
        }) 
    }),
})


export const  {useNewOrderMutation , useUpdateOrderMutation , useDeleteOrderMutation , useMyOrdersQuery , useAllOrdersQuery , useOrderDetailsQuery} = orderApi;