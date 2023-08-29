// Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const usuarios = require("./routes/usuario");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const passport = require("passport");
require("./config/auth")(passport);

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
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")[0];
  res.locals.error_msg = req.flash("error_msg")[0];
  res.locals.error = req.flash("error");
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

// Importações e configurações do servidor
app.get("/", (req, res) => {
  // Encontra todas as postagens no banco de dados
  Postagem.find()
    .lean()
    .populate("categoria") // Popula os detalhes da categoria associada a cada postagem
    .sort({ data: "desc" }) // Ordena as postagens pela data em ordem decrescente
    .then((postagens) => {
      // Renderiza o modelo "index" e passa as postagens como variável
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      // Em caso de erro, define uma mensagem de erro e redireciona para a página de erro 404
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

// Rota para a página de erro 404
app.get("/404", (req, res) => {
  res.send("Erro 404 / Not Found");
});

// Rota para visualizar uma postagem específica
app.get("/postagem/:id", (req, res) => {
  const { id } = req.params;

  // Encontra a postagem pelo ID
  Postagem.findOne({ _id: id })
    .lean()
    .then((postagem) => {
      if (postagem) {
        // Se a postagem existe, renderiza o modelo "postagem/index" com os detalhes da postagem
        res.render("postagem/index", { postagem: postagem });
      } else {
        // Caso a postagem não exista, define uma mensagem de erro e redireciona para a página inicial
        req.flash("error_msg", "Esta postagem não existe!");
        res.redirect("/");
      }
    })
    .catch((err) => {
      // Em caso de erro, define uma mensagem de erro e redireciona para a página inicial
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

// Rota para listar todas as categorias
app.get("/categorias", (req, res) => {
  // Encontra todas as categorias no banco de dados
  Categoria.find()
    .lean()
    .then((categorias) => {
      // Renderiza o modelo "categorias/index" e passa as categorias como variável
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      // Em caso de erro, define uma mensagem de erro e redireciona para a página inicial
      req.flash("error_msg", "Houve um erro interno ao listar as categorias!");
      res.redirect("/");
    });
});

// Rota para visualizar postagens de uma categoria específica
app.get("/categorias/:slug", (req, res) => {
  const { slug } = req.params;

  // Encontra a categoria pelo slug
  Categoria.findOne({ slug: slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        // Se a categoria existe, encontra as postagens associadas a ela e renderiza o modelo "categorias/postagens"
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            // Em caso de erro, define uma mensagem de erro e redireciona para a página inicial
            req.flash("error_msg", "Houve um erro ao listar os posts!");
            res.redirect("/");
          });
      } else {
        // Caso a categoria não exista, define uma mensagem de erro e redireciona para a página inicial
        req.flash("error_msg", "Esta categoria não existe!");
        res.redirect("/");
      }
    })
    .catch((err) => {
      // Em caso de erro, define uma mensagem de erro e redireciona para a página inicial
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página desta categoria"
      );
      res.redirect("/");
    });
});

app.use("/admin", admin); // Definindo um prefixo para o grupo de rotas do arquivo admin.js
app.use("/usuarios", usuarios); // Definindo um prefixo para o grupo de rotas do arquivo admin.js

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("SERVIDOR RODANDO!");
});
