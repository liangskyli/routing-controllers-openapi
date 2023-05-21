/* eslint-disable @typescript-eslint/no-unused-vars */
import { BodyParam, JsonController, Post } from 'routing-controllers';
import type { BodyParam1, IParam2 } from '../../types/types';

/**
 * Test2Controller 注释2
 */
@JsonController('/v2')
export default class Test3Controller {
  @Post('/postBody1-v3')
  postBody1(
    @BodyParam('BodyParam1') BodyParam1: BodyParam1,
    @BodyParam('BodyParam1') BodyParam2: IParam2,
  ): string {
    return 'string';
  }
}
