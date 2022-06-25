/* eslint-disable @typescript-eslint/no-unused-vars */
import { Get, JsonController, QueryParam, QueryParams } from 'routing-controllers';
import type {
  /*commonResponse,*/ getQueryParams1Request,
  IParam2 as otherParam,
} from '../types/types';

export type commonResponse = { a3: string };

/**
 * Test3Controller 注释
 * 注释3
 * @注释3
 */
@JsonController()
export default class Test3Controller {
  @Get('/getQueryParams1-v3')
  getQueryParams1(@QueryParams() data: getQueryParams1Request): commonResponse {
    return { a3: '1' };
  }

  @Get('/getQueryParam-v3/:id')
  getQueryParam(
    @QueryParam('queryParam1', { required: true }) queryParam1: number,
    @QueryParam('queryParam2') queryParam2: number | string,
    @QueryParam('queryParam3') queryParam3: number[] = [1, 2],
    @QueryParam('queryParam4') queryParam4: (number | string)[],
    @QueryParam('queryParam5') queryParam5: (number | boolean)[],
    @QueryParam('queryParam6') queryParam6: any,
    @QueryParam('queryParam7') queryParam7: never,
    @QueryParam('queryParam8') queryParam8?: otherParam,
    @QueryParam('queryParam9') queryParam9?: { a: string; b: string },
    @QueryParam('queryParam10') queryParam10?: '1' | '2' | 3 | true,
  ): Promise<{ a33: string }> {
    return Promise.resolve({ a33: '1' });
  }
}
