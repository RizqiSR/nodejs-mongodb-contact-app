// # 6.a. Install Mongoose => MongoDB object modelling tool designed to work in an asynchronous env, supports both promises & callback
const mongoose = require("mongoose");

// # 6.b. Connect ke mongodb kita
mongoose.connect("mongodb://127.0.0.1:27017/mongodbdasar", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true, // # 6.c. untuk menambahkan index secara otomatis ke document yang kita buat
});
