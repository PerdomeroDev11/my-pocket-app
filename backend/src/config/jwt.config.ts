import {registerAs} from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_ACCESS_SECRET,
  secretRefresh: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
  expiresInRefresh: process.env.JWT_EXPIRES_IN_REFRESH,
}));