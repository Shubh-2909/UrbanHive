import mongoose from "mongoose";

export const connectDB = (uri) => {
  mongoose
    .connect(uri, {
      dbName: "Ecommerce_24",
    })
    .then(console.log("DB Connected"))
    .catch((err) => console.log(err));
};
