const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const envKey = require('./config/environmentKeys');

// ----------------- MIDDLEWARE -----------------
app.use(cors({
  origin: true,
  credentials: true // Allow session cookies to be sent from client
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.body);
  console.log(req.url, req.method, req.headers['authorization']);
  next();
});

// ----------------- SESSION SETUP -----------------
app.use(session({
  secret: envKey.PASSWORD_SECRET_KEY || 'default_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: envKey.MONGODB_ATLAS_URL,
    dbName: envKey.DATABASE_NAME || 'Cluster0',
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false, // set to true if using HTTPS
    httpOnly: true
  }
}));


// ----------------- DATABASE CONNECTION -----------------
async function connectDB() {
  try {
    await mongoose.connect(envKey.MONGODB_ATLAS_URL);
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
  }
}
connectDB();



// ----------------- TEST ROUTES -----------------
app.get("/", (req, res) => res.send('yo'));

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "OK", time: new Date().toISOString() });
});

app.get("/session-test", (req, res) => {
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  res.json({ views: req.session.views });
});



// ----------------- ACTUAL ROUTES -----------------
app.use('/', require("./routes/loginRoute"));
app.use('/api', require("./routes/scoreRoute"));
app.use('/data', require("./routes/dataRetrievalRoute"));
app.use('/hereapi', require("./routes/apiRoute"));
app.use('/admin', require("./routes/adminRoute"));


// ----------------- START SERVER -----------------
app.listen(envKey.PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${envKey.PORT}`);
});