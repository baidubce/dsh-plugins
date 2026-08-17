/**
 * `BaiduSearchProvider`: a `WebSearchProvider` backed by Baidu's "百度搜索"
 * endpoint (`POST /v2/ai_search/web_search` on `qianfan.baidubce.com`). It
 * maps each `references[]` entry to the seam's normalized `WebSearchSource`,
 * drops entries without a URL, and surfaces failures as `WebError`. HTTP
 * redirects fail (`redirect: 'error'`) so the API key is never forwarded to
 * another origin.
 * @module @baidu-cloud-ai-search/dsh-web-search-baidu/provider
 */

import { createRequire } from 'node:module'

import { WebError } from '@deepseek-ai/dsh-web'
import type {
    WebSearchProvider,
    WebSearchRequest,
    WebSearchResult,
    WebSearchSource,
} from '@deepseek-ai/dsh-web'
import type { BaiduReference, BaiduSearchResponse } from './types.js'

/** Stable id this provider registers under, unique within the search kind. */
export const BAIDU_PROVIDER_ID = 'baidu'

/** The Baidu "百度搜索" endpoint (`POST /v2/ai_search/web_search`). */
export const BAIDU_DEFAULT_BASE_URL = 'https://qianfan.baidubce.com/v2/ai_search/web_search'

/** Backend cap on `resource_type_filter[].top_k` for the `web` modality. */
const BAIDU_MAX_TOP_K = 50

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

/** Attribution header sent on every request; version is read from `package.json`. */
const USER_AGENT = `dsh-web-search-baidu/${version}`

/** Resolved provider options (the plugin's `apply` supplies env-var and constant defaults). */
export interface BaiduSearchProviderOptions {
    /** Baidu API key. Empty/absent makes the provider unavailable. */
    apiKey: string
    /** Endpoint URL the search request is POSTed to. */
    baseURL: string
    /** Default result count when a request carries no `maxResults`. */
    numResults?: number
}

/**
 * Map one Baidu reference to a normalized source. Every source needs a URL;
 * the seam tolerates a missing `title`/`snippet`, so they pass through as-is.
 *
 * @param reference - one entry of the Baidu response `references[]`.
 * @returns the normalized source.
 */
export function mapBaiduReference(reference: BaiduReference): WebSearchSource {
    return {
        url: reference.url,
        ...reference.title != null && reference.title.length > 0 ? { title: reference.title } : {},
        ...reference.snippet != null && reference.snippet.length > 0 ? { snippet: reference.snippet } : {},
        ...reference.date != null && reference.date.length > 0 ? { publishedAt: reference.date } : {},
    }
}

/**
 * Map a Baidu response envelope to a normalized search result. Entries
 * without a URL are dropped. The web service owns the final `maxResults`
 * truncation, so this provider reports `truncated: false`.
 *
 * @param response - the parsed search response body.
 * @returns the normalized result.
 */
export function mapBaiduResponse(response: BaiduSearchResponse): WebSearchResult {
    const sources = (response.references ?? [])
        .filter((reference): reference is BaiduReference => reference.url.length > 0)
        .map(mapBaiduReference)
    return { sources, truncated: false }
}

/** The Baidu-backed search provider; HTTP redirects fail as `WEB_PROVIDER_ERROR`. */
export class BaiduSearchProvider implements WebSearchProvider {
    readonly id = BAIDU_PROVIDER_ID

    constructor(private readonly options: BaiduSearchProviderOptions) { }

    available(): boolean {
        return this.options.apiKey.length > 0
            && URL.canParse(this.options.baseURL)
            && (this.options.numResults === undefined || isPositiveInteger(this.options.numResults))
    }

    async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
        // A per-request bound wins over the configured default; either may be absent.
        const numResults = request.maxResults ?? this.options.numResults
        let response: Response
        try {
            response = await fetch(this.options.baseURL, {
                method: 'POST',
                redirect: 'error',
                headers: {
                    'authorization': `Bearer ${this.options.apiKey}`,
                    'content-type': 'application/json',
                    'accept': 'application/json',
                    'user-agent': USER_AGENT,
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: request.query }],
                    search_source: 'baidu_search_v2',
                    // Always requested: filters unsafe/adult content from results.
                    safe_search: true,
                    ...numResults !== undefined
                        ? { resource_type_filter: [{ type: 'web', top_k: Math.min(numResults, BAIDU_MAX_TOP_K) }] }
                        : {},
                }),
                ...signal !== undefined ? { signal } : {},
            })
        } catch (error: unknown) {
            if (isAbortError(error)) throw new WebError('Baidu search aborted', 'WEB_ABORTED', { cause: error })
            throw new WebError(`Baidu search request failed: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error })
        }

        if (!response.ok) {
            const status = response.status
            let message = `Baidu API error (HTTP ${status})`
            try {
                const parsed = await response.json() as BaiduSearchResponse
                if (parsed.message !== undefined && parsed.message.length > 0) message = parsed.message
            } catch (error: unknown) {
                // A mid-body abort must surface as WEB_ABORTED, not a generic HTTP error.
                if (isAbortError(error)) throw new WebError('Baidu search aborted', 'WEB_ABORTED', { cause: error })
                // Otherwise the HTTP status is already in `message`; a non-JSON error
                // body only costs a richer message, never the real error.
            }
            throw new WebError(message, 'WEB_PROVIDER_ERROR')
        }

        let payload: BaiduSearchResponse
        try {
            payload = await response.json() as BaiduSearchResponse
        } catch (error: unknown) {
            if (isAbortError(error)) throw new WebError('Baidu search aborted', 'WEB_ABORTED', { cause: error })
            throw new WebError(`Baidu returned an unprocessable response body: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error })
        }
        // A 200 response can still carry a `code`/`message` error envelope.
        if (payload.code !== undefined) {
            throw new WebError(payload.message ?? `Baidu API error (code ${payload.code})`, 'WEB_PROVIDER_ERROR')
        }
        return mapBaiduResponse(payload)
    }
}

/** True for a request limit that can be sent to Baidu (a positive whole number). */
function isPositiveInteger(value: number): boolean {
    return Number.isInteger(value) && value > 0
}

/** True for a fetch/`AbortSignal` abort, surfaced as `WEB_ABORTED`. */
function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError'
}

