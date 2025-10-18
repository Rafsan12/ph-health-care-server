import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export const generateToken = async (
  payload: any,
  secret: Secret,
  expiresIn: string
) => {
  const token = await jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions);

  return token;
};

export const verifyToken = (token: string, secret: Secret) => {
  const verify = jwt.verify(token, secret) as JwtPayload;

  return verify;
};
