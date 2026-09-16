import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TOKEN_GENERATOR } from '../../use-cases/ports/token-generator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtTokenGenerator } from './jwt-token-generator';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'chave-secreta-dev',
      signOptions: {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '604800', 10),
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
