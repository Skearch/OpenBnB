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

      return res.status(403).send("Access denied");
    } catch (error) {
      console.error("Redirect Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
];

const overview = [(req, res) => res.render("dashboard/overview")];
const accounts = [(req, res) => res.render("dashboard/accounts")];

const properties = (req, res) => res.render("dashboard/properties");
const propertiesCreate = (req, res) => res.render("dashboard/propertiesCreate");

const propertiesEdit = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!property) {
      return res.status(404).send("Property not found");
    }

    res.render("dashboard/propertiesEdit", { property });
  } catch (error) {
    console.error("Error fetching property:", error);
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
};
