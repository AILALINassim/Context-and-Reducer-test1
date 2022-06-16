const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Sign up
const signUp = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email: req.body.email },
    });
    if (user !== null) {
      res.status(409).json({ error: "Utilisateur trouvé avec cet email !" });
    } else {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      const user = await prisma.users.create({
        data: {
          lastName: req.body.lastName,
          firstName: req.body.firstName,
          email: req.body.email,
          password: req.body.password,
        },
      });
      const userRole = await prisma.users_roles.create({
        data: {
          user_id: user.id,
          role_id: 2,
        },
      });
      res.status(200).json({ message: "Utilisateur crée !" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email: req.body.email },
    });
    if (user === null) {
      res.status(404).json({ email: "E-mail inconnu !" });
    } else {
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        res.status(404).json({ password: "Mot de passe incorrect !" });
      } else {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie("Token", token, { httpOnly: process.env.ENV === "DEV" ? false : true });
        res.status(200).json({
          userId: user.id,
          token: token,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Logout
const logout = (req, res, next) => {
  res.clearCookie("Token");
  res.status(200).json({ message: "Déconnexion réussie !" });
  res.redirect("/");
};

module.exports = {
  signUp,
  login,
  logout,
};