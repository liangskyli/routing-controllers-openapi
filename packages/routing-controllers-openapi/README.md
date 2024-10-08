# routing-controllers to openapi 生成工具

<p>
  <a href="https://github.com/liangskyli/routing-controllers-openapi/releases">
    <img alt="preview badge" src="https://img.shields.io/github/v/release/liangskyli/routing-controllers-openapi">
  </a>
  <a href="https://www.npmjs.com/package/@liangskyli/routing-controllers-openapi">
   <img alt="preview badge" src="https://img.shields.io/npm/v/@liangskyli/routing-controllers-openapi?label=%40liangskyli%2Frouting-controllers-openapi">
  </a>
</p>

- routing-controllers 生成 openapi v3文件。

## 安装:
```bash
yarn add @liangskyli/routing-controllers-openapi --dev
```

如果项目没有安装prettier，需要安装prettier(^2.0.0 || ^3.0.0)
```bash
yarn add prettier --dev
```

# 生成方式:
## 1、CLI 命令方式（推荐）

- 默认配置文件在运行目录下openapi.config.ts文件

```bash
yarn gen-openapi
```

- 配置文件别名openapi.config2.ts

```bash
yarn gen-openapi -c ./openapi.config2.ts
```

### 命令参数

| 参数               | 说明                           | 默认值                 |
|------------------|------------------------------|---------------------|
| -c, --configFile | openapi v3文件生成配置文件 `配置参数见下面` | `openapi.config.ts` |

### 命令参数 configFile openapi生成配置文件参数属性

- 类型：IGenOpenapiDataOpts | IGenOpenapiDataOpts[]

### IGenOpenapiDataOpts 参数属性

| 属性                            | 说明                                                                                                                                                      | 默认值                        |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| genOpenapiDir                 | 生成openapi文件夹所在目录                                                                                                                                        | `./`                       |
| controllers                   | routing-controllers 里的controllers目录                                                                                                                     |                            |
| prettierOptions               | 生成文件格式化，默认取项目配置，该配置优先级更高，会合并覆盖项目prettier配置文件，如项目有prettier配置文件，这里无需配置，详情配置见 [prettier文档](https://github.com/prettier/prettier/blob/main/docs/options.md) |                            |
| routingControllersPackageName | routing-controllers包名设置，支持自定义二次封装修改包名                                                                                                                   | `routing-controllers`      |
| customOmitDecorators          | 忽略警告提示的装饰器                                                                                                                                              | `详见customOmitDecorators属性` |
| title                         | openapi文件里info=>title配置  `string`                                                                                                                       | 不设置，取项目package.json里name的值 |
| routePrefix                   | 全局路由前缀  `string`                                                                                                                                        |                            |
| compilerOptions               | ts编译参数  `TJS.CompilerOptions`                                                                                                                           | `undefined`                |
| servers                       | openapi文件里servers配置  `ServerObject[]`                                                                                                                   | `undefined`                |
| responseSchema                | openapi文件里responses响应数据包裹格式  `ResponseSchema`                                                                                                           | `undefined`                |
| genOpenapiType                | openapi文件生成格式  `json｜yaml`                                                                                                                              | `json`                     |
| typeUniqueNames               | 生成类型使用唯一名称  `boolean`                                                                                                                                   | `true`                     |


#### customOmitDecorators属性

| 属性      | 说明                                          | 默认值  |
|---------|---------------------------------------------|------|
| name    | Decorators名，空字符串适配所有Decorators名    `string` | `./` |
| package | 包名或路径前缀 `string`                            |      |

- configFile openapi生成配置文件示例
  - 配置文件支持使用defineConfig定义ts类型

```ts
import { defineConfig } from '@liangskyli/routing-controllers-openapi';

export default defineConfig({
  genOpenapiDir: './test/all-gen-dirs/gen-openapi-cli-1',
  controllers: ['./test/example/controller*/**/*.ts'],
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
});
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
    genOpenapiDir: './test/all-gen-dirs/gen-openapi-cli-1',
    controllers: ['./test/example/controller*/**/*.ts'],
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
- 支持的装饰器（其它装饰器不处理）
  - @Body
  - @BodyParam
  - @Controller
  - @CookieParam
  - @CookieParams
  - @Delete
  - @Get
  - @Head
  - @HeaderParam
  - @HeaderParams
  - @JsonController
  - @Param
  - @Params
  - @Patch
  - @Post
  - @Put
  - @QueryParam
  - @QueryParams
  - @UploadedFile
  - @UploadedFiles
- 目前不支持的装饰器支持（会警告提示）
  - @All
  - @Authorized
  - @ContentType
  - @HttpCode
  - @Location
  - @Method
  - @OnNull
  - @OnUndefined
  - @Redirect
  - @Render
  - @Req
  - @Res
  - @ResponseClassTransformOptions
- 默认忽略警告提示的装饰器（不会警告提示）
  - @Ctx
  - @CurrentUser
  - @Interceptor
  - @Header
  - @Middleware
  - @Session
  - @SessionParam
  - @State
  - @UseAfter
  - @UseBefore
  - @UseInterceptor
- 使用customOmitDecorators配置忽略警告提示的装饰器
- 方法需要明确指定入参和返回类型，目前不会对方法返回类型类型进行推导(如下例子)
  - 类型文件里，同一个文件导出的类型定义名（含命名空间）唯一。请规范声明,不规范的，不生成，警告提示
- 支持所有的TS类型声明,含namespace的支持（any,never类型会忽略）

# routing-controllers示例
- [示例](./test/example)
