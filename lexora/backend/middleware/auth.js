import jwt from 'jsonwebtoken';

// verifyJWT — Vérifie qu'un token JWT valide est présent.
// Décode le token et le place dans req.admin (id, email, role, nom, prenom).
// NE vérifie PAS le rôle : un employé authentifié passe ce middleware.
export function verifyJWT(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = header.slice(7);
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// requireAdmin — Vérifie le token PUIS le rôle.
// Renvoie 401 si le token est absent/invalide, 403 si l'utilisateur
// est authentifié mais n'est pas admin. Empêche un employé d'accéder
// aux routes d'administration ou de s'auto-promouvoir admin.
export function requireAdmin(req, res, next) {
  verifyJWT(req, res, () => {
    if (req.admin?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
  });
}
