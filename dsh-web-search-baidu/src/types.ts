/**
 * Wire types for the Baidu search backend (`POST /v2/ai_search/web_search`
 * on `qianfan.baidubce.com`). This file contains only types (no runtime
 * code); `provider.ts` maps these to the seam's `WebSearchResult`.
 * @module @baidu-cloud-ai-search/dsh-web-search-baidu/types
 */

/** One message in the request `messages` array. */
export interface BaiduMessage {
    readonly role: 'user' | 'assistant'
    /** The query text. Non-empty; truncated to the first 72 characters by the backend. */
    readonly content: string
}

/** One `resource_type_filter` entry selecting a result modality and its cap. */
export interface BaiduResourceTypeFilter {
    readonly type: 'web' | 'video' | 'image' | 'aladdin'
    /** Maximum results for this modality (web: 50, video: 10, image: 30, aladdin: 5). */
    readonly top_k: number
}

/** The `POST /v2/ai_search/web_search` request body. */
export interface BaiduSearchRequest {
    readonly messages: readonly BaiduMessage[]
    /** Fixed value identifying the search engine version. */
    readonly search_source?: 'baidu_search_v2'
    readonly resource_type_filter?: readonly BaiduResourceTypeFilter[]
    /** Filters unsafe/adult content from results. */
    readonly safe_search?: boolean
}

/** One entry of the response `references` list — a single search result. */
export interface BaiduReference {
    /** Reference number (1, 2, 3, ...). */
    readonly id: number
    readonly title?: string
    readonly url: string
    /** Result modality. */
    readonly type?: 'web' | 'image' | 'video' | 'aladdin'
    readonly snippet?: string
    /** Publication date, if the backend supplies one. */
    readonly date?: string
}

/**
 * The parsed `POST /v2/ai_search/web_search` response body. A successful
 * response carries `request_id`/`references`; an error response carries
 * `code`/`message` instead — `code` is a numeric platform error code (e.g.
 * an auth failure) or a string error identifier (e.g. `InvalidArgument`),
 * and the request-id field name itself varies (`request_id`/`requestId`).
 */
export interface BaiduSearchResponse {
    readonly request_id?: string
    readonly requestId?: string
    /** Error code, present only when the request failed. */
    readonly code?: number | string
    /** Error message, present only when the request failed. */
    readonly message?: string
    readonly references?: readonly BaiduReference[]
}
