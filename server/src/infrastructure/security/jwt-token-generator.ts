import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicUser } from '../../domain/models/user';
import { TokenGenerator } from '../../use-cases/ports/token-generator';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  sign(user: PublicUser): Promise<string> {
    return Promise.resolve(
      this.jwtService.sign({ sub: user.id, email: user.email }),
    );
  }
}
