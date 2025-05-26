const { prisma } = require("../config/database");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

class FileHelper {
  static uploadsDir = path.join(__dirname, "../public/uploads");

  static async copyImageFile(originalFilename) {
    if (!originalFilename) return null;
    const ext = path.extname(originalFilename);
    const randomName = crypto.randomBytes(16).toString("hex");
    const newFilename = `${randomName}${ext}`;
    const srcPath = path.join(this.uploadsDir, originalFilename);
    const destPath = path.join(this.uploadsDir, newFilename);
    await fs.promises.copyFile(srcPath, destPath);
    return newFilename;
  }

  static async deleteFiles(filenames) {
    await Promise.all(
      filenames.map(async (filename) => {
        const cleanFilename = filename.replace(/^\/?uploads\//, "");
        const filePath = path.join(this.uploadsDir, cleanFilename);
        try {
          await fs.promises.unlink(filePath);
        } catch (err) {

        }
      })
    );
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FileHelper.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${ext}`);
  },
});
const upload = multer({ storage });

class PropertyController {
  static toImageUrls(property) {
    return {
      ...property,
      featuredImage: property.featuredImagePath
        ? `/uploads/${property.featuredImagePath}`
        : null,
      images: property.imagePaths
        ? property.imagePaths.map((img) => `/uploads/${img}`)
        : [],
    };
  }

  static async cloneProperty(req, res) {
    try {
      const { id } = req.params;
      const original = await prisma.property.findUnique({
        where: { id: parseInt(id) },
      });
      if (!original) {
        return res
          .status(404)
          .json({ success: false, message: "Original property not found." });
      }

      let newFeaturedImagePath = null;
      if (original.featuredImagePath) {
        newFeaturedImagePath = await FileHelper.copyImageFile(original.featuredImagePath);
      }

      let newImagePaths = [];
      if (original.imagePaths && original.imagePaths.length > 0) {
        for (const img of original.imagePaths) {
          const newImg = await FileHelper.copyImageFile(img);
          if (newImg) newImagePaths.push(newImg);
        }
      }

      const cloned = await prisma.property.create({
        data: {
          ownerId: original.ownerId,
          name: original.name + " (Copy)",
          description: original.description,
          price: original.price,
          currencySymbol: original.currencySymbol,
          address: original.address,
          showcase: original.showcase,
          checkInOutTitle: original.checkInOutTitle,
          checkInTime: original.checkInTime,
          checkOutTime: original.checkOutTime,
          featuredImagePath: newFeaturedImagePath,
          imagePaths: newImagePaths,
        },
      });

      res.status(201).json({ success: true, property: cloned });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Failed to clone property." });
    }
  }

  static async listAll(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const total = await prisma.property.count();

      const properties = await prisma.property.findMany({
        skip,
        take: limit,
      });

      const propertiesWithImages = properties.map(PropertyController.toImageUrls);

      res.json({
        success: true,
        properties: propertiesWithImages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async listShowcase(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const total = await prisma.property.count({
        where: { showcase: true },
      });

      const properties = await prisma.property.findMany({
        where: { showcase: true },
        skip,
        take: limit,
      });

      const propertiesWithImages = properties.map(PropertyController.toImageUrls);

      res.json({
        success: true,
        properties: propertiesWithImages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }

  static async statusOccupancy(req, res) {
    try {
      const properties = await prisma.property.findMany({
        select: { id: true }
      });

      const bookings = await prisma.booking.findMany({
        where: { status: "booked" },
        select: { propertyId: true, startDate: true, endDate: true }
      });

      let totalAvailableNights = 0;
      let totalBookedNights = 0;
      const today = new Date();
      for (const property of properties) {

        const propertyBookings = bookings.filter(b => b.propertyId === property.id);
        let earliest = propertyBookings.length
          ? propertyBookings.reduce((min, b) => b.startDate < min ? b.startDate : min, propertyBookings[0].startDate)
          : null;

        if (!earliest) continue;
        const availableNights = Math.ceil((today - new Date(earliest)) / (1000 * 60 * 60 * 24));
        totalAvailableNights += availableNights;
      }

      for (const booking of bookings) {
        const nights = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
        totalBookedNights += nights;
      }

      const rate = totalAvailableNights > 0
        ? Math.round((totalBookedNights / totalAvailableNights) * 100)
        : 0;

      res.json({ rate });
    } catch (err) {
      res.status(500).json({ rate: 0 });
    }
  }

  static #parseImagePaths(imagePaths) {
    if (typeof imagePaths === "string") {
      try {
        return JSON.parse(imagePaths);
      } catch {
        return [];
      }
    }
    return Array.isArray(imagePaths) ? imagePaths : [];
  }

  static async createProperty(req, res) {
    try {
      let {
        name,
        description,
        price,
        currencySymbol,
        address,
        showcase,
        checkInOutTitle,
        checkInTime,
        checkOutTime,
        featuredImagePath,
        imagePaths,
      } = req.body;

      imagePaths = PropertyController.#parseImagePaths(imagePaths);

      const featuredImage =
        req.files?.featuredImage?.[0]?.filename || featuredImagePath;
      const images =
        req.files?.images?.map((file) => file.filename) || imagePaths;

      if (images.length + (featuredImage ? 1 : 0) < 2) {
        return res
          .status(400)
          .json({ message: "You must upload at least 2 images." });
      }
      if (!featuredImage) {
        return res.status(400).json({
          message: "You must select one image as the featured image.",
        });
      }

      const property = await prisma.property.create({
        data: {
          name,
          price: parseFloat(price),
          description,
          currencySymbol: currencySymbol || "$",
          address: address || "",
          showcase: showcase === "true" || showcase === true,
          featuredImagePath: featuredImage,
          imagePaths: images.filter(Boolean),
          ownerId: req.user.id,
          checkInOutTitle,
          checkInTime,
          checkOutTime,
        },
      });
      res.status(201).json({ success: true, property });
    } catch (err) {
      console.error("Error creating property:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async editProperty(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        price,
        description,
        showcase,
        currencySymbol,
        address,
        checkInOutTitle,
        checkInTime,
        checkOutTime,
        featuredImagePath,
        existingImages,
      } = req.body;

      const oldProperty = await prisma.property.findUnique({
        where: { id: parseInt(id) },
      });

      let imagePaths = [];
      if (existingImages) {
        imagePaths = JSON.parse(existingImages);
      }

      if (req.files?.images) {
        imagePaths = imagePaths.concat(
          req.files.images.map((file) => file.filename)
        );
      }

      let featuredImageFilename = featuredImagePath;
      if (req.files?.featuredImage?.[0]) {
        featuredImageFilename = req.files.featuredImage[0].filename;
      }

      if (imagePaths.length + (featuredImageFilename ? 1 : 0) < 2) {
        return res
          .status(400)
          .json({ message: "You must upload at least 2 images." });
      }
      if (!featuredImageFilename) {
        return res.status(400).json({
          message: "You must select one image as the featured image.",
        });
      }

      const oldImages = [
        ...(oldProperty.imagePaths || []),
        oldProperty.featuredImagePath,
      ].filter(Boolean);

      const newImages = [...imagePaths, featuredImageFilename].filter(Boolean);

      const imagesToDelete = oldImages.filter(
        (img) => !newImages.includes(img)
      );

      await FileHelper.deleteFiles(imagesToDelete);

      const property = await prisma.property.update({
        where: { id: parseInt(id) },
        data: {
          name,
          price: parseFloat(price),
          description,
          currencySymbol: currencySymbol || "$",
          address: address || "",
          showcase: showcase === "true",
          featuredImagePath: featuredImageFilename,
          imagePaths,
          ownerId: req.user.id,
          checkInOutTitle,
          checkInTime,
          checkOutTime,
        },
      });
      res.status(200).json({ success: true, property });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await prisma.property.findUnique({
        where: { id: parseInt(id) },
      });

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const imagesToDelete = [
        ...(property.imagePaths || []),
        property.featuredImagePath,
      ].filter(Boolean);

      await FileHelper.deleteFiles(imagesToDelete);

      await prisma.property.delete({ where: { id: parseInt(id) } });

      res
        .status(200)
        .json({ success: true, message: "Property deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  static async get(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Property ID is required." });
      }
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID." });
      }
      const property = await prisma.property.findUnique({
        where: { id: parseInt(id) },
      });
      if (!property) {
        if (req.query.view === "page") {
          return res.status(404).render("pages/404");
        }
        return res.json({ success: false, property: null });
      }
      const propertyWithImages = PropertyController.toImageUrls(property);
      if (req.query.view === "page") {
        return res.render("pages/property", {
          property: propertyWithImages,
          propertyId: property.id,
          request: req,
        });
      }
      res.json({ success: true, property: propertyWithImages });
    } catch (err) {
      if (req.query.view === "page") {
        return res.status(500).render("pages/500");
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = {
  get: PropertyController.get,
  listAll: PropertyController.listAll,
  listShowcase: PropertyController.listShowcase,
  createProperty: PropertyController.createProperty,
  editProperty: PropertyController.editProperty,
  deleteProperty: PropertyController.deleteProperty,
  toImageUrls: PropertyController.toImageUrls,
  cloneProperty: PropertyController.cloneProperty,
  upload,
  statusOccupancy: PropertyController.statusOccupancy,
};