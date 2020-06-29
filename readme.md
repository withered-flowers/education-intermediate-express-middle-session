## Table of Content
1. [Recap Express with Sequelize](#recap-express-with-sequelize)
1. [Express Middleware](#express-middleware)
  * [Session](#session)
1. [Toughening the Security](#toughening-the-security)
  * [BCrypt](#bcrypt)
1. [Referensi](#referensi)

## Recap Express with Sequelize
Dengan asumsi bahwa kita sudah mengerti apa itu `express`, maka sekarang kita
hanya akan mengulang kembali bagaimana cara membuat projek berbasis express.

Sekarang kita akan membuat sebuah aplikasi yang memiliki 2 buah halaman,
misalnya halaman login dan halaman utama.

**DISCLAIMER:**  
Pada pembelajaran ini kita tidak menggunakan `MVC` maupun `express.Router`
untuk memperkecil *scope* pembelajaran kali ini yah !

Diketahui kita memiliki 2 buah tabel bernama `Users` dan `Reals` pada database 
sebagai berikut (keduanya memiliki kolom tabel yang sama):

| Kolom | Tipe         | Info                       |
|:------|:-------------|:---------------------------|
| id    | INTEGER      | PRIMARY KEY AUTO INCREMENT |
| uname | VARCHAR(255) | NOT NULL                   |
| upass | VARCHAR(255) | NOT NULL                   | 

Diketahui pula pada saat pembuatan ini, sudah diberikan data dummy pada
folder `data` sebagai populasi awal pada tabel `Users` dan `Reals`.

Dan pada saat kita membuat aplikasi, sudah disediakan `views`-nya oleh
`UI/UX Designer` kita, dan diketahui endpoint aplikasi kita adalah sebagai
berikut:

| Endpoint    | Deksripsi                                                     |
|:------------|---------------------------------------------------------------|
| GET /       | Tampilkan halaman `home`, bila belum login, tampilkan `login` |
| GET /login  | Tampilkan halaman `login`, bila sudah login, tampilkan `home` |
| POST /login | Handle form `login`                                           |
| GET /logout | Lakukan logout dan pindah ke halaman `login` lagi             |

Sekarang kita akan mencoba untuk membuatnya dari awal yah !  
Cara untuk membuat projek berbasis Express dan sequelize ini adalah dengan:
1. Menjalankan `git init`
1. Menjalankan `npm init (-y)`
1. Meng-*install* module yang dibutuhkan dengan 
   `npm install express ejs pg sequelize` 
1. Meng-*install* module untuk development dengan 
   `npm install -D nodemon sequelize-cli`
1. Meng-*exlucde* `node_modules` via `.gitignore`
1. Menginisialisasi `sequelize` dengan `npx seqeuelize-cli init`
1. Melakukan konfig database dengan meng-*edit* `config/config.json`
1. Membuat database dengan `npx sequelize-cli db:create`
1. Membuat tabel dan model `Users` dengan 
   `npx sequelize-cli model:generate --name User \` 
   `--attributes uname:String,upass:String`
1. Membuat tabel dan model `Reals` dengan 
   `npx sequelize-cli model:generate --name Real \` 
   `--attributes uname:String,upass:String`
1. Jangan lupa untuk tidak menggunakan `async` dan `await` terlebih dahulu 
   pada file yang terbentuk di folder `migrations` supaya dapat mengerti 
   `Promise` lebih lanjut
1. Jalankan pembuatan tabel dengan `npx sequelize-cli db:migrate`
1. Membuat file seed untuk `populate` data awal dengan 
   `npx sequelize-cli seed:generate --name initial-populate-user` dan
   `npx sequelize-cli seed:generate --name initial-populate-real`
1. Membaca file `data/user.json` dan melakukan `populate` tabel `Users`.
   Kode dapat dilihat di [Code 01](#code-01)
1. Membaca file `data/real.json` dan melakukan `populate` tabel `Reals`.
   Kode dapat dilihat di [Code 02](#code-02)
1. Jalankan `populate` data dengan `npx sequelize-cli db:seed:all`
1. Membuat file `main` dari aplikasi (umumnya bernama `app.js` pada Express),
   Untuk sekarang kita akan mengabaikan `bila sudah login` atau 
   `bila belum login`nya terlebih dahulu dan masih menggunakan tabel `Users`
   saja. kode untuk `app.js` ini dapat dilihat pada [Code 03](#code-03)

### Code 01
```javascript
'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let data = JSON.parse(fs.readFileSync('./data/user.json', 'utf8'));

    data = data.map(elem => {
      elem.createdAt = new Date();
      elem.updatedAt = new Date();
      
      return elem;
    });

    return queryInterface.bulkInsert('Users', data, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
```

### Code 02
```javascript
'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let data = JSON.parse(fs.readFileSync('./data/real.json', 'utf8'));

    data = data.map(elem => {
      elem.createdAt = new Date();
      elem.updatedAt = new Date();
      
      return elem;
    });

    return queryInterface.bulkInsert('Reals', data, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Reals', null, {});
  }
};
```

### Code 03
```javascript
const express = require('express');
const app = express();


const { User } = require('./models/index.js');

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
```

Tapi setelah menyelesaikan ini, kita akan menemukan suatu permasalahan yang 
baru, yaitu, ketika kita selesai melakukan login, maka halaman `login` ini
masih akan tetap *nongol*, dan tanpa melakukan login pun, kita tetap masih 
bisa langsung berpindah ke halaman `home`. Tentunya apabila kita membuat
aplikasi, kita tidak ingin hal tersebut terjadi bukan?

Lalu bagaimanakah cara kita menyelesaikannya?

Sebelum kita mencoba menyelesaikannya, ada lebih baiknya apabila kita melihat
apa itu `middleware` terlebih dahulu pada `Express`.

## Express Middleware
*Middleware*, Middle = tengah, ware = sesuatu. Apabila diterjemahkan dalam
istilah *programming*, adalah sesuatu yang kita *selipkan* di tengah aplikasi
kita.

Dalam Express ini sendiri, bila diterjemahkan lebih lanjut, artinya adalah
suatu fungsi yang diselipkan di tengah-tengah siklus *request* pada server
Express kita.

Setiap middleware yang dibuat dalam express ini, bisa menangkap dan memodifikasi
`request` dan `response` untuk setiap rute yang di-*templok*-kan.

Contoh:
```javascript
// Selipkan di tengah aplikasi yang kita buat
app.use((req, res, next) => {
  console.log("Ini dari middleware loh !");
  console.log(req);
  next();
});
```

Contoh di atas ini adalah kita menggunakan middleware secara global, dalam
artian dari manapun rutenya, akan menggunakan middleware ini.

Middleware ini juga bisa diterapkan pada hanya pada rute tertentu saja loh !

Contoh berdasarkan kode yang sudah kita ketik:
```javascript
const fungsiPenyusup = (req, res, next) => {
  console.log("Hai, aku penyusup !");
  next();
}

app.get('/', fungsiPenyusup, (req, res) => {
  res.render('home');
});
```

Nah pertanyaan selanjutnya adalah, apakah hubungannya `middleware` ini dengan
permasalahan kita sebelumnya?

Karena kita akan membutuhkan sebuah middleware yang digunakan untuk menampung
suatu data yang dapat bertahan pada saat berpindah-pindah halaman dalam suatu
web !

Dalam web sendiri dikenal dua istilah untuk hal ini, yaitu `cookies` dan 
`session`.

Pada pembelajaran kali ini kita akan mempelajari tentang `Session`.

## Session
Dalam konteks dunia web ini sendiri, session adalah suatu teknik dimana 
programmer meminta server untuk menyimpan suatu data sementara yang akan
tersedia pada semua halaman / rute yang ada di server pada saat seorang user
menggunakan aplikasi kita.

Hati-hati bahwa session ini memiliki periode waktu *auto-destroy* atau 
`auto hilang` dalam waktu (umumnya) 30 menit.

Pada `express` sendiri hal ini dapat dicapai dengan menggunakan module tambahan
bernama `express-session`.

Cara menggunakan `express-session` pada projek kita:
1. Matikan dulu aplikasi yang sedang dibuat apabila menggunakan `nodemon`
1. Baca dokumentasi session di [sini](https://www.npmjs.com/package/express-session)
1. Install modul `express-session` dengan `npm install express-session`
1. Modifikasi kode `app.js` sehingga menjadi seperti [Code 04](#code-04)

```javascript
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
```

Dan sampai pada detik ini, artinya kita sudah berhasil menggunakan session
dengan baik.

Dan selanjutnya kita akan berpikir lebih lanjut lagi, ketika sudah berhubungan
dengan data, apakah kode yang kita buat sudah agak aman? adakah cara untuk
lebih aman lagi?

## Toughening the Security
Coba kita lihat lagi pada aplikasi yang kita buat barusan ini. Kita lihat dari
sisi database kita, kita menyimpan password kita dalam bentuk *plaintext*, 
dalam bentuk apa adanya loh !

Hal ini adalah sesuatu yang `forbidden` dan kita harus memperbaiki hal tersebut.

Untungnya dalam nodejs ini ada sebuah modul yang dapat menyelematkan kita loh !
modul itu bernama `bcrypt` !

## BCrypt
Bcrypt merupakan sebuah fungsi untuk mempersulit *hekel* dalam menebak konten
dari *plaintext* yang didesain oleh orang *jago* yang bernama Niels Provos dan 
David Mazières.

Disini tidak akan dijelaskan apa itu dan cara kerjanya bagaimana yah, karena
*satu semester* pun tidak cukup menjelaskan hal ini, *wadidaw*.

Kita cukup mengerti bahwa bcrypt ini bersifat `hash` atau satu arah saja.

Pada kode yang sudah kita buat, kita akan:
* Menggunakan tabel `Reals` yang passwordnya sudah di-`hashed` dengan `bcrypt`
* Mencoba login dengan tabel `Reals` tersebut.

Cara menggunakan BCrypt adalah:
1. Matikan dulu aplikasi yang sedang dibuat apabila menggunakan `nodemon`
1. Baca dokumentasi `bcrypt` di [sini](https://www.npmjs.com/package/bcrypt)
1. Install modul `bcrypt` dengan `npm install bcrypt`
1. Implementasikan dalam kode kita, dapat dilihat pada [Code 05](#code-05)

### Code 05
```javascript
const express = require('express');
const app = express();
const session = require('express-session');
// Import bcrypt
const bcrypt = require('bcrypt');

// Import Reals
const { User, Real } = require('./models/index.js');

// Inisialisasi bcrypt
// Membutuhkan ronde salt-ing
// intinya, akan diacak beberapa kali, biar lebih susah
// ditebak
const saltRounds = 12;

...

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

  Real.findOne({
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

...
```

Nah, sampai di sini artinya kita sudah berhasil menuliskan kode kita dengan
menggunakan `session` dan password `hashed` with `bcrypt`.

Keep Learning !

## Referensi
[ExpressJS Middleware, Okta](https://developer.okta.com/blog/2018/09/13/build-and-understand-express-middleware-through-examples)
[ExpressJS - Router Documentation](https://expressjs.com/en/guide/routing.html)