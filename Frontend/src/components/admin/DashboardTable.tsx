import React from "react";
import { Column } from "react-table";
import TableHOC from "./TableHOC";

// Define the data type for the DashboardTable component
interface DataType {
  _id: string;
  quantity: number;
  discount: number;
  amount: number;
  status: string;
}

// Define the columns configuration
const columns: Column<DataType>[] = [
  {
    Header: "Id",
    accessor: "_id",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Status",
    accessor: "status",
  },
];

// Define the DashboardTable component
const DashboardTable = ({ data = [] }: { data: DataType[] }) => {
  return (
    <TableHOC
      columns={columns}
      data={data}
      className="transaction-box"
      title="Top Transaction"
    />
  );
};

// Export the DashboardTable component
export default DashboardTable;
