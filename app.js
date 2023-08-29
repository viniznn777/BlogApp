// Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");

// Configurações
//Sessão
app.use(
  session({
    // "secret": Uma chave secreta usada para assinar os cookies de sessão. Essa chave é usada para evitar que os cookies sejam falsificados.
    secret: "cursodenode",
    // "resave": Indica se as sessões devem ser salvas novamente no armazenamento, mesmo que não tenham sido modificadas.
    resave: true,
    // "saveUninitialized": Indica se as sessões devem ser salvas mesmo que não tenham sido inicializadas. true significa que sessões vazias também serão salvas.
    saveUninitialized: true,
  })
);
app.use(flash());
// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")[0];
  res.locals.error_msg = req.flash("error_msg")[0];
  next();
});
//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// HandleBars
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado ao MongoDB");
  })
  .catch((err) => {
    console.log("Erro ao se conectar: " + err);
  });

// Public
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use("/admin", admin); // Definindo um prefixo para o grupo de rotas do arquivo admin.js

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("SERVIDOR RODANDO!");
});
