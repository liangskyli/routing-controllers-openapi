/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  BodyParam,
  Get,
  JsonController,
  Param,
  Post,
  QueryParam,
  QueryParams,
} from 'routing-controllers';
import type { commonResponse, getQueryParams1Request, IParam1, IParam2 } from '../types/types';

/*export interface getQueryParams1Request {
  /!** 注释getQueryParams1Request *!/
  param1: string;
}*/

/**
 * Test2Controller 注释
 * 注释2
 * @注释2
 */
@JsonController('/v2')
export default class Test2Controller {
  @Get('/getQueryParams1-v2')
  getQueryParams1(@QueryParams() data: getQueryParams1Request): commonResponse {
    return { a: '1' };
  }

  @Get('/getQueryParam-v2/:id')
  getQueryParam(
    @QueryParam('queryParam1', { required: true }) queryParam1: number,
    @QueryParam('queryParam2') queryParam2: number | string,
    @QueryParam('queryParam3') queryParam3: number[],
    @QueryParam('queryParam4') queryParam4: (number | string)[],
    @QueryParam('queryParam5') queryParam5: (number | string)[],
    @QueryParam('queryParam6') queryParam6: any,
    @QueryParam('queryParam7') queryParam7: never,
    @QueryParam('queryParam8') queryParam8: IParam2,
  ): Promise<commonResponse> {
    return Promise.resolve({ a: '1' });
  }
}
