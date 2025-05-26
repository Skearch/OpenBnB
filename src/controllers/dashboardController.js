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
        return res.redirect("/dashboard/mybooking");
      }
      const redirectMap = {
        owner: "/dashboard/overview",
        staff: "/dashboard/overview",
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

  static async resendVerification(req, res) {
    if (process.env.EMAIL_VERIFICATION !== 'true') {
      return res.status(400).json({ message: "Email verification is disabled" });
    }

    const email = req.body.email;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified) return res.status(400).json({ message: "User already verified" });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { email },
      data: { verificationCode },
    });
    await require("../services/emailService").sendMail({
      to: email,
      subject: "Verify your email",
      html: `<p>Hello ${user.name},</p>
           <p>Your verification code is: <b>${verificationCode}</b></p>
           <p>Enter this code to verify your account.</p>`,
    });

    res.json({ message: "Verification code resent" });
  }

  static async verification(req, res) {
    if (process.env.EMAIL_VERIFICATION !== 'true') {
      return res.redirect('/dashboard/guest');
    }

    if (req.user) {
      const user = await prisma.user.findUnique({ where: { email: req.user.email } });
      if (user && !user.verified) {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
          where: { email: req.user.email },
          data: { verificationCode },
        });
        await require("../services/emailService").sendMail({
          to: req.user.email,
          subject: "Verify your email",
          html: `<p>Hello ${user.name},</p>
                   <p>Your verification code is: <b>${verificationCode}</b></p>
                   <p>Enter this code to verify your account.</p>`,
        });
      }

      res.render("dashboard/verification", {
        email: req.user.email,
        config: res.locals.config,
        user: user,
      });
    }
  }

  static overview(req, res) {
    res.render("dashboard/overview");
  }

  static accounts(req, res) {
    res.render("dashboard/accounts");
  }

  static email(req, res) {
    let emails = [];
    if (req.query.emails) {
      if (Array.isArray(req.query.emails)) {
        emails = req.query.emails;
      } else if (typeof req.query.emails === "string") {
        emails = req.query.emails.split(",");
      }
    }
    res.render("dashboard/email", {
      emails,
      config: res.locals.config,
      user: res.locals.user,
    });
  }

  static subscriptions(req, res) {
    res.render("dashboard/subscriptions");
  }

  static mybookings(req, res) {
    res.render("dashboard/mybookings");
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

  static bookings(req, res) {
    res.render("dashboard/bookings");
  }
}

module.exports = {
  redirect: DashboardController.redirect,
  accounts: DashboardController.accounts,
  overview: DashboardController.overview,
  properties: DashboardController.properties,
  propertiesCreate: DashboardController.propertiesCreate,
  propertiesEdit: DashboardController.propertiesEdit,
  mybookings: DashboardController.mybookings,
  verification: DashboardController.verification,
  resendVerification: DashboardController.resendVerification,
  bookings: DashboardController.bookings,
  subscriptions: DashboardController.subscriptions,
  email: DashboardController.email,
};
