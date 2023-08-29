const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/registro", (req, res) => {
  res.render("usuarios/registro");
});
router.post("/registro", (req, res) => {
  const { nome, email, senha, senha2 } = req.body;

  var erros = [];

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
    erros.push({ text: "As senha são diferentes, tente novamente!" });
  }

  if (erros.length > 0) {
    res.render("usuarios/registro", { erros: erros });
  } else {
    Usuario.findOne({ email: email })
      .lean()
      .then((usuario) => {
        if (usuario) {
          req.flash(
            "error_msg",
            "Desculpe, o email fornecido já está em uso. Por favor, tente usar um email diferente."
          );
          res.redirect("registro");
        } else {
          const novoUsuario = new Usuario({
            nome,
            email,
            senha,
          });
          // Criptografar ou Hashear a senha do usuário antes de enviar ao Banco de Dados
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

router.get("/login", (req, res) => {
  res.render("usuarios/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true,
  })(req, res, next);
});

module.exports = router;
