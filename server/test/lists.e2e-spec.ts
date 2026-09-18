import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ChangeType } from '../src/domain/enums/change-type';

describe('Listas (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let otherUserToken: string;

  const registerAndLogin = async () => {
    const email = `e2e-${Date.now()}-${Math.random()}@test.com`;
    const password = 'Abc123';

    await request(app.getHttpServer())
      .post('/users/register')
      .send({ email, password })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email, password })
      .expect(200);

    return login.body.token as string;
  };

  const auth = (t?: string) => ({
    Authorization: `Bearer ${t ?? token}`,
  });

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

    token = await registerAndLogin();
    otherUserToken = await registerAndLogin();
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria uma lista com versão inicial 1', async () => {
    const res = await request(app.getHttpServer())
      .post('/lists')
      .set(auth())
      .send({ name: 'Compras', elements: ['Arroz', 'Feijão'] });

    expect(res.status).toBe(201);
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.version).toBe(1);
    expect(
      res.body.elements.map((el: { content: string }) => el.content),
    ).toEqual(['Arroz', 'Feijão']);
  });

  it('rejeita acesso sem token', async () => {
    await request(app.getHttpServer()).get('/lists').expect(401);
  });

  it('rejeita token inválido', async () => {
    await request(app.getHttpServer())
      .get('/lists')
      .set({ Authorization: 'Bearer token-invalido' })
      .expect(401);
  });

  it('rejeita body inválido com 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/lists')
      .set(auth())
      .send({});

    expect(res.status).toBe(400);
  });

  it('adicionar, editar, reordenar e remover elementos', async () => {
    const created = await request(app.getHttpServer())
      .post('/lists')
      .set(auth())
      .send({ name: 'Tarefas' })
      .expect(201);
    const listId = created.body.id;

    const a = await request(app.getHttpServer())
      .post(`/lists/${listId}/elements`)
      .set(auth())
      .send({ content: 'A' })
      .expect(201);
    const b = await request(app.getHttpServer())
      .post(`/lists/${listId}/elements`)
      .set(auth())
      .send({ content: 'B' })
      .expect(201);
    const c = await request(app.getHttpServer())
      .post(`/lists/${listId}/elements`)
      .set(auth())
      .send({ content: 'C' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/lists/${listId}/elements/${a.body.added.id}`)
      .set(auth())
      .send({ content: 'A1' })
      .expect(200);

    await request(app.getHttpServer())
      .put(`/lists/${listId}/elements/${a.body.added.id}/reorder`)
      .set(auth())
      .send({ newPosition: 2 })
      .expect(200);

    const list = await request(app.getHttpServer())
      .get(`/lists/${listId}`)
      .set(auth())
      .expect(200);

    expect(
      list.body.elements.map((el: { content: string }) => el.content),
    ).toEqual(['B', 'C', 'A1']);

    await request(app.getHttpServer())
      .delete(`/lists/${listId}/elements/${b.body.added.id}`)
      .set(auth())
      .expect(200);

    const afterDelete = await request(app.getHttpServer())
      .get(`/lists/${listId}`)
      .set(auth())
      .expect(200);

    expect(
      afterDelete.body.elements.map((el: { content: string }) => el.content),
    ).toEqual(['C', 'A1']);
  });

  it('registra histórico e restaura uma versão anterior', async () => {
    const created = await request(app.getHttpServer())
      .post('/lists')
      .set(auth())
      .send({ name: 'Restaurável', elements: ['X'] })
      .expect(201);
    const listId = created.body.id;

    await request(app.getHttpServer())
      .post(`/lists/${listId}/elements`)
      .set(auth())
      .send({ content: 'Y' })
      .expect(201);

    const history = await request(app.getHttpServer())
      .get(`/lists/${listId}/history`)
      .set(auth())
      .expect(200);

    expect(history.body.currentVersion).toBe(2);
    expect(
      history.body.versions.map((v: { changeType: string }) => v.changeType),
    ).toEqual([ChangeType.ADD, ChangeType.CREATE]);

    const restored = await request(app.getHttpServer())
      .post(`/lists/${listId}/restore/1`)
      .set(auth())
      .expect(201);

    expect(restored.body.restoredFromVersion).toBe(1);
    expect(restored.body.version).toBe(3);
    expect(
      restored.body.elements.map((el: { content: string }) => el.content),
    ).toEqual(['X']);

    const historyAfterRestore = await request(app.getHttpServer())
      .get(`/lists/${listId}/history`)
      .set(auth())
      .expect(200);

    expect(historyAfterRestore.body.currentVersion).toBe(3);
    expect(
      historyAfterRestore.body.versions.map(
        (v: { changeType: string }) => v.changeType,
      ),
    ).toEqual([ChangeType.RESTORE, ChangeType.ADD, ChangeType.CREATE]);

    await request(app.getHttpServer())
      .post(`/lists/${listId}/elements`)
      .set(auth())
      .send({ content: 'Z' })
      .expect(201);

    const afterRestore = await request(app.getHttpServer())
      .get(`/lists/${listId}`)
      .set(auth())
      .expect(200);

    expect(afterRestore.body.version).toBe(4);
    expect(
      afterRestore.body.elements.map((el: { content: string }) => el.content),
    ).toEqual(['X', 'Z']);
  });

  it('não permite acessar listas de outros usuários', async () => {
    const created = await request(app.getHttpServer())
      .post('/lists')
      .set(auth())
      .send({ name: 'Privada' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/lists/${created.body.id}`)
      .set(auth(otherUserToken))
      .expect(404);
  });

  it('versiona uma atualização total via PUT', async () => {
    const created = await request(app.getHttpServer())
      .post('/lists')
      .set(auth())
      .send({ name: 'Original' })
      .expect(201);
    const listId = created.body.id;

    const updated = await request(app.getHttpServer())
      .put(`/lists/${listId}`)
      .set(auth())
      .send({ name: 'Nova', elements: ['1', '2', '3'] })
      .expect(200);

    expect(updated.body.version).toBe(2);
    expect(
      updated.body.elements.map((el: { content: string }) => el.content),
    ).toEqual(['1', '2', '3']);
  });
});
