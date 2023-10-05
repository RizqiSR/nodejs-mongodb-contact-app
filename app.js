// 1. require module express & ejs
const express = require("express");
const expressLayouts = require("express-ejs-layouts");

// 10. Install 3 modules yg dipakai untuk kasih flash message (menampilkan pesan ketika data berhasil di-tambah/hapus/ubah):
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// 8. Require koneksinya dari 'db.js' => TIDAK pakai const karena yg dipakai hanya koneksinya saja
require("./utils/db");

// 9. Require contact.js => untuk menggunakan model yang sudah dibuat
const Contact = require("./model/contact");

// 2. inisiasi port & panggil aplikasi express
const port = 3000;
const app = express();

// 4. Set up EJS sebagai view engine yang digunakan untuk menampilkan layout yang kita buat ke halaman web
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// 11. Konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// 5. Render halaman & data yang dibutuhkan untuk ditampilkan di halaman web pada root yang sudah ditentukan dengan app.get()
//  layout (tampilan) yang akan ditampilkan di halaman web berformat .ejs (harus disimpan dalam folder 'views')
// # 5.a. Halaman Index
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Rizqi",
      email: "rizqi@gmail.com",
    },
    {
      nama: "Siti",
      email: "siti@gmail.com",
    },
    {
      nama: "Rahmah",
      email: "rahmah@gmail.com",
    },
  ];

  res.render("index", {
    layout: "layouts/main-layout",
    nama: "Rizqi",
    mahasiswa,
    title: "Halaman Home",
  });
  console.log("Ini halaman home");
});

// # 5.b. Halaman About
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
});

// # 5.c. Halaman Contact
app.get("/contact", async (req, res) => {
  // 9. Gunakan async/await => karena find() masih berbentuk promise,
  // # 9.a. Dengan async/await, [const contacts] bentuknya sudah jadi array of object
  const contacts = await Contact.find();

  // # 9.b. render halaman agar bisa ditampilkan di halaman web
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Contact Page",
    contacts,
    msg: req.flash("msg"),
  });
});

// # 5.d. Halaman Detail Contact
app.get("/contact/:nama", async (req, res) => {
  // 12. Gunakan findOne, dengan terlebih dahulu panggil model-nya, 'Contact'
  const contact = await Contact.findOne({nama: req.params.nama})

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Detail Page",
    contact,
  });
});

// 3. Jalankan aplikasi
app.listen(port, () => {
  console.log(`MongoDB Contact App | Listening at http://localhost:${port}`);
});

// 6. Buat folder 'utils' yg berisi 'db.js' => hanya untuk koneksi ke database
// 7. Buat folder 'model' yg berisi 'contact.js' => menyimpan model/struktur/schema data
