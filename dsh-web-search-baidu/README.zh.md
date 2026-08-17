# @baidu-cloud-ai-search/dsh-web-search-baidu

[English](README.md) | 中文

百度搜索接入 DeepSeek Harness 的 [web 能力接缝](https://github.com/deepseek-ai/deepseek-harness/blob/main/packages/web/web/README.md)（`ctx.web`）的搜索 provider。

[GitHub](https://github.com/baidubce/dsh-plugins/tree/main/dsh-web-search-baidu)

## 安装

```sh
dsh plugin --profile web add @baidu-cloud-ai-search/dsh-web-search-baidu
```

会自动把该 provider 注册进 `ctx.web`，并把 `searchProvider` 切换成 `baidu`。

## 获取 API Key

到[百度千帆平台](https://console.bce.baidu.com/iam/#/iam/apikey/list)开通"百度搜索"（AI Search）服务，获取 API Key，然后设置环境变量：

```sh
export BAIDU_API_KEY='BAIDU_API_KEY'
```

启动 `dsh` 时会自动读取这个环境变量；也可以在安装时通过 `config.apiKey` 手动指定,但推荐用环境变量,避免密钥写进配置文件。

## 检查是否安装成功

```sh
dsh --profile web --dump-config

# == @baidu-cloud-ai-search/dsh-web-search-baidu
- id: web-search-baidu
  name: '@baidu-cloud-ai-search/dsh-web-search-baidu'
```

## 启动命令

```sh
dsh --profile web
```

## 卸载

```sh
dsh plugin --profile web remove @baidu-cloud-ai-search/dsh-web-search-baidu
```
