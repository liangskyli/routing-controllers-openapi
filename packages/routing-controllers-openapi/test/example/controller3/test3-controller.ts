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
import type * as types1 from '../types/types';
import type {
  /*commonResponse,*/ commonResponse2,
  getQueryParams1Request,
  IParam2 as otherParam,
  recordTest,
} from '../types/types';
import type * as types2 from '../types/types-2';

export type commonResponse = {
  a3: string;
  b: commonResponse2;
  c: types2.commonResponse2;
};

/**
 * Test3Controller 注释3
 */
@JsonController()
export default class Test3Controller {
  @Get('/getQueryParams1-v3')
  getQueryParams1(@QueryParams() data: getQueryParams1Request): commonResponse {
    return { a3: '1' } as any;
  }

  @Get('/getQueryParam-v3/:id')
  getQueryParam(
    @Param('id') id: number,
    @QueryParam('queryParam1', { required: true }) queryParam1: number,
    @QueryParam('queryParam2') queryParam2: number | string,
    @QueryParam('queryParam3') queryParam3: number[] = [1, 2],
    @QueryParam('queryParam4') queryParam4: (number | string)[],
    @QueryParam('queryParam5') queryParam5: (number | boolean)[],
    @QueryParam('queryParam6') queryParam6: any,
    @QueryParam('queryParam7') queryParam7: never,
    @QueryParam('queryParam8') queryParam8?: otherParam,
    @QueryParam('queryParam9')
    queryParam9: { a: string; b: string; c: unknown; d?: never } = {
      a: 'a',
      b: 'b',
      c: 'c',
    },
    @QueryParam('queryParam10') queryParam10?: '1' | '2' | 3 | true,
    @QueryParam('queryParam11') queryParam11?: '1' | '2' | 3 | true | false,
    @QueryParam('queryParam12') queryParam12?: '1' | '2' | 3 | boolean,
    @QueryParam('queryParam13') queryParam13?: true | false,
    @QueryParam('queryParam14') queryParam14?: boolean,
    @QueryParam('queryParam15')
    queryParam15?: [otherParam, number, getQueryParams1Request][],
    @QueryParam('queryParam16') queryParam16?: '1' | '2' | '3',
    @QueryParam('queryParam17') queryParam17?: 1 | 2 | 3,
    @QueryParam('queryParam18') queryParam18?: [],
    @QueryParam('queryParam19')
    queryParam19?: { a: Record<string, string>; b: { [key: string]: string } },
    @QueryParam('queryParam20') queryParam20?: Record<any, any>,
    @QueryParam('queryParam21') queryParam21?: Record<any, never>,
    @QueryParam('queryParam22') queryParam22?: recordTest,
    @QueryParam('queryParam23') queryParam23?: Date,
    @QueryParam('queryParam24') queryParam24?: null,
    @QueryParam('queryParam25') queryParam25: string = 'queryParam25',
    @QueryParam('queryParam26') queryParam26: boolean = true,
    // @ts-ignore
    @QueryParam('queryParam27') queryParam27: boolean = false1,
    @QueryParam('queryParam28') queryParam28: never[] = [],
  ): Promise<{ a33: string }> {
    return Promise.resolve({ a33: '1' });
  }

  @Post('/postBody1-v3')
  postBody1(
    @BodyParam('body1') body1: types2.proto.LockRequest,
    @BodyParam('body2') body2: types2.InterFaceSameAll,
    @BodyParam('body3') body3: types2.InterfaceAndNamespaceSameAll,
  ): string {
    return 'string';
  }

  @Post('/postBody2-v3')
  postBody2(@Body() body: types1.CustomizeExportByFilterRequest): string {
    return 'string';
  }
}
