const { prisma } = require("../config/database");
const PropertyController = require("./propertyController");

class DashboardController {
  static async redirect(req, res) {
    try {
      if (!req.user) {
        return res.redirect("/account/login");
      }
      const { role, email } = req.user;
      if (role === "guest") {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return res.redirect("/account/login");
        }
        if (!user.verified) {
          return res.redirect("/dashboard/verification");
        }
        return res.redirect("/dashboard/guest");
      }
      const redirectMap = {
        owner: "/dashboard/overview",
        staff: "/dashboard/staff",
      };
      const destination = redirectMap[role];
      if (destination) {
        return res.redirect(destination);
      }
      return res.status(403).send("Access denied");
    } catch (error) {
      console.error("Error in redirect:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async verification(req, res) {
    if (req.user && !req.user.verified) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { email: req.user.email },
        data: { verificationCode },
      });
      await require("../services/emailService").sendMail({
        to: req.user.email,
        subject: "Verify your email",
        html: `<p>Hello ${req.user.name},</p>
             <p>Your verification code is: <b>${verificationCode}</b></p>
             <p>Enter this code to verify your account.</p>`,
      });
    }
    res.render("dashboard/verification", {
      email: req.user ? req.user.email : "",
      config: res.locals.config,
      user: req.user,
    });
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
  verification: DashboardController.verification,
};
