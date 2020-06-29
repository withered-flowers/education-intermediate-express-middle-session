const express = require('express');
const app = express();

const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  // Halaman `views/home`
  // tidak menerima variabel apapun
});

app.get('/login', (req, res) => {
  // Halaman `views/login`
  // Menerima 1 req.query bernama err
  //    err:Boolean yang menyatakan adanya kesalahan credential
  // Menerima 1 variabel render dengan nama errorLogin
  //    errorLogin:Boolean yang menyatakan adanya kesalahan credential
});

app.post('/login', (req, res) => {
  // Halaman `views/login`
  // memiliki 2 lemparan parameter:
  //   form > input > id = user_name, name = user_name
  //   form > input > id = user_pass, name = user_pass
});

app.get('/logout', (req, res) => {
  
});

app.listen(PORT, () => {
  console.log(`Aplikasi berjalan pada port ${PORT}`);
});