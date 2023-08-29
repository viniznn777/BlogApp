// Carregando Módulos
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");

router.get("/", (req, res) => {
  res.render("admin/index");
});

// Rota em que é renderizada as categorias
router.get("/categorias", (req, res) => {
  Categoria.find() // Função para listar todas as categorias registradas no Bando de Dados
    .sort({ date: "desc" }) // Funcão para listar em ordem, (Do mais novo ao mais antigo)
    .lean() // Executado junto com o find() para listar o array de objetos do Banco de Dados
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias }); // Será renderizado cada categoria
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias!"); // Atribuindo um valor a variável Global error_msg, para que seja mostrada caso haja algum erro ao listar as categorias
      res.redirect("/admin"); // será redirecionado para a respectiva rota.
    });
});

// Rota para adicionar uma categoria
router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias"); // Será redirecionado para a respectiva rota de adição de categoria.
});

// Rota que terá a açào de adição
router.post("/categorias/nova", (req, res) => {
  const { nome, slug } = req.body; // Recebendo os parâmetros de "nome" e "slug" do body

  var erros = []; // Lista de erros vazia

  // Validação para o formulário
  if (!nome || typeof nome == undefined || nome == null || nome.length <= 0) {
    erros.push({ text: "Nome inválido" }); // Adicionando uma mensagem de erro a lista de erros
  }
  if (!slug || typeof slug == undefined || slug == null || slug.length <= 0) {
    erros.push({ text: "Slug inválido" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros }); // Passando a mensagem de erro na tela
  } else {
    const novaCategorias = {
      nome,
      slug,
    };
    new Categoria(novaCategorias) // Adicionando o objeto ao model Categoria
      .save() // Adicionando ao Banco de Dados
      .then(() => {
        // Passando um valor para a variável global "success_msg"
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias"); // Redirecionando para a rota onde é possível ver todas as categorias
      })
      .catch((err) => {
        // Passando um valor para a variável global "error_msg"
        req.flash(
          "error_msg",
          "Houve um erro ao salvar a categoria, tente novamente!"
        );
        res.redirect("/admin");
      });
  }
});

// Rota de edição de categoria
router.get("/categorias/edit/:id", (req, res) => {
  const { id } = req.params; // Recebendo o id dos parâmetro que é passado "value" através de um " input hidden " na página de "edit categorias"
  Categoria.findOne({ _id: id }) // findOne para listar apenas um
    .lean() // lean() em conjunto com o findOne
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria }); // Renderizando a categoria
    })
    .catch((err) => {
      // Bloco de erro caso a categoria com o ID não exista
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/admin/categorias");
    });
});
// Rota de ação de edição de categoria em conjunto com a rota acima
router.post("/categorias/edit", (req, res) => {
  // bloco de validação
  // ...
  // =========

  Categoria.findOne({ _id: req.body.id }) // Recebendo o id do input hidden
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;
      // Atualizando a categoria
      categoria
        .save() // Adicionando ao Banco de Dados
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso!"); // Mostrando uma mensagem de sucesso ao editar
          res.redirect("/admin/categorias"); // Redirecionando para a página de categorias, onde é possível ver todas as categorias
        })
        .catch((err) => {
          // Mensagem de erro ao enviar a categoria para o Banco de Dados
          req.flash(
            "error_msg",
            "Houve um erro interno ao salvar a edição da categoria"
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      // Mensagem de erro ao editar a categoria
      req.flash("error_msg", "Houve um erro ao editar a categoria");
      res.redirect("/admin/categorias");
    });
});

// Rota para deletar uma categoria
router.post("/categorias/deletar", (req, res) => {
  Categoria.deleteOne({ _id: req.body.id }) // Usando o deleteOne para deletar somente um com o id recebido através da página de categorias, passado através do "value" de um "input hidden"
    .then(() => {
      // Mensagem de sucesso ao deletar categoria
      req.flash("success_msg", "Categoria deletada com sucesso");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      // Mensagem de erro ao deletar categoria
      req.flash("error_msg", "Houve um erro ao deletar a categoria!");
      res.redirect("/admin/categorias");
    });
});

// Rota para listar todas as postagens criadas
router.get("/postagens", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria") // Procurando a categoria da Postagem, com referência da collection "categorias", setando da seguinte maneira no model de Postagem.
    /*
    categoria: {
    type: Schema.Types.ObjectId,
    ref: "categorias",
    required: true,
  },
    */
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.redirect("/admin");
    });
});

// Rota para criar uma nova postagem
router.get("/postagens/add", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("admin/addpostagens", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});
// Rota de ação no formulário para criar uma nova postagem
router.post("/postagens/nova", (req, res) => {
  const { titulo, descricao, conteudo, categoria, slug } = req.body;

  // bloco de validação
  // ...
  // =========
  var erros = [];
  if (categoria == "0") {
    // Verificando se há alguma categoria para ser colocada na postagem, caso não haja, será mostrada uma mensagem de erro
    erros.push({ text: "Categoria inválida, registre uma categoria" });
  }
  if (erros.length > 0) {
    res.render("admin/addpostagens", { erros: erros }); // Renderizando a lista de erros na página de addpostagens.handlebars
  } else {
    const novaPostagem = {
      titulo,
      descricao,
      conteudo,
      categoria,
      slug,
    };
    new Postagem(novaPostagem) // Criando nova postagem
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso!");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro durante o salvamento da postagem"
        );
        res.redirect("/admin/postagens");
      });
  }
});

// Rota de edição de postagem
router.get("/postagens/edit/:id", (req, res) => {
  const { id } = req.params; // Recebendo um id na URL através da página postagens.handlebars
  Postagem.findOne({ _id: id }) // Buscando a postagem através do id
    .lean()
    .then((postagem) => {
      // Realizando uma segunda busca em Categoria para que tenhamos a categoria da postagem
      Categoria.find()
        .lean()
        .then((categorias) => {
          res.render("admin/editpostagens", {
            // Renderizando "categorias" e "postagem" para que possamos exibir o conteúdo da postagem para ser editada
            categorias: categorias,
            postagem: postagem,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect("/admin/postagens");
        });
    })
    // Bloco catch para caso não exista uma postagem com este ID
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição"
      );
      res.redirect("/admin/postagens");
    });
});
// Rota de ação do formulário para editar a categoria
router.post("/postagem/edit", (req, res) => {
  const { titulo, descricao, conteudo, categoria, slug } = req.body;

  // bloco de validação
  // ...
  // =========

  Postagem.findOne({ _id: req.body.id }) // Buscando a postagem com o respectivo ID
    .then((postagem) => {
      // Mudando os valores
      postagem.titulo = titulo;
      postagem.descricao = descricao;
      postagem.conteudo = conteudo;
      postagem.categoria = categoria;
      postagem.slug = slug;

      postagem
        .save() // Adicionando ao Banco de Dados
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso!");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          // Bloco para caso haja algum erro interno ao editar a postagem
          req.flash("error_msg", "Erro interno");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a edição");
      res.redirect("/admin/postagens");
    });
});

// Rota para deletar uma postagem
router.get("/postagens/deletar/:id", (req, res) => {
  const { id } = req.params; // Recebendo o id através da URL passada na página postagens.handlebars

  Postagem.deleteOne({ _id: id }) // Buscando e deletando a postagem
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso!");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/admin/postagens");
    });
});

module.exports = router;
