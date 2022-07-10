/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Head,
  Patch,
  Post,
  QueryParam,
  QueryParams,
} from 'routing-controllers';
import type { commonResponse, getQueryParams1Request } from '../types/types';
import type * as types from '../types/types-2';

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

  @Post('/postBody1-v4')
  postBody1(
    @Body() body: types.proto.LockRequest,
    @QueryParam('queryParam1', { required: true }) queryParam1: number,
  ): commonResponse {
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
