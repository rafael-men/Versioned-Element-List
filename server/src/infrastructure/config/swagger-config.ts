import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api-docs';

export const swaggerConfig = () => {
  const config = new DocumentBuilder()
    .setTitle('API de Lista com Versionamento de Elementos')
    .setVersion('1.0')
    .addTag('Auth', 'Autenticação de usuários')
    .addTag('Lists', 'CRUD de listas e gestão de elementos e versões')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  return config;
};

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(app, swaggerConfig());
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
    customSiteTitle: 'API de Lista com Versionamento de Elementos',
  });
}
