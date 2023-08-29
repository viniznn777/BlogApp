const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Rota para exibir o formulário de registro
router.get("/registro", (req, res) => {
  res.render("usuarios/registro"); // Renderiza a página de registro
});

// Rota para processar o formulário de registro
router.post("/registro", (req, res) => {
  const { nome, email, senha, senha2 } = req.body;

  var erros = [];

  // Validação dos campos do formulário
  if (!nome || typeof nome == undefined || nome == null) {
    erros.push({ text: "Nome inválido!" });
  }
  if (!email || typeof email == undefined || email == null) {
    erros.push({ text: "Email inválido!" });
  }
  if (!senha || typeof senha == undefined || senha == null) {
    erros.push({ text: "Senha inválida!" });
  }
  if (senha.length < 4) {
    erros.push({ text: "Senha muito curta!" });
  }
  if (senha != senha2) {
    erros.push({ text: "As senhas são diferentes, tente novamente!" });
  }

  // Verifica se há erros de validação
  if (erros.length > 0) {
    res.render("usuarios/registro", { erros: erros }); // Renderiza a página de registro com mensagens de erro
  } else {
    // Procura por um usuário com o mesmo email no banco de dados
    Usuario.findOne({ email: email })
      .lean()
      .then((usuario) => {
        if (usuario) {
          // Se o email já estiver em uso, exibe mensagem de erro e redireciona para a página de registro
          req.flash(
            "error_msg",
            "Desculpe, o email fornecido já está em uso. Por favor, tente usar um email diferente."
          );
          res.redirect("registro");
        } else {
          // Cria um novo usuário e criptografa a senha antes de salvar no banco de dados
          const novoUsuario = new Usuario({
            nome,
            email,
            senha,
            eAdmin:
              ".- -.-.-- ..- - .--.-. .... . -. - .. -.-. .- - . -.. / ..- -.--. ... . -.--.- .-. / -.-.-- .-- .. .--.-. - .... / .- -.. -- .. -. .. ... - .-. .- -.--. - --- -.--.- .-. / -.-.-- .--. . .--.-. .-. -- .. ... ... .. --- -. ...",
          });
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash(
                  "error_msg",
                  "Houve um erro durante o salvamento do usuário"
                );
                res.redirect("/");
              }

              novoUsuario.senha = hash;

              novoUsuario
                .save()
                .then(() => {
                  req.flash("success_msg", "Usuário criado com sucesso!");
                  res.redirect("/");
                })
                .catch((err) => {
                  console.log(err);
                  req.flash(
                    "error_msg",
                    "Houve um erro ao criar o usuário, tente novamente!"
                  );
                  res.redirect("/usuarios/registro");
                });
            });
          });
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
      });
  }
});

// Rota para exibir o formulário de login
router.get("/login", (req, res) => {
  res.render("usuarios/login"); // Renderiza a página de login
});

// Rota para processar o formulário de login usando Passport
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/", // Redireciona para a página inicial em caso de sucesso
    failureRedirect: "/usuarios/login", // Redireciona para a página de login em caso de falha
    failureFlash: true, // Ativa o uso de mensagens flash em caso de falha
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    req.flash("success_msg", "Sucesso ao sair!");
    res.redirect("/");
  });
});

module.exports = router;
