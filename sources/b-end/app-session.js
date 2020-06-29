const express = require('express');
const app = express();
// Tambahkan ini untuk menggunakan session
const session = require('express-session');

const { User } = require('./models/index.js');

const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Inisialisasi session
app.use(session({
  // Secret adalah kunci untuk menggunakan session, REQUIRED
  // anggap saja seperti password nya session
  secret: "supercalifragilisticexpialidocious",
  // Baca dokumentasi untuk mengetahui lebih lanjut
  resave: false,
  // Baca dokumentasi untuk mengetahui lebih lanjut
  saveUninitialized: false,
  // Ingat bahwa bila menggunakan session, akan ada
  // data yang disimpan di komputer kita juga
  // dan ini ada "umur"nya.
  cookie: {
    maxAge: 60000
  }
}));

app.get('/', (req, res) => {
  // Halaman `views/home`
  // tidak menerima variabel apapun

  // sekarang kita akan melakukan pengecekan
  // apabila pada session belum ada suatu 
  // variable yang namanya "isLoggedIn"
  // maka akan kita paksa untuk login.

  // Misalnya sekarang kita akan menggunakan `views/home-session`
  // Halaman `views/home-session
  //   menerima satu variabel `username`
  //   untuk menampilkan nama user

  // if(req.session.isLoggedIn === true) {
  //   res.render('home');
  // }
  if(req.session.isLoggedIn === true) {
    res.render('home-session', {
      username: req.session.username
    });
  }
  else {
    res.redirect('/login');
  }
  
});

app.get('/login', (req, res) => {
  // Halaman `views/login`
  // Menerima 1 req.query bernama err
  //    err:Boolean yang menyatakan adanya kesalahan credential
  // Menerima 1 variabel render dengan nama errorLogin
  //    errorLogin:Boolean yang menyatakan adanya kesalahan credential

  if (req.query.err) {
    res.render('login', {
      errorLogin: true
    });
  }
  else {
    res.render('login', {
      errorLogin: false
    });
  }
});

app.post('/login', (req, res) => {
  // Halaman `views/login`
  // memiliki 2 lemparan parameter:
  //   form > input > id = user_name, name = user_name
  //   form > input > id = user_pass, name = user_pass

  User.findOne({
    where: {
      uname: req.body.user_name,
      upass: req.body.user_pass
    }
  })
    .then(data => {
      if (data === null) {
        res.redirect('/login?err=true');
      }
      else {
        // Ceritanya pada saat telah melakukan log in
        // Maka kita akan meng-set isLoggedIn nya sebagai true
        // dan menaruh username nya untuk kita gunakan lebih lanjut

        req.session.isLoggedIn = true;
        req.session.username = data.uname;

        res.redirect('/');
      }
    })
    .catch(err => {
      res.send(err);
    });
});

app.get('/logout', (req, res) => {
  // Jangan lupa ketika kita ingin melakukan logout 
  // adalah saatnya kita membersihkan session.
  // Ingat, session yang tidak dibersihkan akan
  // menambah beban di server !

  req.session.destroy(err => {
    if(err) {
      res.send(err);
    }
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Aplikasi berjalan pada port ${PORT}`);
});