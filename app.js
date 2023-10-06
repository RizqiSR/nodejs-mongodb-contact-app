// 1. require module express & ejs
const express = require("express");
const expressLayouts = require("express-ejs-layouts");

// 13. install & require express-validator => untuk validasi inputan form 'add-contact'
const { body, validationResult, check } = require("express-validator");

// 14. Install & require method-override untuk menggunakan app.delete() / app.put()
const methodOverride = require("method-override");

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

// # 14.a. Setup method-override
app.use(methodOverride("_method"));

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

// # 5.e. Halaman form tambah data
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form add contact",
    layout: "layouts/main-layout",
  });
});

// # 13.a Fitur proses tambah data contact dari form 'add-contact': method="post"
// -- penting: ingat req.body, karena data akan ditangkap disini (propertinya berisi key-value pair dari submitted data) --
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      // # 13.b. Cek duplikat dalam database di mongoDB: namaModelKita.findOne({apaYgMauDiCari: value})
      const duplicate = await Contact.findOne({ nama: value });
      if (duplicate) {
        throw new Error(`Nama ${value} sudah terdaftar!`);
      }
      return true;
    }),
    // # 13.c. gunakan check() => untuk cek apakah format value dari form inputan sesuai/tidak
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomor tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    // # 13.d. result dari validationResult(req) -> berbentuk property yang ada key-value pair (kalo ERROR: ADA isi seperti msg error-nya, kalo TIDAK error: isinya KOSONG/undefined)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Add contact form",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      // # 13.e. gunakan namaModelKita.insertMany(req.body)
      Contact.insertMany(req.body, (error, result) => {
        // # 13.f. kalo berhasil, kirimkan flash message
        req.flash("msg", "New contact has beend added!");
        res.redirect("/contact");
      });
    }
  }
);

// # 5.f.1 Proses Delete 1 contact ( menggunakan app.delete() ). harus install module method-override [lihat poin 14.]
app.delete("/contact", async (req, res) => {
  // # 14.b. Buat form untuk button delete ( tambahkan di detail.ejs ). [lihat poin 14.b. di detail.ejs]
  // # 14.e. Cari 1 contact berdasarkan value di form delete (tepatnya hidden input): value="<%= contact.nama %>"
  const contact = await Contact.findOne({ nama: req.body.nama });

  // # 14.f. Delete 1 contact berdasarkan ID. karena contact sudah berbentuk object
  Contact.deleteOne({ _id: contact._id }).then((result) => {
    req.flash("msg", "Contact has been deleted!");
    res.redirect("/contact");
  });
});

// # 5.g. Halaman form edit data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "Form edit contact",
    layout: "layouts/main-layout",
    contact,
  });
});

// 15. Proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      // # 15.d. Cek duplikasi
      const duplicate = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplicate) {
        throw new Error(`Name ${value} already exists.`);
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomor tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Edit contact form",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      // # 15.e. Ubah data di database
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Contact has been edited!");
        res.redirect("/contact");
      });
    }
  }
);

// # 5.d. Halaman Detail Contact
app.get("/contact/:nama", async (req, res) => {
  // 12. Gunakan findOne, dengan terlebih dahulu panggil model-nya, 'Contact'
  const contact = await Contact.findOne({ nama: req.params.nama });

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
