const { prisma } = require("../config/database");
const PropertyController = require("./propertyController");

class DashboardController {
  static async redirect(req, res) {
    try {
      if (!req.user) {
        return res.redirect("/account/login");
      }
      const redirectMap = {
        owner: "/dashboard/overview",
        staff: "/dashboard/staff",
        guest: "/dashboard/guest",
      };
      const destination = redirectMap[req.user.role];
      if (destination) {
        return res.redirect(destination);
      }
      return res.status(403).send("Access denied");
    } catch (error) {
      console.error("Error in redirect:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static overview(req, res) {
    res.render("dashboard/overview");
  }

  static accounts(req, res) {
    res.render("dashboard/accounts");
  }

  static guest(req, res) {
    res.render("dashboard/guest");
  }

  static properties(req, res) {
    res.render("dashboard/property/properties");
  }

  static propertiesCreate(req, res) {
    res.render("dashboard/property/propertiesCreate");
  }

  static async propertiesEdit(req, res) {
    try {
      const propertyId = parseInt(req.params.id, 10);
      if (isNaN(propertyId)) {
        return res.status(400).send("Invalid property ID");
      }
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        return res.status(404).send("Property not found");
      }
      const propertyWithImages = PropertyController.toImageUrls(property);
      res.render("dashboard/property/propertiesEdit", {
        property: propertyWithImages,
        config: res.locals.config,
        user: res.locals.user,
      });
    } catch (error) {
      console.error("Error in propertiesEdit:", error);
      res.status(500).send("Server error");
    }
  }
}

module.exports = {
  redirect: DashboardController.redirect,
  accounts: DashboardController.accounts,
  overview: DashboardController.overview,
  properties: DashboardController.properties,
  propertiesCreate: DashboardController.propertiesCreate,
  propertiesEdit: DashboardController.propertiesEdit,
  guest: DashboardController.guest,
};
