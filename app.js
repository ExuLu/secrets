//jshint esversion:6
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const saltRounds = 12;

const app = express();
const uri = process.env.MONGODB_SECRET_URI;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(`${uri}/userDB`, {
    serverSelectionTimeoutMS: 5000,
  });
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model('User', userSchema);

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.get('/logout', function (req, res) {
  res.redirect('/');
});

app.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const foundUser = await User.findOne({
    email: username,
  });
  if (foundUser) {
    await bcrypt.compare(password, foundUser.password, function (err, result) {
      if (result) {
        console.log(`You've successfully loged in`);
        res.render('secrets');
      } else {
        console.log(`Wrong password!`);
        res.redirect('/login');
      }
    });
  } else {
    console.log('You need to register your user first!');
    res.redirect('/login');
  }
});

app.post('/register', async function (req, res) {
  const username = req.body.username;
  await bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    const foundUser = await User.findOne({
      email: username,
    });

    if (!foundUser) {
      if (!username || !req.body.password) {
        console.log(`You don't have username or password`);
        res.redirect('/register');
      } else {
        const user = new User({
          email: username,
          password: hash,
        });
        await user.save();
        console.log(`You've successfully registered`);
        res.render('secrets');
      }
    } else {
      console.log(`You've already registered`);
      res.redirect('/');
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
