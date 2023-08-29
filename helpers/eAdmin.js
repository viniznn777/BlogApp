module.exports = {
  eAdmin: (req, res, next) => {
    if (
      req.isAuthenticated() &&
      req.user.eAdmin ==
        ".- -.-.-- ..- - .--.-. .... . -. - .. -.-. .- - . -.. / ..- -.--. ... . -.--.- .-. / -.-.-- .-- .. .--.-. - .... / .- -.. -- .. -. .. ... - .-. .- -.--. - --- -.--.- .-. / -.-.-- .--. . .--.-. .-. -- .. ... ... .. --- -. ..."
    ) {
      return next();
    }
    req.flash(
      "error_msg",
      "Você precisa ser um Administrador para ter acesso a esta página!"
    );
    res.redirect("/");
  },
};
