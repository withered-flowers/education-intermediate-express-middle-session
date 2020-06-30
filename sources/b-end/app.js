const express = require('express');
const app = express();


const { PlainUser } = require('./models/index.js');

const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  // Halaman `views/home`
  // tidak menerima variabel apapun

  res.render('home');
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

  PlainUser.findOne({
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
        res.redirect('/');
      }
    })
    .catch(err => {
      res.send(err);
    });
});

app.get('/logout', (req, res) => {
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Aplikasi berjalan pada port ${PORT}`);
});