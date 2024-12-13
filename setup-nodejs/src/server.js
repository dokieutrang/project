const express = require('express');
const connectDB = require('./config/mongoDb');
const { default: configCors } = require('./config/cors');
import initApiRouter from "./routes/api";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
require('dotenv').config();

const app = express();

//config cors
configCors(app);

//config body-parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Kết nối MongoDB
connectDB();

//config cookie-parser
app.use(cookieParser());

//init web router
initApiRouter(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
