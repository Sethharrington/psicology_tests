const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongodb = require("./src/database/connect");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const port = process.env.PORT || 8080;

// Error Hangling
const {
  logError,
  returnError,
  isOperationalError,
} = require("./src/error-handling/errorHandler");

/* ***********************
 * Middleware
 * ************************/
// Express Messages Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const corsOptions = { origin: "*" };
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ***********************
 * Routes
 *************************/
app.use("/", require("./src/routes"));

/* ***********************
 * Error Handling
 *************************/
app.use(logError);
app.use(returnError);

process.on("uncaughtException", (error, origin) => {
  logError(
    (process.stderr.id,
    `Caught exception: ${error}
    Exception origin: ${origin}`),
  );

  if (!isOperationalError(error)) {
    process.exit(1);
  }
});
process.on("unhandledRejection", (error) => {
  logError(error);

  if (!isOperationalError(error)) {
    process.exit(1);
  }
});

/* ***********************
 * Log statement to confirm server operation
 *************************/
mongodb.initDb((err) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    app.listen(port, () => {
      console.log(
        "Web Server is listening at port " + (process.env.PORT || 8080),
      );
    });
  }
});
