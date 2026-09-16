import {
  hashPassword,
  verifyPassword,
} from '../../src/use-cases/user/password-hasher';

describe('password-hasher', () => {
  it('gera um hash diferente da senha em texto puro', async () => {
    const hash = await hashPassword('abc123');

    expect(hash).not.toBe('abc123');
    expect(hash).toContain(':');
  });

  it('usa salt aleatório para a mesma senha', async () => {
    const first = await hashPassword('abc123');
    const second = await hashPassword('abc123');

    expect(first).not.toBe(second);
  });

  it('verifica corretamente a senha certa', async () => {
    const hash = await hashPassword('abc123');

    expect(await verifyPassword('abc123', hash)).toBe(true);
  });

  it('rejeita senha incorreta', async () => {
    const hash = await hashPassword('abc123');

    expect(await verifyPassword('abc124', hash)).toBe(false);
  });

  it('rejeita um hash armazenado malformado', async () => {
    expect(await verifyPassword('abc123', 'sem-salt-valido')).toBe(false);
  });
});
