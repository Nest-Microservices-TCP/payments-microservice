import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import * as bodyParser from 'body-parser';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [NatsModule],
})
export class PaymentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    console.log('Entra al middleware');

    consumer
      .apply(
        bodyParser.json({
          verify: function (req, buf) {
            req['rawBody'] = buf;
          },
        }),
      )
      .forRoutes({ path: '/payments/webhook', method: RequestMethod.POST });
  }
}
