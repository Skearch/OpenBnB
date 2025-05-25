const jwt = require("jsonwebtoken");

class AuthenticationMiddleware {
  static requireRole(role) {
    return (req, res, next) => {
      AuthenticationMiddleware.#verifyToken(req, res, next, role ? [role] : null);
    };
  }

  static requireRoles(roles) {
    return (req, res, next) => {
      AuthenticationMiddleware.#verifyToken(req, res, next, roles);
    };
  }

  static #verifyToken(req, res, next, allowedRoles) {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError" && refreshToken) {
        try {
          const decodedRefresh = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
          );
          const newToken = jwt.sign(
            {
              id: decodedRefresh.id,
              role: decodedRefresh.role,
              name: decodedRefresh.name,
              email: decodedRefresh.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          );
          res.cookie("token", newToken, { httpOnly: true, sameSite: "strict" });
          req.user = decodedRefresh;
          if (allowedRoles && !allowedRoles.includes(decodedRefresh.role)) {
            return res.status(403).json({ message: "Forbidden" });
          }
          return next();
        } catch (refreshErr) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
      }

      req.user = null;
      return next();
    }
  }
}

function authenticationMiddleware(role) {
  if (role) {
    return AuthenticationMiddleware.requireRole(role);
  }
  return AuthenticationMiddleware.requireRole();
}

authenticationMiddleware.requireRole = AuthenticationMiddleware.requireRole;
authenticationMiddleware.requireRoles = AuthenticationMiddleware.requireRoles;

module.exports = authenticationMiddleware;