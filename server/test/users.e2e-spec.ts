import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Usuários', () => {
  let app: INestApplication;

  const uniqueEmail = () => `e2e-user-${Date.now()}-${Math.random()}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registra um novo usuário e retorna dados públicos', async () => {
    const email = uniqueEmail();

    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email, password: 'Abc123' });

    expect(res.status).toBe(201);
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('rejeita senha curta no registro', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: uniqueEmail(), password: 'abc' });

    expect(res.status).toBe(400);
  });

  it('rejeita senha sem número no registro', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: uniqueEmail(), password: 'Abcdef' });

    expect(res.status).toBe(400);
  });

  it('rejeita senha sem letra maiúscula no registro', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: uniqueEmail(), password: 'abc123' });

    expect(res.status).toBe(400);
  });

  it('rejeita senha sem letra minúscula no registro', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: uniqueEmail(), password: 'ABC123' });

    expect(res.status).toBe(400);
  });

  it('rejeita e-mail inválido no registro', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: 'email-invalido', password: 'Abc123' });

    expect(res.status).toBe(400);
  });

  it('retorna 409 ao registrar e-mail duplicado', async () => {
    const email = uniqueEmail();

    await request(app.getHttpServer())
      .post('/users/register')
      .send({ email, password: 'Abc123' });

    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email, password: 'Xyz789' });

    expect(res.status).toBe(409);
  });

  it('autentica com credenciais corretas', async () => {
    const email = uniqueEmail();
    const password = 'Abc123';

    await request(app.getHttpServer())
      .post('/users/register')
      .send({ email, password });

    const res = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('retorna 401 com credenciais incorretas', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: uniqueEmail(), password: 'Abc123' });

    expect(res.status).toBe(401);
  });
});
