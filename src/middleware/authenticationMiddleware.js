const jwt = require("jsonwebtoken");

const authenticationMiddleware = (role) => (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (role && decoded.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
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
        return next();
      } catch (refreshErr) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
    }

    req.user = null;
    next();
  }
};

module.exports = authenticationMiddleware;
