/* eslint-disable @typescript-eslint/no-unused-vars */
import { Get, JsonController, QueryParams } from 'routing-controllers';
import type {
  commonResponse,
  getQueryParams1Request as getQueryParams1RequestCustom,
} from '../../types/types';

export interface getQueryParams1Request {
  /** 注释getQueryParams1Request */
  param1: string;
}

/**
 * Test2Controller 注释2
 */
@JsonController('/v2')
export default class Test2Controller {
  @Get('/getQueryParams1-v2')
  getQueryParams1(
    @QueryParams() data: getQueryParams1RequestCustom,
  ): commonResponse {
    return { a: '1' };
  }
}
