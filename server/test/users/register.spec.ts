import { ConflictException } from '@nestjs/common';
import { FakeUserRepository } from '../helpers/fakes';
import { RegisterUseCase } from '../../src/use-cases/user/register';

describe('RegisterUseCase', () => {
  let users: FakeUserRepository;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    users = new FakeUserRepository();
    useCase = new RegisterUseCase(users);
  });

  it('registra um novo usuário e retorna apenas dados públicos', async () => {
    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'Abc123',
    });

    expect(result.id).toBeDefined();
    expect(result.email).toBe('user@example.com');
    expect(result).not.toHaveProperty('password');
  });

  it('normaliza o e-mail para minúsculas e sem espaços', async () => {
    const result = await useCase.execute({
      email: '  User@Example.COM  ',
      password: 'Abc123',
    });

    expect(result.email).toBe('user@example.com');
  });

  it('lança ConflictException quando o e-mail já está cadastrado', async () => {
    await useCase.execute({
      email: 'user@example.com',
      password: 'Abc123',
    });

    await expect(
      useCase.execute({
        email: 'USER@example.com',
        password: 'Abc124',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('armazena a senha hasheada, nunca em texto puro', async () => {
    await useCase.execute({
      email: 'user@example.com',
      password: 'Abc123',
    });

    expect(users.users[0].passwordHash).not.toBe('Abc123');
  });
});
