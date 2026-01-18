import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || '',
      callbackURL: 'http://localhost:3001/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
    const user = {
      email,
      username: (profile.displayName || `user${profile.id}`)
        .replace(/\s+/g, '')
        .toLowerCase(),
      provider: 'facebook',
      providerId: profile.id,
    };
    done(null, user);
  }
}
