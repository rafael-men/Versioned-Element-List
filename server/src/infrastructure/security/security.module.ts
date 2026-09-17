import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TOKEN_GENERATOR } from '../../use-cases/ports/token-generator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtTokenGenerator } from './jwt-token-generator';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET não definido no ambiente (.env)');
        }
        return {
          secret,
          signOptions: {
            expiresIn: parseInt(
              config.get<string>('JWT_EXPIRES_IN') ?? '604800',
              10,
            ),
          },
        };
      },
    }),
  ],
  providers: [
    JwtAuthGuard,
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
  ],
  exports: [JwtAuthGuard, TOKEN_GENERATOR],
})
export class SecurityModule {}
