const { prisma } = require("../config/database");

const redirect = [
  async (req, res) => {
    try {
      if (!req.user) return res.redirect("/account/login");
      const role = req.user.role;
      switch (role) {
        case "owner":
          return res.redirect("/dashboard/overview");
        case "staff":
          return res.redirect("/dashboard/staff");
        case "guest":
          return res.redirect("/dashboard/guest");
      }
      res.status(403).send("Access denied");
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
];

const overview = [(req, res) => res.render("dashboard/overview")];
const accounts = [(req, res) => res.render("dashboard/accounts")];
const guest = [(req, res) => res.render("dashboard/guest")];
const properties = (req, res) => res.render("dashboard/property/properties");
const propertiesCreate = (req, res) =>
  res.render("dashboard/property/propertiesCreate");

const propertiesEdit = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!property) return res.status(404).send("Property not found");
    res.render("dashboard/property/propertiesEdit", { property });
  } catch {
    res.status(500).send("Server error");
  }
};

module.exports = {
  redirect,
  accounts,
  overview,
  properties,
  propertiesCreate,
  propertiesEdit,
  guest,
};
