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
      image_id: result.public_id,
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
    let isOwner = false;
    if (res.locals.user) {
      isOwner = photo.user.equals(res.locals.user._id); //eğer giriş yapan kullanıcı varsa ve giriş yapan kullanıcı ile fotoğrafın sahibi aynıysa isOwner true oluyor.
    }
    res.status(200).render("photo", {
      photo,
      link: "photos",
      isOwner,
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    const photoId = photo.image_id;
    await cloudinary.uploader.destroy(photoId);
    await Photo.findByIdAndRemove({ _id: req.params.id });
    res.status(200).redirect("/users/dashboard");
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
const updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (req.files) {
      const photoId = photo.image_id;
      await cloudinary.uploader.destroy(photoId);

      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: "lenslight_tr",
        }
      );
      photo.url = result.secure_url; //secure_url ile resmin url sini alıyoruz. result içindeki secure_url ile alıyoruz.
      photo.image_id = result.public_id; //public_id ile resmin id sini alıyoruz.
      fs.unlinkSync(req.files.image.tempFilePath); //yerel dosyayı sil
    }
    photo.name = req.body.name;
    photo.description = req.body.description;
    photo.save();

    res.status(200).redirect(`/photos/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
export { createPhoto, getAllPhotos, getAPhoto, deletePhoto, updatePhoto };
