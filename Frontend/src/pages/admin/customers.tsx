import { ReactElement, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import React from "react";
import { UserReducerInitialState } from "../../types/reducer-types";
import { useSelector } from "react-redux";
import { useAllUsersQuery, useDeleteUserMutation } from "../../redux/api/userAPI";
import toast from "react-hot-toast";
import { CustomError } from "../../types/api-types";
import { Link } from "react-router-dom";
import { Skeleton } from "../../components/Loader";
import { responseToast } from "../../utils/features";

interface DataType {
  avatar: ReactElement;
  name: string;
  email: string;
  gender: string;
  role: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Avatar",
    accessor: "avatar",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Gender",
    accessor: "gender",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Role",
    accessor: "role",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];



const Customers = () => {

  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState }) => state.userReducer
  );

  const { isLoading, data, isError , error} = useAllUsersQuery(user?._id!);

  const [rows, setRows] = useState<DataType[]>([]);

  const [deleteUser] = useDeleteUserMutation();

  const deleteHandler = async (userId : string) => {
    if(userId === user?._id) return toast("Cannot delete the same id that you are login with.. ");

    const res = await deleteUser({ userId , adminUserId : user?._id! });
    responseToast(res ,null , "" )
  }

  if(isError) toast.error((error as CustomError).data.message);

  useEffect(() => {
    if(data) setRows(data?.users?.map((i) => ({
       avatar : <img 
       style={{
        borderRadius: "50%"
       }} src={i.photo}
       alt={i.name}/>,
       name : i.name,
       email : i.email,
       gender : i.gender,
       role : i.role,
       action : <button onClick={() => deleteHandler(i._id)}>
        <FaTrash/>
       </button>,
    }))
  );
  } , [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Customers",
    rows.length > 6
  )();

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading ? <Skeleton length={20}/> : Table}</main>
    </div>
  );
};

export default Customers;
