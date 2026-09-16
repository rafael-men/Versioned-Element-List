import { UnauthorizedException } from '@nestjs/common';
import { FakeTokenGenerator, FakeUserRepository } from '../helpers/fakes';
import { LoginUseCase } from '../../src/use-cases/user/login';
import { hashPassword } from '../../src/use-cases/user/password-hasher';

describe('LoginUseCase', () => {
  let users: FakeUserRepository;
  let useCase: LoginUseCase;

  beforeEach(async () => {
    users = new FakeUserRepository();
    useCase = new LoginUseCase(users, new FakeTokenGenerator());
    await users.create('user@example.com', await hashPassword('Abc123'));
  });

  it('autentica com credenciais corretas e emite um token', async () => {
    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'Abc123',
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user.email).toBe('user@example.com');
    expect(result.user).not.toHaveProperty('password');
  });

  it('ignora diferenças de caixa no e-mail ao autenticar', async () => {
    const result = await useCase.execute({
      email: 'USER@EXAMPLE.COM',
      password: 'Abc123',
    });

    expect(result.user.id).toBeDefined();
  });

  it('lança UnauthorizedException com senha incorreta', async () => {
    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'abcdef',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lança UnauthorizedException com e-mail inexistente', async () => {
    await expect(
      useCase.execute({
        email: 'nobody@example.com',
        password: 'Abc123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
