/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  Patch,
  Post,
  Put,
  QueryParam,
  QueryParams,
  UploadedFile,
  UploadedFiles,
} from 'routing-controllers';
import type { getQueryParams1Request } from '../types/types';
import type * as types from '../types/types-2';

/**
 * Test3Controller 注释
 * 注释3
 * @注释3
 */
@Controller('/v4')
export default class Test4Controller {
  @Get('/getQueryParams1-v4')
  getQueryParams1V4(@QueryParams() data: getQueryParams1Request): string {
    return 'string';
  }

  @Get('/getNoQueryParams-v4')
  getNoQueryParamsV4(): string {
    return 'string';
  }

  @Post('/postBody1-v4')
  postBody1(
    @Body() body: types.proto.LockRequest,
    @QueryParam('queryParam1', { required: true }) queryParam1: number,
  ): string {
    return 'string';
  }

  @Post('/postBody2-v4')
  postBody2(
    @Body() body?: types.proto.LockRequest,
    @QueryParams() data?: getQueryParams1Request,
  ): string {
    return 'string';
  }

  @Head('/getQueryParams2-v4/:id')
  getQueryParams2V4(@QueryParams() data: getQueryParams1Request): string {
    return 'string';
  }

  @Patch('/getQueryParams3-v4')
  getQueryParams3V4(@QueryParams() data: getQueryParams1Request): string {
    return 'string';
  }

  @Post('/file')
  saveFile(@UploadedFile('fileName') file: any) {
    return 'string';
  }

  @Post('/files')
  saveFiles(@UploadedFiles('fileNames') files: any[]) {
    return 'string';
  }

  @Put('/Put')
  Put(@QueryParams() data: getQueryParams1Request): void {}

  @Delete('/Delete')
  Delete(@QueryParams() data: getQueryParams1Request) {
    return 'string';
  }
}
