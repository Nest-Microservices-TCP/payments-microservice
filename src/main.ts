import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from 'config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments-ms');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  /**
   * De esta forma es como podemos definir microservicios híbridos.
   * En este caso, el servicio de payments sera un híbrido que tendrá
   * comunicación a traves de NATS asi como comunicación HTTP a traves
   * del puerto 3003.
   *
   * Para ello usamos la función connectMicroservice, la cual recibe
   * la misma data que si estuviéramos registrando el microservicio con
   * un solo protocolo de comunicación
   *
   * Igualmente, ahora, para levantar este híbrido, usamos la instrucción
   * startAllMicroservices()
   */
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(`Payments Microservice running on port ${envs.port}`);
}
bootstrap();
