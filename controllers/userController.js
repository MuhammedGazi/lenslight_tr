import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Photo from "../models/photoModel.js";

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user: user_id });
  } catch (error) {
    let errors2 = {};
    if (error.code === 11000) {
      errors2.email = "The Email is already register";
    }
    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }
    console.log("errrors2", errors2);
    res.status(400).json(errors2);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    let same = false;

    if (user) {
      same = await bcrypt.compare(password, user.password);
    } else {
      return res.status(401).json({
        succeded: false,
        error: "There is no such user",
      });
    }

    if (same) {
      const token = createToken(user._id);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.redirect("/users/dashboard");
    } else {
      res.status(401).json({
        succeded: false,
        error: "Paswords are not matched",
      });
    }
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const getDashboardPage = async (req, res) => {
  const photos = await Photo.find({ user: res.locals.user._id });
  const user = await User.findById({ _id: res.locals.user._id }).populate([
    "followers",
    "followings",
  ]);
  res.render("dashboard", {
    link: "dashboard",
    photos,
    user,
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: res.locals.user._id } }); //find methodu ile tüm kullanıcıları çekiyoruz. _id:{$ne:res.locals.user._id} ile de kendimizi çıkartıyoruz. Çünkü kendimizi görmek istemiyoruz.
    res.status(200).render("users", {
      users,
      link: "users",
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const getAUser = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });

    const inFollowers = user.followers.some((follower) => {
      return follower.equals(res.locals.user._id);
    });

    const photos = await Photo.find({ user: user._id });
    res.status(200).render("user", {
      //render methodu ile user.ejs dosyasını gönderiyoruz.
      user,
      photos,
      link: "user",
      inFollowers,
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const follow = async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id }, //takip edilecek kullanıcıyı buluyoruz.
      {
        $push: { followers: res.locals.user._id }, //followers arrayine ekliyoruz.
      },
      { new: true } //new:true ile de güncellenmiş veriyi geri döndürüyoruz.
    );
    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id }, //kendimizi buluyoruz.
      {
        $push: { followings: req.params.id }, //followings arrayine ekliyoruz.
      },
      { new: true } //new:true ile de güncellenmiş veriyi geri döndürüyoruz.
    );
    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
const unfollow = async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id }, //takip edilecek kullanıcıyı buluyoruz.
      {
        $pull: { followers: res.locals.user._id }, //followers arrayine ekliyoruz.
      },
      { new: true } //new:true ile de güncellenmiş veriyi geri döndürüyoruz.
    );
    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id }, //kendimizi buluyoruz.
      {
        $pull: { followings: req.params.id }, //followings arrayine ekliyoruz.
      },
      { new: true } //new:true ile de güncellenmiş veriyi geri döndürüyoruz.
    );
    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

export {
  createUser,
  loginUser,
  getDashboardPage,
  getAllUsers,
  getAUser,
  follow,
  unfollow,
};
