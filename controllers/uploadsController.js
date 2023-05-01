const Product = require('../models/Product');
const path = require('path');
const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('../errors');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const uploadProductImageLocal = async (req, res) => {
  const productImage = req.files.image;

  // check if image file exits
  if (!req.files) {
    throw new CustomError.BadRequestError('No File Uploaded');
  }

  // check file type is image or not
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  // check image sizes
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError('Please upload image smaller 1MB');
  }

  const imagePath = path.join(
    __dirname,
    '../public/upload/' + `${productImage.name}`
  );

  await productImage.mv(imagePath);
  return res
    .status(StatusCodes.OK)
    .json({ image: { src: `upload/${productImage.name}` } });
};

const uploadProductImage = (req, res) => {
  const result = cloudinary.uploader.upload(req.files.image.tempFilePath, {
    use_filename: true,
    folder: 'File Upload',
  });

  result
    .then((data) => {
      console.log(data);
      console.log(data.secure_url);
    })
    .catch((err) => {
      console.log(err);
    });
  fs.unlinkSync(req.files.image.tempFilePath);
  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = { uploadProductImage };
