/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  BodyParam,
  CookieParam,
  CookieParams,
  Get,
  HeaderParam,
  HeaderParams,
  JsonController,
  Param,
  Params,
  Post,
  QueryParam,
  QueryParams,
  UploadedFile,
} from 'routing-controllers';
import type {
  BodyParam1,
  IParam1,
  IParam2,
  IParam3,
  IParam4,
  Response1,
  commonResponse,
  commonResponse3,
  getQueryParams1Request,
  getUserRequest,
  postBody1,
} from '../types/types';

@JsonController('/v1')
export default class Test1Controller {
  @Get('/getQueryParams1')
  getQueryParams1(@QueryParams() data: getQueryParams1Request): commonResponse {
    return { a: '1' };
  }

  @Post('/getQueryParams1')
  postQueryParams1(@Body() data: getQueryParams1Request): commonResponse3 {
    return { a2: '1' };
  }

  @Get('/getQueryParams2')
  getQueryParams2(
    @QueryParams()
    data: {
      inlineQueryParam1: string;
      inlineQueryParam2: number | string;
      inlineQueryParam3: bigint;
      inlineQueryParam4: null;
      inlineQueryParam5: [string, boolean];
      inlineQueryParam6: [string, boolean][];
      inlineQueryParam7: [[string, boolean], number][];
    },
  ): commonResponse {
    return { a: '1' };
  }

  /** getQueryParam */
  @Get('/getQueryParam')
  getQueryParam(
    @QueryParam('queryParam1', { required: true }) queryParam1: IParam1,
    @QueryParam('queryParam2') queryParam2: IParam2,
    @QueryParam('queryParam3') queryParam3: IParam3,
    @QueryParam('queryParam4') queryParam4: IParam4,
    @QueryParam('queryParam5') queryParam5: number,
  ): commonResponse {
    return { a: '1' };
  }

  @Get('/getQueryParamWithQueryParams/:path1/:path2')
  getQueryParamWithQueryParams(
    @HeaderParams() headerParams: IParam2,
    @CookieParams() cookieParams: IParam2,
    @QueryParam('queryParam1') queryParam1: IParam1,
    @QueryParam('queryParam2') queryParam2: IParam2,

    @QueryParams() data: getQueryParams1Request,
    @Params() params: { path1: string; path2?: number },
  ): Response1 {
    return { a: '1' } as any;
  }

  @Get('/getParam')
  getParam(
    @HeaderParam('orgcode1') orgcode1: string,
    @HeaderParam('orgcode2') orgcode2: IParam3,
    @CookieParam('cookie1') cookie1: string,
    @Param('param1') param1: IParam1,
    @Param('param2') param2: IParam2,
    @Param('param3') param3: IParam3,
    @Param('param4') param4: IParam4,
    @Param('param5') param5: number,
    @Param('param6') param6: getUserRequest,
  ): commonResponse {
    return { a: '1' };
  }

  @Get('/getQueryParamWithParam')
  getQueryParamWithParam(
    @QueryParam('queryParam1') queryParam1: IParam1,
    @QueryParam('queryParam2') queryParam2: IParam2,

    @Param('param1') param1: IParam1,
    @Param('param2') param2: IParam2,
    @Param('param3') param3: IParam3,
    @Param('param4') param4: IParam4,
    @Param('param5') param5: number,
    @Param('param6') param6: getUserRequest,
  ): Response1 {
    return { a: '1' } as any;
  }

  @Post('/postBody1')
  postBody1(
    @Body() body: postBody1,
    @QueryParam('queryParam1') queryParam1: IParam1,
  ): commonResponse {
    return { a: '1' };
  }

  @Post('/postBody2')
  postBody2(@Body() body: IParam2): commonResponse {
    return { a: '1' };
  }

  @Post('/postBody3')
  postBody3(@Body() body: IParam3): commonResponse {
    return { a: '1' };
  }

  @Post('/postBody4')
  postBody4(@Body() body: getQueryParams1Request): commonResponse | Response1 {
    return { a: '1' };
  }

  @Post('/postBody5')
  postBody5(
    @Body() body: { inlineBody1: string; inlineBody2?: number },
    @UploadedFile('fileName') file: any,
  ): commonResponse | Response1 {
    return { a: '1' };
  }

  @Post('/postBodyParam')
  postBodyParam(
    @BodyParam('BodyParam1') BodyParam1: BodyParam1,
    @BodyParam('BodyParam2') BodyParam2: IParam2,
    @BodyParam('BodyParam3') BodyParam3: IParam3,
    @BodyParam('BodyParam4') BodyParam4: IParam4,
    @BodyParam('BodyParam5', { required: true }) BodyParam5: number,
    @BodyParam('BodyParam6') BodyParam6: getUserRequest,
  ): Promise<commonResponse & Response1> {
    return Promise.resolve({ a: '1' }) as any;
  }
}
