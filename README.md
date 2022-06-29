# routing-controllers to openapi 生成工具
- routing-controllers 生成 openapi v3文件。


## 安装:
```bash
yarn add @liangskyli/routing-controllers-openapi --dev
```

# 生成方式:
## 1、CLI 命令方式（推荐）

```bash
yarn gen-openapi -c ./config.cli.ts
```

- 注意：如果项目里tsconfig.json，module不是CommonJS，则要求配置ts-node节点

```json
{
  "ts-node": {
    "compilerOptions": {
      "allowJs": false,
      "module": "CommonJS"
    }
  }
}
```

### 命令参数

| 参数               | 说明                           | 默认值 |
|------------------|------------------------------|-----|
| -c, --configFile | openapi v3文件生成配置文件 `配置参数见下面` |     |


### 命令参数 configFile openapi生成配置文件参数属性

| 属性                   | 说明                                                                                                                                                      | 默认值                               |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| genOpenapiDir        | 生成openapi文件夹所在目录                                                                                                                                        | `./`                              |
| controllers          | routing-controllers 里的controllers目录                                                                                                                     |                                   |
| prettierOptions      | 生成文件格式化，默认取项目配置，该配置优先级更高，会合并覆盖项目prettier配置文件，如项目有prettier配置文件，这里无需配置，详情配置见 [prettier文档](https://github.com/prettier/prettier/blob/main/docs/options.md) |                                   |
| customOmitDecorators | 忽略警告提示的装饰器                                                                                                                                              | `Pick<DecoratorMetadata, 'name' \ | 'package'>[]`                        |
| title                | openapi文件里info=>title配置  `string`                                                                                                                       | 不设置，取项目package.json里name的值        |
| routePrefix          | 全局路由前缀  `string`                                                                                                                                        |                                   |
| compilerOptions      | ts编译参数  `TJS.CompilerOptions`                                                                                                                           | `undefined`                       |
| servers              | openapi文件里servers配置  `ServerObject[]`                                                                                                                   | `undefined`                       |
| responseSchema       | openapi文件里responses响应数据包裹格式  `ResponseSchema`                                                                                                           | `undefined`                       |
| genOpenapiType       | openapi文件生成格式  `json｜yaml`                                                                                                                              | `json`                            |
| typeUniqueNames      | 生成类型使用唯一名称  `boolean`                                                                                                                                   | `true`                            |

- configFile openapi生成配置文件示例

```ts
import type { IGenOpenapiDataOpts } from '@liangskyli/routing-controllers-openapi';

const config: IGenOpenapiDataOpts = {
  genOpenapiDir: './test/gen-openapi-dir',
  controllers: ['./test/controller/**/*.ts'],
  routePrefix: '/root', 
  // genOpenapiType: 'yaml',
  // 自定义统一 response 返回结构（可选）
  responseSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        description: '接口返回code码字段',
      },
      data: '#ResponseSchema',
      msg: {
        type: 'string',
        description: '接口返回信息字段',
      },
    },
    required: ['code', 'data'],
  },
};
export default config;
```

# 生成openapi文件结构指引

genOpenapiDir下生成的目录结构如下（文件都在openapi文件夹下）：

```bash
.
├── openapi // 文件夹
     ├── openapi-v3.json // openapi v3 json文件
     └── openapi-v3.yaml // openapi v3 yaml文件
```

## 2、方法调用方式

### genOpenapiData函数参数
- 和命令参数configFile属性一致，见上面说明（命令参数 configFile openapi生成配置文件参数属性）。
- 使用例子

```ts
import genOpenapiData from '@liangskyli/routing-controllers-openapi';

genOpenapiData({
    title: 'custom title',
    genOpenapiDir: './test/gen-openapi-dir',
    controllers: ['./test/controller/**/*.ts'],
    routePrefix: '/root',
    //genOpenapiType: 'yaml',
    // 自定义统一 response 返回结构（可选）
    responseSchema: {
        type: 'object',
        properties: {
            code: {
                type: 'number',
                description: '接口返回code码字段',
            },
            data: '#ResponseSchema',
            msg: {
                type: 'string',
                description: '接口返回信息字段',
            },
        },
        required: ['code', 'data'],
    },
}).then();

```

# routing-controllers 支持项说明
- 支持的装饰器支持（其它装饰器不处理，会警告提示）
    - @JsonController
    - @Controller
    - @Body
    - @BodyParam
    - @CookieParam
    - @CookieParams
    - @Get
    - @HeaderParam
    - @HeaderParams
    - @Param
    - @Post
    - @QueryParam
    - @QueryParams
    - @Put
    - @Delete
    - @Options
    - @Head
    - @Patch
    - @UploadedFile
    - @UploadedFiles
- 方法需要明确指定入参和返回类型，目前不会对方法返回类型类型进行推导(如下例子)
- 支持所有的TS类型声明,含namespace的支持（any,never类型会忽略）

```ts
@JsonController('/v1')
export default class Test1Controller {
  @Get('/getQueryParams1')
  getQueryParams1(@QueryParams() data: getQueryParams1Request): commonResponse {
    return {a: '1'};
  }

  @Get('/getQueryParam-v2/:id')
  getQueryParamV2(
    @QueryParam('queryParam1', {required: true}) queryParam1: number,
    @QueryParam('queryParam2') queryParam2: number | string,
    @QueryParam('queryParam3') queryParam3: number[],
    @QueryParam('queryParam4') queryParam4: (number | string)[],
    @QueryParam('queryParam5') queryParam5: (number | string)[],
    @QueryParam('queryParam6') queryParam6: any,
    @QueryParam('queryParam7') queryParam7: never,
    @QueryParam('queryParam8') queryParam8: IParam2,
  ): Promise<commonResponse> {
    return Promise.resolve({a: '1'});
  }
}

```

- 默认忽略警告提示的装饰器（不会警告提示）
    - @UseBefore
    - @UseAfter
    - @Ctx
- 使用customOmitDecorators配置忽略警告提示的装饰器
