/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Head, Patch, QueryParams } from 'routing-controllers';
import type { commonResponse, getQueryParams1Request } from '../types/types';

/**
 * Test3Controller 注释
 * 注释3
 * @注释3
 */
@Controller()
export default class Test4Controller {
  @Get('/getQueryParams1-v4')
  getQueryParams1V4(@QueryParams() data: getQueryParams1Request): commonResponse {
    return { a3: '1' } as any;
  }

  @Head('/getQueryParams2-v4/:id')
  getQueryParams2V4(@QueryParams() data: getQueryParams1Request): commonResponse {
    return { a3: '1' } as any;
  }

  @Patch('/getQueryParams3-v4')
  getQueryParams3V4(@QueryParams() data: getQueryParams1Request): commonResponse {
    return { a3: '1' } as any;
  }
}
