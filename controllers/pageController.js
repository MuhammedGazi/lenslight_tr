const getIndexPage = (req, res) => {
  res.render("index", {
    link: "index",
  });
};
const getAboutPage = (req, res) => {
  res.render("about", {
    link: "about",
  });
};

const getRegisterPage = (req, res) => {
  res.render("register", {
    link: "register",
  });
};

const getLoginPage = (req, res) => {
  res.render("login", {
    link: "login",
  });
};

const getLogout = (req, res) => {
  res.cookie("jwt", "", {    //cookie ye 1 tane jwt adında boş bir değer atıyoruz
    maxAge: 1,                 //ve maxAge 1 yani 1 milisaniye yani 1 ms
  });                          //yani cookie yi silmiş oluyoruz
  res.redirect("/");            //ve anasayfaya yönlendiriyoruz
};                          
export { getIndexPage, getAboutPage, getRegisterPage, getLoginPage,getLogout };
