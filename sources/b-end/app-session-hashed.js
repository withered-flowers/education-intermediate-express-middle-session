const express = require('express');
const app = express();
const session = require('express-session');
// Import bcrypt
const bcrypt = require('bcryptjs');

// Import EncryptedUser
const { PlainUser, EncryptedUser } = require('./models/index.js');

const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Inisialisasi bcrypt
// Membutuhkan ronde salt-ing
// intinya, akan diacak beberapa kali, biar lebih susah
// ditebak
const saltRounds = 12;

app.use(session({
  secret: "supercalifragilisticexpialidocious",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000
  }
}));

app.get('/', (req, res) => {
  // Halaman `views/home-session
  //   menerima satu variabel `username`
  //   untuk menampilkan nama user

  if (req.session.isLoggedIn === true) {
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

  // Kalau sebelumnyua kita mengambil berdasarkan
  // uname dan upass, karena ini plaintext
  // Maka ketika menggunakan hash bcrypt ini
  // Kita akan melakukan SELECT untuk mengambil hashnya
  // dan meng-compare hashnya dengan yang dibuat oleh user ini.

  EncryptedUser.findOne({
    where: {
      uname: req.body.user_name,
      // Where upassnya tidak digunakan
      // upass: req.body.user_pass
    }
  })
    .then(data => {
      if (data === null) {
        res.redirect('/login?err=true');
      }
      else {
        // lakukan cek untuk membandingkan hash dengan inputan
        // promise based kok !

        bcrypt.compare(req.body.user_pass, data.upass)
          .then(result => {
            // Baca dari dokumentasi, hasil nya adalah result true or false
            if (result === true) {
              req.session.isLoggedIn = true;
              req.session.username = data.uname;

              res.redirect('/');
            }
            else {
              res.redirect('/login?err=true');
            }
          });
      }
    })
    .catch(err => {
      res.send(err);
    });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.send(err);
    }
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Aplikasi berjalan pada port ${PORT}`);
});