const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongodb = require("./src/database/connect");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;

const app = express();
// const path = require("node:path");
// const process = require("node:process");
// const { authenticate } = require("@google-cloud/local-auth");
// const { google } = require("googleapis");

// // The scope for reading contacts.
// const SCOPES = ["https://www.googleapis.com/auth/contacts.readonly"];
// // The path to the credentials file.
// const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

// /**
//  * Prints the display names of the first 10 connections.
//  */
// async function listConnectionNames() {
//   // Authenticate with Google and get an authorized client.
//   const auth = await authenticate({
//     scopes: SCOPES,
//     keyfilePath: CREDENTIALS_PATH,
//   });

//   // Create a new People API client.
//   const service = google.people({ version: "v1", auth });
//   // Get the list of connections.
//   const result = await service.people.connections.list({
//     resourceName: "people/me",
//     pageSize: 10,
//     personFields: "names,emailAddresses",
//   });
//   const connections = result.data.connections;
//   if (!connections || connections.length === 0) {
//     console.log("No connections found.");
//     return;
//   }
//   console.log("Connections:");
//   // Print the display name of each connection.
//   connections.forEach((person) => {
//     if (person.names && person.names.length > 0) {
//       console.log(person.names[0].displayName);
//     } else {
//       console.log("No display name found for connection.");
//     }
//   });
// }

//
// GOOGLE OAUTH
//

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
app
  .use(bodyParser.json())
  .use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: true,
    }),
  )
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization",
    );
    res.header(
      "Access-Control-Allow-Methods",
      "POST, GET, PUT, DELETE, OPTIONS, DELETE",
    );
    next();
  })
  .use(cors({ methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"] }))
  .use(cors({ origin: "*" }))
  .use(bodyParser.urlencoded({ extended: false }))
  /* ***********************
   * Routes
   *************************/
  .use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use("/", require("./src/routes"));

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      // UserActivation.findOrCreate({githubId: profile.id}, function (err, user){
      return done(null, profile);
      // })
    },
  ),
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send(
    req.session.user !== undefined
      ? `Logged in as ${req.session.user.displayName}`
      : "Logged Out",
  );
});

app.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/api-docs",
    session: false,
  }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/");
  },
);

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
        "Web Server is listening at port " + (process.env.PORT || 3000),
      );
    });
  }
});
