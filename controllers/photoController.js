import Photo from "../models/photoModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const createPhoto = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath, //yerel dosya yolu
    {
      use_filename: true,
      folder: "lenslight_tr",
    }
  );
  try {
    await Photo.create({
      name: req.body.name,
      description: req.body.description,
      user: res.locals.user._id,
      url: result.secure_url,
    });
    fs.unlinkSync(req.files.image.tempFilePath); //yerel dosyayı sil
    res.status(201).redirect("/users/dashboard");
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const getAllPhotos = async (req, res) => {
  try {
    const photos = res.locals.user
      ? await Photo.find({ user: { $ne: res.locals.user._id } }) //res.locals.user._id ile giriş yapan kullanıcının id sini alıyoruz. eğer giriş yapan kullanıcı varsa onun id sini alıp onun dışındaki kullanıcıların fotoğraflarını çekiyoruz.
      : await Photo.find({}); //eğer giriş yapan kullanıcı yoksa tüm fotoğrafları çekiyoruz.
    res.status(200).render("photos", {
      photos,
      link: "photos",
    });

    res.status(200).render("photos", {
      photos,
      link: "photos",
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const getAPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById({ _id: req.params.id }).populate("user"); //populate ile user modelindeki bilgileri çekiyoruz. bunuda photo.ejs deArtist: <%=photo.user.username %> olarak gösteriyoruz.
    res.status(200).render("photo", {
      photo,
      link: "photos",
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
export { createPhoto, getAllPhotos, getAPhoto };
