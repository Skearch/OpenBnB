const { prisma } = require("../config/database");

const listAll = async (req, res) => {
  try {
    const properties = await prisma.property.findMany();
    const propertiesWithImages = properties.map((property) => ({
      ...property,
      featuredImage: property.featuredImage
        ? Buffer.from(property.featuredImage).toString("base64")
        : null,
    }));
    res.json({ success: true, properties: propertiesWithImages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const listShowcase = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { showcase: true },
    });
    const propertiesWithImages = properties.map((property) => ({
      ...property,
      featuredImage: property.featuredImage
        ? Buffer.from(property.featuredImage).toString("base64")
        : null,
    }));
    res.json(propertiesWithImages);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const createProperty = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      currencySymbol,
      address,
      showcase,
      checkInOutTitle,
      checkInTime,
      checkOutTime,
    } = req.body;
    const featuredImage = req.files?.featuredImage?.[0]?.buffer;
    const images = req.files?.images?.map((file) => file.buffer) || [];
    if (images.length + (featuredImage ? 1 : 0) < 2) {
      return res
        .status(400)
        .json({ message: "You must upload at least 2 images." });
    }
    if (!featuredImage) {
      return res
        .status(400)
        .json({ message: "You must select one image as the featured image." });
    }
    const property = await prisma.property.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        currencySymbol: currencySymbol || "$",
        address: address || "",
        showcase: showcase === "true",
        featuredImage,
        images,
        ownerId: req.user.id,
        checkInOutTitle,
        checkInTime,
        checkOutTime,
      },
    });
    res.status(201).json({ success: true, property });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const editProperty = async (req, res) => {
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
    } = req.body;
    const featuredImage = req.files?.featuredImage?.[0]?.buffer;
    const images = req.files?.images?.map((file) => file.buffer) || [];
    if (images.length < 1) {
      return res
        .status(400)
        .json({ message: "You must upload at least 1 additional image." });
    }
    if (!featuredImage) {
      return res
        .status(400)
        .json({ message: "You must select one image as the featured image." });
    }
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }
    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseFloat(price),
        description,
        currencySymbol: currencySymbol || "$",
        address: address || "",
        showcase: showcase === "true",
        featuredImage,
        images,
        ownerId: req.user.id,
        checkInOutTitle,
        checkInTime,
        checkOutTime,
      },
    });
    res.status(200).json({ success: true, property });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.property.delete({ where: { id: parseInt(id) } });
    res
      .status(200)
      .json({ success: true, message: "Property deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listAll,
  listShowcase,
  createProperty,
  editProperty,
  deleteProperty,
};
