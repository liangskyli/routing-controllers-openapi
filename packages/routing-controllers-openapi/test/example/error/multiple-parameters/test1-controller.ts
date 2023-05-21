/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, JsonController, Post } from 'routing-controllers';
import type * as types from '../../types/types-2';

/**
 * Test2Controller 注释2
 */
@JsonController('/v2')
export default class Test3Controller {
  @Post('/postBody1-v3')
  postBody1(
    @Body() body1: types.proto.LockRequest,
    @Body() body2: types.proto.LockRequest,
  ): string {
    return 'string';
  }
}
