/**
 * `@baidu-cloud-ai-search/dsh-web-search-baidu`: registers a Baidu-backed `WebSearchProvider`
 * with `ctx.web`. A function/namespace plugin (NOT a default-export service):
 * a search provider does not own the `ctx.web` key — it registers INTO the
 * seam's provider registry. The key is owned by `@deepseek-ai/dsh-web`.
 *
 * @module @baidu-cloud-ai-search/dsh-web-search-baidu
 */

import type { Context } from '@deepseek-ai/cordis'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import z from '@deepseek-ai/schemastery'
import type { } from '@deepseek-ai/dsh-web'
import { BaiduSearchProvider, BAIDU_DEFAULT_BASE_URL } from './provider.js'

export {
    BAIDU_DEFAULT_BASE_URL,
    BAIDU_PROVIDER_ID,
    BaiduSearchProvider,
} from './provider.js'
export type { BaiduSearchProviderOptions } from './provider.js'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-baidu'

/** The web seam this provider registers into. */
export const inject = ['web']

/** Plugin config (all optional — `apply` fills env-var and constant defaults). */
export interface Config {
    /** Baidu API key. Falls back to `$BAIDU_API_KEY`. Empty → provider unavailable. */
    apiKey?: string
    /** Endpoint the search request is POSTed to. Defaults to the built-in URL. */
    baseURL?: string
    /** Default result count when a request carries no `maxResults`. Omitted = none. */
    numResults?: number
}

export const Config: z<Config> = z.object({
    apiKey: z.string(),
    baseURL: z.string(),
    numResults: z.number().step(1).min(1),
})

/**
 * Register the Baidu search provider with `ctx.web`.
 *
 * @param ctx - the Cordis context providing the injected `web` service.
 * @param config - validated plugin configuration.
 */
export function apply(ctx: Context, config: Config): void {
    ctx.web.registerSearchProvider(new BaiduSearchProvider({
        apiKey: config.apiKey ?? launchEnvironmentOf(ctx).get('BAIDU_API_KEY')?.value ?? '',
        baseURL: config.baseURL ?? BAIDU_DEFAULT_BASE_URL,
        ...config.numResults !== undefined ? { numResults: config.numResults } : {},
    }))
}
