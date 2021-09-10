const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const fs = require('fs');
const wbm = require('./wa-service');
const util = require('util');
const server = require('http').createServer(app);
const { async } = require("rxjs");

const io = require('socket.io')(server, {
  transports: ['websocket', 'polling']
})

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "laundry",
});

fs.createWriteStream(__dirname + '/file/qrcode.txt', { flags: 'w' });
var log_file = fs.createWriteStream(__dirname + '/file/log.txt', { flags: 'w' });
var log_stdout = process.stdout;

console.log = function (d) { //
  log_file.write(getDateTime() + ' >> ' + util.format(d) + '\n');
  log_stdout.write(getDateTime() + ' >> ' + util.format(d) + '\n');
}

const sendReport = (nama, handphone, blastType, tgl_masuk) => {
  var pesan = '';
  var pesanSingle = fs.readFileSync('./file/pesanSingle.txt', 'utf8');
  var pesanBroadcast = fs.readFileSync('./file/pesanBroadcast.txt', 'utf8');
  var nomor = handphone;

  if (blastType === '0') {
    wbm.start().then(async () => {
      for (let i = 0; i < nomor.length; i++) {
        pesan = pesanSingle.replace("(?)", nama[i])
        nomor = handphone[i];
        await wbm.send([nomor], pesan, tgl_masuk, blastType);
      }
      await wbm.end().then(result => {
        console.log(getTime() + ' ' + result)
      });
    }).catch(err => console.log(err));
  } else {
    wbm.start().then(async () => {
      pesan = pesanBroadcast
      await wbm.send(nomor, pesan, tgl_masuk, blastType);
      await wbm.end().then(result => {
        console.log(getTime() + ' ' + result)
      });
    }).catch(err => console.log(err));
  }
}

const getDate = (date) => {
  let d = new Date(date);
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return ye + '-' + mo + '-' + da;
}

const getDateTime = () => {
  let d = new Date();
  let hh = new Intl.DateTimeFormat('en', { hour: '2-digit' }).format(d);
  let mm = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d);
  let ss = new Intl.DateTimeFormat('en', { second: '2-digit' }).format(d);
  return getTglMasuk() + ' ' + hh + ':' + mm + ':' + ss;
}

const getTime = () => {
  let d = new Date();
  let hh = new Intl.DateTimeFormat('en', { hour: '2-digit' }).format(d);
  let mm = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d);
  return hh + ':' + mm;
}

const getTglMasuk = () => {
  let d = new Date();
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return `${ye}-${mo}-${da}`;
};

const getTglSelesai = (addDate) => {
  let d = new Date();
  d.setDate(d.getDate() + addDate);
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return `${ye}-${mo}-${da}`;
};

const getHargaTotal = (hargaPerKg, berat, diskon) => {
  if (diskon !== 0) { return ((hargaPerKg * berat) - ((diskon / 100) * (hargaPerKg * berat))) }
  else { return (hargaPerKg * berat) }
}

app.post("/addtransaction", (req, res) => {
  let nama = req.body.nama;
  let handphone = req.body.handphone;
  let jenis = req.body.jenis;
  let berat = req.body.berat;
  let paket = req.body.paket;
  let lama_cuci = req.body.lama_cuci;
  let hargaPerKg = req.body.harga;
  let diskon = req.body.diskon;
  let hargaTotal = getHargaTotal(hargaPerKg, berat, diskon);
  let keterangan = req.body.keterangan;
  let status = 'Proses';
  let tgl_masuk = getTglMasuk();
  let tgl_selesai = getTglSelesai(lama_cuci);
  let jumlah_pakaian = req.body.jumlahPakaian;
  let jenis_satuan = req.body.jenisSatuan;

  if (jenis === 'satuan') {
    hargaTotal = getHargaTotal(hargaPerKg, jumlah_pakaian, diskon);
    berat = '';
    paket = jenis_satuan;
  } else if (jenis === 'kiloan') {
    jenis_satuan = '';
  }

  db.query(
    "INSERT INTO customer (nama, handphone) VALUES (?,?)",
    [nama, handphone],
    async (err, result) => {
      if (err) {
        console.log(err);
      } else {
        await db.query(
          "INSERT into transaction(customer_id, berat, paket, harga, jenis, tgl_masuk, tgl_selesai, status, keterangan, report, jumlah_pakaian, jenis_satuan)" +
          "VALUES((SELECT id FROM customer ORDER BY id DESC LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [berat, paket, hargaTotal, jenis, tgl_masuk, tgl_selesai, status, keterangan, 0, jumlah_pakaian, jenis_satuan]
        );
        res.send("Values Inserted");
      }
    }
  );
});

app.post("/addPaket", (req, res) => {
  const nama_paket = req.body.namaPaket;
  const lama_cuci = req.body.lamaCuci;
  const harga = req.body.harga;
  const diskon = req.body.diskon;

  db.query(
    "INSERT INTO paket (nama_paket, lama_cuci, harga, diskon) VALUES (?,?,?,?)",
    [nama_paket, lama_cuci, harga, diskon],
    async (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Values Inserted");
      }
    }
  );
});

app.get("/transactions", (req, res) => {
  db.query("select customer.nama, customer.handphone, transaction.* from customer INNER JOIN transaction on transaction.customer_id = customer.id", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/gettransactionById/:id", (req, res) => {
  const id = req.params.id;
  db.query("select customer.nama, customer.handphone, transaction.* from customer INNER JOIN transaction on transaction.customer_id = customer.id where transaction.id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/paket", (req, res) => {
  db.query("select * from paket", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/updatePaket", (req, res) => {
  const id = req.body.id;
  const namaPaket = req.body.namaPaket;
  const lamaCuci = req.body.lamaCuci;
  const harga = req.body.harga;

  db.query(
    "UPDATE paket SET nama_paket = ?, lama_cuci = ?, harga = ? where id = ?",
    [namaPaket, lamaCuci, harga, id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/deletePaket/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "delete from paket where id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.put("/update", async (req, res) => {
  const nama = req.body.nama;
  const handphone = req.body.handphone;
  const tgl_masuk = req.body.tgl_masuk;

  db.query(
    "UPDATE transaction INNER JOIN customer ON transaction.customer_id = customer.id " +
    "SET transaction.status = 'Selesai' " +
    "WHERE customer.handphone = ? and transaction.tgl_masuk = ?",
    [handphone, getDate(tgl_masuk)],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
  // await sendReport(nama, handphone, '0', getDate(tgl_masuk));
});


app.get("/getMessage", (req, res) => {
  var listMessage = []
  var pesanSingle = fs.readFileSync('./file/pesanSingle.txt', 'utf8');
  var pesanBroadcast = fs.readFileSync('./file/pesanBroadcast.txt', 'utf8');
  listMessage.push(pesanSingle)
  listMessage.push(pesanBroadcast)
  res.send(JSON.stringify(listMessage));
});

app.put("/updateMessage", (req, res) => {
  var tipe = req.body.tipe;
  var message = req.body.message;
  if (tipe === 'Single') {
    fs.writeFileSync('./file/pesanSingle.txt', message);
  } else {
    fs.writeFileSync('./file/pesanBroadcast.txt', message);
  }
  res.send('Message is updated!!');
});

app.put("/sendBroadcast", (req, res) => {
  db.query("UPDATE transaction INNER JOIN customer ON transaction.customer_id = customer.id " +
    "SET transaction.isBroadcast = '0' ");
  const listPhone = req.body.handphone;
  sendReport(' ', listPhone, '1', ' ');
  res.send('Broadcast Terkirim')
});


app.put("/sendReport", async (req, res) => {
  const nama = req.body.nama;
  const handphone = req.body.handphone;
  const date = new Date();
  sendReport(nama, handphone, '0', getDate(date));
  res.send('Report Terkirim');
});


app.get("/getCustomers", (req, res) => {
  db.query("select nama, handphone FROM customer", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/readLogFile", async (req, res) => {
  var log = fs.readFileSync('./file/log.txt', 'utf8');
  var qrcode = fs.readFileSync('./file/qrcode.txt', 'utf8');
  await res.send({ log: log, qrcode: qrcode });
});

app.get("/dataReport", async (req, res) => {
  let date = new Date();
  db.query("SELECT customer.id, customer.nama, customer.handphone, transaction.report FROM customer INNER JOIN transaction ON transaction.customer_id = customer.id " +
    "WHERE transaction.status = 'Selesai' AND transaction.tgl_masuk = '" + getDate(date) + "'", (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.get("/dataBroadcast", async (req, res) => {
  let date = new Date();
  db.query("SELECT customer.id, customer.handphone, transaction.report, transaction.isBroadcast FROM customer INNER JOIN transaction ON transaction.customer_id = customer.id", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});


// io.on('connection', (client) => {
//   setInterval(() => {
//     var log = fs.readFileSync('./file/log.txt', 'utf8');
//     var qrcode = fs.readFileSync('./file/qrcode.txt', 'utf8');
//     client.emit('log', {
//       log: log, qrcode: qrcode
//     })
//   }, 1000);
// });

server.listen(3001, () => {
  process.stdout.write("Yey, your server is running on port 3001");
});



