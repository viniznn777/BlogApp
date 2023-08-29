// Importação do módulo de estratégia de autenticação local do Passport
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Importação do modelo de usuário
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

// Exporta uma função que configura as estratégias de autenticação do Passport
module.exports = function (passport) {
  // Configuração da estratégia de autenticação local do Passport
  passport.use(
    new localStrategy(
      // Configuração dos campos de autenticação (email e senha)
      { usernameField: "email", passwordField: "senha" },
      // Função de callback para autenticação
      (email, senha, done) => {
        // Procura um usuário com o email fornecido no banco de dados
        Usuario.findOne({ email: email }).then((usuario) => {
          if (!usuario) {
            // Se não encontrar um usuário com o email fornecido,
            // indica falha na autenticação e retorna uma mensagem de erro
            return done(null, false, { message: "Esta conta não existe!" });
          }

          // Compara a senha fornecida com a senha armazenada no banco de dados
          bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if (batem) {
              // Se as senhas coincidirem, indica sucesso na autenticação
              // e retorna o objeto do usuário autenticado
              return done(null, usuario);
            } else {
              // Se as senhas não coincidirem, indica falha na autenticação
              // e retorna uma mensagem de erro
              return done(null, false, { message: "Senha incorreta!" });
            }
          });
        });
      }
    )
  );

  // Serializa o usuário para armazená-lo na sessão
  passport.serializeUser((usuario, done) => {
    // A serialização armazena o ID do usuário na sessão do navegador
    // para que o Passport possa recuperar o usuário em solicitações subsequentes
    done(null, usuario.id);
  });

  // Deserializa o usuário recuperando-o da sessão
  passport.deserializeUser((id, done) => {
    // A deserialização usa o ID do usuário armazenado na sessão
    // para encontrar e recuperar o objeto do usuário do banco de dados
    Usuario.findById(id)
      .then((usuario) => {
        // Se o usuário for encontrado, retorna o objeto de usuário
        done(null, usuario);
      })
      .catch((err) => {
        // Em caso de erro, indica falha na deserialização e retorna uma mensagem de erro
        done(null, false, { message: "Algo deu errado ao buscar o usuário!" });
      });
  });
};
