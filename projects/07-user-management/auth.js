import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// #region Password Auth
export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const checkPassword = (plain, hash) => bcrypt.compare(plain, hash);

export function signToken(user, secret) {
  return jwt.sign({ sub: user.id, ver: user.tokenVer }, secret, { expiresIn: '1h' });
}

// Reads "Authorization: Bearer <token>" and sets req.auth = { sub, ver }.
export function requireAuth(secret) {
  return (req, res, next) => {
    const token = req.get('authorization')?.replace(/^Bearer /, '');
    try {
      req.auth = jwt.verify(token, secret);
      next();
    } catch {
      res.status(401).json({ error: 'log in first' });
    }
  };
}
// #endregion
