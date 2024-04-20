import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { column } from "react-table";
import TableHOC from "../components/admin/TableHOC";

import { useMyOrdersQuery } from "../redux/api/orderAPI";
import { Skeleton } from "../components/Loader";

const Orders = () => {
  const { user } = useSelector((state) => state.userReducer);


  const { isLoading, data, isError, error } = useMyOrdersQuery(user?._id);
  

  const [rows, setRows] = useState([]);

  if (isError) {
    const err = error;
    toast.error(err.data.message);
  }

  useEffect(() => {
    if (data && data.orders) {
      setRows(
        data.orders.map((i) => ({
          _id: i._id,
          amount: i.total,
          discount: i.discount,
          quantity: i.orderItems.length,
          status: (
            <span
              className={
                i.status === "Processing"
                  ? "red"
                  : i.status === "Shipped"
                  ? "green"
                  : "purple"
              }
            >
              {i.status}
            </span>
          ),
          action: <Link to={`/admin/transaction/${i._id}`}>Manage</Link>,
        }))
      );
    }
  }, [data]);

  const Table = TableHOC(
    column,
    rows,
    "dashboard-product-box",
    "Orders",
    rows.length > 6
  )();
  return (
    <div className="container">
      <h1>My Orders</h1>
      {isLoading ? <Skeleton length={20} /> : Table}
    </div>
  );
};

export default Orders;
