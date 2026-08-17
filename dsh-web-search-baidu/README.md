# @baidu-cloud-ai-search/dsh-web-search-baidu

English | [中文](README.zh.md)·

A Baidu-backed search provider for DeepSeek Harness's [web capability seam](https://github.com/deepseek-ai/deepseek-harness/blob/main/packages/web/web/README.md) (`ctx.web`).

[GitHub](https://github.com/baidubce/dsh-plugins/tree/main/dsh-web-search-baidu)

## Install

```sh
dsh plugin --profile web add @baidu-cloud-ai-search/dsh-web-search-baidu
```

This registers the provider into `ctx.web` and switches `searchProvider` to `baidu`.

## Get an API Key

Open [Baidu&#39;s Qianfan platform](https://console.bce.baidu.com/iam/#/iam/apikey/list) and enable the "百度搜索" (AI Search) service to get an API key, then set it as an environment variable:

```sh
export BAIDU_API_KEY='BAIDU_API_KEY'
```

`dsh` reads this environment variable automatically at startup. You can also pass it explicitly via `config.apiKey` at install time, but the environment variable is preferred so the key never ends up in a config file.

## Verify the install

```sh
dsh --profile web --dump-config

# == @baidu-cloud-ai-search/dsh-web-search-baidu
- id: web-search-baidu
  name: '@baidu-cloud-ai-search/dsh-web-search-baidu'
```

## Run

```sh
dsh --profile web
```

## Uninstall

```sh
dsh plugin --profile web remove @baidu-cloud-ai-search/dsh-web-search-baidu
```
