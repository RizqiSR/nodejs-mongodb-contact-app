// # 7.a. require lagi mongoose
const mongoose = require("mongoose");

// # 7.b. Membuat schema
// mongoose.model('nama model-nya apa', {diisi field2 yang mau diisi ke dalam collection contacts-nya})
// 'Contact' -> karena tunggal
// mongoose akan secara otomatis ditulis secara plural -> 'contacts' (sebagai nama collection baru di database 'mongodbdasar')
const Contact = mongoose.model("Contact", {
  nama: {
    type: String,
    required: true, // artinya => harus diisi
  },
  nohp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

// // # 7.c. untuk uji coba sudah/belum connect nodejs kita ke mongodb
// // -- a. manambah 1 data
// const contact1 = new Contact({
//   nama : "Siti",
//   nohp : '082113122727',
//   email: 'siti@gmail.com'
// })

// // -- b. simpan ke collection
// contact1.save().then((contact) => console.log(contact))

// # 7.d. Exports agar bisa digunakan di file yang berbeda (dimana dia di require)
module.exports = Contact;
