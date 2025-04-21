# 微喇模拟数据文档

该 mock 文件夹包含用于测试的模拟数据文档。仅用于测试目的。

## 用途

通过脚本分析此文档，生成模拟 api 接口

## Why?

直接使用后端文档实例中的数据，不再手动创建 mock api

## 涉及文件

- 输入：`fixtures/mock/weila.md`
  - 后端提供的 api 文档 
- 输出：`generated/mock/weila.ts`

## 步骤

1. 准备输入文件：
  1. 进入后端提供的 [api web 文档](https://console-docs.apipost.cn/preview/e49c2c009c9f16ad/4e486019837ac4ae) 点击“导出文档”，生成 markdown 文件
  2. 将 markdown 文件放入 mock 文件夹，需重命名为 `weila.md`
2. 输出 mock api 文件：运行 `npm run api`

即可生成文件 `generated/mock/weila.ts` ，并提供给 `vite-plugin-mock` 使用

## TODO

1. 支持更多 api 模板
2. 将脚本封装为 cli 工具
3. 监听 fixtures 文件夹，提高自动化程度
