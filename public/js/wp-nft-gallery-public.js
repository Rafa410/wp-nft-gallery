const { __, _x, _n, _nx, sprintf } = wp.i18n;

const mountEl = document.querySelector('#nft-gallery');

const objktCurrencies = {
    1: 'tezos',
};

const mime_map = {
    // AUDIO
    audio: 'audio',
    'audio/mpeg': 'audio',
    'audio/ogg': 'audio',
    'audio/wav': 'Audio',

    // IMAGE
    image: 'image',
    'image/jpeg': 'image',
    'image/png': 'image',

    // GIF
    'image/gif': 'gif',

    // SVG
    'image/svg+xml': 'svg',

    // VIDEO
    video: 'video',
    'video/mp4': 'video',
    'video/webm': 'video',
    'video/ogg': 'video',
    'video/quicktime': 'video',

    // PDF
    'application/pdf': 'pdf',

    // TEXT
    text: 'text',
    'text/plain': 'text',
    'text/markdown': 'text',

    // MODEL
    model: 'model',
    'model/gltf-binary': 'model',

    // INTERACTIVE
    interactive: 'interactive',
    'application/x-directory': 'interactive',
};

const DateFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
};

/**
 * Vue filter to format a timestamp
 */
Vue.filter('formatDate', function (value) {
    if (value) {
        return new Date(value).toLocaleDateString('en-UK', DateFormatOptions);
    }
});

/**
 * Root component for the Vue Router
 */
const RouterView = {
    // Bind props from CreateComponent context (pageId)
    props: ['pageId'],
    template: '<router-view :page-id="pageId"></router-view>',
};

/**
 * Single page template for a gallery item
 */
const SingleToken = {
    props: {
        pageId: {
            type: String | Number,
            required: true,
        },
        author: {
            type: String,
            required: false,
        },
        token_slug: {
            type: String,
            required: false,
        },
        listing_id: {
            type: String | Number,
            required: false,
        },
        collection_id: {
            type: String | Number,
            required: false,
        },
        token_id: {
            type: String | Number,
            required: false,
        },
    },

    data() {
        return {
            item: {},
            isLoading: true,
            isImgLoading: true,
            ipfs_url: 'https://ipfs.io/ipfs/',
            imgProps: {
                center: true,
                fluidGrow: true,
                blank: true,
                blankColor: '#111',
            },
        };
    },

    computed: {
        objktEndpoint() {
            return nftGallerySettings.objkt_endpoint;
        },
        thumbnail_url() {
            // return `https://source.unsplash.com/random/7200x7200/?nft&sig=${this.item.token?.token_id}`;
            return (
                this.ipfs_url +
                (this.item.token?.thumbnail_uri.split('/').pop() ||
                    this.item.thumbnail_uri.split('/').pop())
            );
        },
        token_link() {
            return (
                '//objkt.com/asset/' +
                (this.item.token?.fa_contract || this.item.fa_contract) +
                '/' +
                (this.item.token?.token_id || this.item.token_id)
            );
        },
    },

    methods: {
        /**
         * Load the item from the specified marketplace API
         *
         * @param {string} [marketplace=Objkt] - The marketplace to load item from
         *
         */
        async getItem(marketplace = 'Objkt') {
            let item = {};
            switch (marketplace) {
                case 'Objkt':
                    if (this.listing_id) {
                        item = await this.getItemFromObjktByListingId(this.listing_id);
                    } else if (this.collection_id && this.token_id) {
                        item = await this.getItemFromObjktByTokenId(
                            this.collection_id,
                            this.token_id
                        );
                    } else {
                        console.warn('No listing_id or token_id provided');
                    }
                    break;
                default:
                    console.warn(`Selected marketplace "${marketplace}" not supported`);
                    break;
            }
            return item;
        },

        /**
         * Load the item from the Objkt GraphQL API by listing ID
         *
         */
        async getItemFromObjktByListingId(listingId) {
            const query = `query GetToken($listingId: bigint!, $alias: String!) {
                listing(
                    where: {
                        id: { _eq: $listingId }
                        token: { creators: { holder: { alias: { _eq: $alias } } } },
                    },
                ) {
                    id
                    amount_left
                    currency_id
                    price
                    fa_contract
                    token {
                        token_id
                        name
                        description
                        supply
                        timestamp
                        thumbnail_uri
                        artifact_uri
                        mime
                        tags {
                            tag { name }
                        }
                        creators {
                            holder { alias }
                        }
                    }
                }
            }`;

            const response = await fetch(this.objktEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { listingId, alias: this.author },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.debug('Objkt data: ', data);
                return this.filterDuplicateObjktTokens(data.data.listing);
            } else {
                console.error('Error fetching item from Objkt API');
                return [];
            }
        },

        /**
         * Load the item from the Objkt GraphQL API by token ID
         *
         */
        async getItemFromObjktByTokenId(collectionId, tokenId) {
            const query = `query GetToken($collectionId: String!, $tokenId: String!) {
                token(where: {
                    fa_contract: { _eq: $collectionId },
                    token_id: {_eq: $tokenId }
                }, limit: 1) {
                    fa_contract
                    token_id
                    name
                    description
                    supply
                    timestamp
                    thumbnail_uri
                    artifact_uri
                    mime
                    tags {
                    tag {
                        name
                    }
                    }
                    creators {
                    holder {
                        alias
                    }
                    }
                }
            }`;

            const response = await fetch(this.objktEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { collectionId, tokenId },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.debug('Objkt data: ', data);
                return data.data.token[0];
                // return this.filterDuplicateObjktTokens(data.data.listing);
            } else {
                console.error('Error fetching item from Objkt API');
                return [];
            }
        },

        /**
         * Find duplicate tokens and leave the one with the lowest price
         *
         * @param {Array} listing - The listing of tokens from the Objkt API
         * @returns {Object} - The filtered item
         */
        filterDuplicateObjktTokens(listing) {
            return listing.reduce((prev, current) => {
                return prev.price < current.price ? prev : current;
            });
        },

        onLoad($event) {
            console.log('isImgLoading: ', this.isImgLoading);
            console.log('image loaded', $event);
            this.isImgLoading = false;
            this.refreshScrolltrigger();
        },

        refreshScrolltrigger() {
            console.log('refresh scrolltrigger', window.ScrollTrigger);
            window.ScrollTrigger.refresh();
        },
    },

    async created() {
        this.item = await this.getItem();
        this.isLoading = false;
    },

    template: `
        <div v-if="Object.keys(item).length > 0" class="nft-gallery-single-wrapper container">
            <div class="row">
                <div class="col-md-5">
                    <div class="single-token__image">
                        <div v-if="isImgLoading" class="position-absolute w-100 h-100">
                            <b-skeleton-img animation="fade" aspect="1:1"></b-skeleton-img>
                            <b-skeleton-img aspect="1:1"></b-skeleton-img>
                        </div>
                        <b-img-lazy v-bind="imgProps" :src="thumbnail_url" :alt="item.token?.name" @load.native="onLoad"></b-img-lazy>
                    </div>
                </div>
                <div class="col-md-7">
                    <h1 class="single-token__title">{{ item.token?.name || item.name }}</h1>
                    <p class="single-token__author">{{ __( 'by', 'nft-gallery' ) }} {{ author || item.creators[0]?.holder.alias }}</p>
                    <p class="single-token__timestamp">{{ (item.token?.timestamp || item.timestamp) | formatDate }}</p>
                    <p class="single-token__description">{{ item.token?.description || item.description }}</p>
                    <div class="single-token__purchase_info">
                        <span class="single-token__price">{{ item.price }}</span>
                        <span class="single-token__amount_left small">{{ item.supply }}x</span>
                    </div>
                    <a :href="token_link" target="_blank" rel="noopener noreferrer" class="single-token__link btn btn-lg btn-light-glitched text-uppercase my-3">
                        Purchase
                    </a>
                </div>
            </div>
        </div>
    `,
    beforeRouteUpdate(to, from, next) {
        console.log('beforeRouteUpdate', to, from);
        // react to route changes...
        next();
    },
};

/**
 * Root component for the NFT Gallery
 */
const NftGallery = {
    emits: ['select-item'],
    props: {
        pageId: {
            type: String | Number,
            required: true,
        },
    },

    data() {
        return {
            summary: nftGallerySettings.summary,
            items: [],
            isLoading: true,
            ipfs_url: 'https://ipfs.io/ipfs/',
        };
    },

    computed: {
        siteUrl() {
            return nftGallerySettings.site_url;
        },
        wpApiUrl() {
            return nftGallerySettings.wp_api_url;
        },
        objktEndpoint() {
            return nftGallerySettings.objkt_endpoint;
        },
        objktAlias() {
            return nftGallerySettings.objkt_alias;
        },
        objktCollectionId() {
            return nftGallerySettings.objkt_collection_id;
        },
    },

    methods: {
        /**
         * Load the items from the specified marketplace API
         *
         * @param {string} [marketplace=Objkt] - The marketplace to load items from
         *
         */
        async getItems(marketplace = 'Objkt') {
            let items = [];
            switch (marketplace) {
                case 'Objkt':
                    console.log(this.objktAlias);
                    console.log(this.objktCollectionId);
                    if (this.objktAlias) {
                        items = await this.getItemsFromObjktByAlias(this.objktAlias);
                    } else if (this.objktCollectionId) {
                        items = await this.getItemsFromObjktByCollectionId(this.objktCollectionId);
                    } else {
                        console.warn('No alias or collection ID specified');
                    }
                    break;
                default:
                    console.warn(`Selected marketplace "${marketplace}" not supported`);
                    break;
            }
            return items;
        },

        /**
         * Load the items from the Objkt GraphQL API by Alias
         *
         */
        async getItemsFromObjktByAlias(alias) {
            console.debug('Objkt endpoint: ', this.objktEndpoint);
            console.debug('Objkt alias: ', alias);

            const query = `query GetTokens($alias: String!) {
                listing(
                    where: {
                        status: { _eq: "active" }, 
                        token: { creators: { holder: { alias: { _eq: $alias } } } },
                    },
                    order_by: { token: { timestamp: desc } }
                ) {
                    id
                    amount_left
                    currency_id
                    price
                    fa_contract
                    token {
                        token_id
                        name
                        description
                        supply
                        timestamp
                        thumbnail_uri
                        artifact_uri
                        mime
                        tags {
                            tag { name }
                        }
                        creators {
                            holder { alias }
                        }
                    }
                }
            }`;

            const response = await fetch(this.objktEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { alias },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.debug('Objkt data: ', data);
                return this.filterDuplicateObjktTokens(data.data.listing);
            } else {
                console.error('Error fetching items from Objkt API');
                return [];
            }
        },

        /**
         * Load the items from the Objkt GraphQL API by Collection ID
         *
         * @todo Check if token status is active
         *
         */
        async getItemsFromObjktByCollectionId(collectionId) {
            console.debug('Objkt endpoint: ', this.objktEndpoint);
            console.debug('Objkt collection ID: ', collectionId);

            const query = `query GetTokens($collectionId: String!) {
                token(where: {fa_contract: {_eq: $collectionId}}) {
                    fa_contract
                    token_id
                    name
                    description
                    supply
                    timestamp
                    thumbnail_uri
                    artifact_uri
                    mime
                    tags {
                        tag {
                            name
                        }
                    }
                    creators {
                        holder {
                            alias
                        }
                    }
                }
            }`;

            const response = await fetch(this.objktEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { collectionId },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.debug('Objkt data: ', data);
                console.log(data);
                return data.data.token;
                // return this.filterDuplicateObjktTokens(data.data.listing);
            } else {
                console.error('Error fetching items from Objkt API');
                return [];
            }
        },

        /**
         * Find duplicate tokens and leave the one with the lowest price
         *
         * @param {Array} listing - The listing of tokens from the Objkt API
         * @returns {Array} The filtered listing of tokens
         */
        filterDuplicateObjktTokens(listing) {
            const tokens = {};
            const filteredListing = [];
            listing.forEach((item) => {
                if (!tokens[item.token.token_id]) {
                    tokens[item.token.token_id] = item;
                    filteredListing.push(item);
                } else {
                    if (tokens[item.token.token_id].price > item.price) {
                        tokens[item.token.token_id] = item;
                    }
                }
            });
            return filteredListing;
        },
    },

    async created() {
        this.items = await this.getItems();
        this.isLoading = false;
    },

    template: `
        <section class="nft-gallery-wrapper container">
            <header>
                <h1 class="nft-gallery-title">{{ __( 'NFT Gallery', 'nft-gallery' ) }}</h1>
            </header>
            <div class="nft-gallery-summary" v-html="summary"></div>
            <div class="nft-gallery">
                <!-- <gallery-filters></gallery-filters> -->
                <p v-if="items.length > 0" class="my-2">
                    {{ items.length }} {{ __('results', 'nft-gallery') }}
                </p>
                <b-skeleton v-else width="75px" class="my-2"></b-skeleton>
                <token-list :items="items" :isLoading="isLoading" class="py-3 mb-3" @select-item="$emit('select-item', $event)"></token-list>
            </div>
        </section>
    `,
};

/**
 * Define the routes for the gallery
 */
const routes = [
    {
        path: '/',
        name: 'NFT Gallery',
        component: NftGallery,
    },
    {
        path: '/:collection_id/:token_id',
        name: 'single-token',
        component: SingleToken,
        props: true,
    },
    {
        path: '/:author/:token_slug/:listing_id',
        name: 'single-token',
        component: SingleToken,
        props: true,
    },
];

// Create the Vue Router instance
const router = new VueRouter({
    routes,
});

/**
 * Component for displaying the crypto currency symbol or code.
 *
 * @param {string} currency - The crypto currency full name
 * @param {('symbol'|'code')} [type=code] - Whether to return the currency symbol or currency code
 *
 * @returns {string} The currency symbol or code
 */
Vue.component('crypto', {
    props: {
        currency: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: 'code',
        },
    },
    data() {
        return {
            currencies: {
                bitcoin: {
                    symbol: '₿',
                    code: 'BTC',
                },
                ethereum: {
                    symbol: 'Ξ',
                    code: 'ETH',
                },
                tezos: {
                    symbol: 'ꜩ',
                    code: 'XTZ',
                },
            },
        };
    },
    methods: {
        getCurrencyCode() {
            return this.currencies[this.currency][this.type];
        },
    },
    template: `<span>{{ getCurrencyCode() }}</span>`,
});

/**
 * Component for displaying a gallery filter.
 */
Vue.component('gallery-filter', {
    props: {
        by: {
            type: String,
            required: true,
        },
    },
    emits: ['update:filter'],
    data() {
        return {
            selected: null,
            options: [],
        };
    },
    methods: {
        /**
         * Get label for the specified filter.
         * @param {string} filter - The filter to get the label for.
         * @returns {string} The label for the specified filter.
         */
        getLabel(filter) {
            switch (filter) {
                case 'collection':
                    return __('Collections', 'nft-gallery');
                case 'mime_type':
                    return __('Mime type', 'nft-gallery');
                case 'edition':
                    return __('Editions', 'nft-gallery');
                default:
                    console.warn(`Unknown filter: ${filter}`);
                    return '';
            }
        },

        /**
         * Get options for the specified filter.
         * @param {string} filter - The filter to get options for.
         * @returns {Array} The options for the specified filter.
         */
        getOptions(filter) {
            switch (filter) {
                case 'collection':
                    return this.getCollections();
                case 'mime_type':
                    return this.getMimeTypes();
                case 'edition':
                    return this.getEditions();
                default:
                    console.warn(`Unknown filter: ${filter}`);
                    return [];
            }
        },

        /**
         * Get available collections.
         * @returns {Array} The available collections.
         */
        getCollections() {
            return [
                { value: null, text: __('Select collection', 'nft-gallery') },
                { value: 'collection-1', text: __('Collection 1', 'nft-gallery') },
                { value: 'collection-2', text: __('Collection 2', 'nft-gallery') },
                { value: 'collection-3', text: __('Collection 3', 'nft-gallery') },
            ];
        },

        /**
         * Get available mime types.
         * @todo: Get available mime types from the API.
         * @returns {Array} The available mime types.
         */
        getMimeTypes() {
            return [
                { value: null, text: __('All types', 'nft-gallery') },
                { value: 'audio', text: __('Audio', 'nft-gallery') },
                { value: 'image', text: __('Image', 'nft-gallery') },
                { value: 'gif', text: __('GIF', 'nft-gallery') },
                { value: 'svg', text: __('SVG', 'nft-gallery') },
                { value: 'model', text: __('Model', 'nft-gallery') },
                { value: 'video', text: __('video', 'nft-gallery') },
                { value: 'interactive', text: __('Interactive', 'nft-gallery') },
                { value: 'pdf', text: __('PDF', 'nft-gallery') },
                { value: 'text', text: __('Text', 'nft-gallery') },
            ];
        },

        /**
         * Get available editions.
         * @returns {Array} The available editions.
         */
        getEditions() {
            return [
                { value: null, text: __('All Editions', 'nft-gallery') },
                { value: 'edition-1', text: __('Edition 1', 'nft-gallery') },
                { value: 'edition-2', text: __('Edition 2', 'nft-gallery') },
                { value: 'edition-3', text: __('Edition 3', 'nft-gallery') },
            ];
        },
    },
    created() {
        this.options = this.getOptions(this.by);
    },
    template: `
        <div class="filter mr-3">
            <b-form-group
                :label="getLabel(by)"
                :label-for="'filter-' + by"
            >
                <b-form-select 
                    :id="'filter-' + by" 
                    v-model="selected" 
                    :options="options" 
                    class="rounded-0"
                    :class="{ 'selected': selected !== null }"
                ></b-form-select>
            </b-form-group>
        </div>
    `,
});

/**
 * Component for displaying the gallery filters.
 */
Vue.component('gallery-filters', {
    template: `
        <div class="row">
            <div class="col-md-8">
                <h2 class="h5 highlight highlighted text-uppercase fw-bold py-1 px-1 mt-2 mb-4">
                    {{ __('My Filters', 'nft-gallery') }}
                </h2>
                <div class="nft-gallery-filters d-flex flex-wrap">
                    <gallery-filter by="collection"></gallery-filter>
                    <gallery-filter by="mime_type"></gallery-filter>
                    <gallery-filter by="edition"></gallery-filter>
                </div>
            </div>
            <div class="col-md-4">
                
            </div>
        </div>

    `,
});

/**
 * Component for displaying a gallery item.
 */
Vue.component('gallery-item', {
    emits: ['select-item'],
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            isImgLoading: true,
            ipfs_url: 'https://ipfs.io/ipfs/',
            imgProps: {
                center: true,
                fluidGrow: true,
                blank: true,
                blankColor: '#111',
                class: 'position-relative',
            },
        };
    },
    computed: {
        slug() {
            return (
                this.item.token?.name.toLowerCase().replace(/\s/g, '-') ||
                this.item.name.toLowerCase().replace(/\s/g, '-')
            );
        },
        author() {
            return (
                this.item.token?.creators.map((creator) => creator.holder.alias).join(', ') ||
                this.item.creators.map((creator) => creator.holder.alias).join(', ')
            );
        },
        currency() {
            return objktCurrencies[this.item.currency_id || 1] || '';
        },
        price() {
            return this.item.price !== undefined ? this.item.price / 1000000 : '-';
        },
        thumbnail_url() {
            // return `https://source.unsplash.com/random/400x293/?nft&sig=${
            //     this.item.token?.token_id || this.item.token_id
            // }`;
            return (
                this.ipfs_url +
                (this.item.token?.thumbnail_uri.split('/').pop() ||
                    this.item.thumbnail_uri.split('/').pop())
            );
        },
        token_link() {
            let linkTo;
            if (this.item.token !== undefined) {
                linkTo = {
                    name: 'single-token',
                    params: {
                        author: this.author,
                        token_slug: this.slug,
                        listing_id: this.item.id,
                    },
                };
            } else {
                linkTo = {
                    name: 'single-token',
                    params: { collection_id: this.item.fa_contract, token_id: this.item.token_id },
                };
            }
            return linkTo;
        },
    },
    template: `
        <article class="gallery-item">
            <b-link 
                :to="token_link" 
                class="gallery-item__link text-decoration-none"
                @click="$emit('select-item', item)"
            >
                <div class="gallery-item__image">
                    <div v-if="isImgLoading" class="position-absolute w-100 h-100">
                        <b-skeleton-img aspect="400:293"></b-skeleton-img>
                    </div>
                    <b-img-lazy v-bind="imgProps" :src="thumbnail_url" :alt="item.token?.name || item.name" @load.native="isImgLoading = false"></b-img-lazy>
                </div>
                <div class="gallery-item__info d-flex flex-column p-2">
                    <span class="galler-item__editions text-right text-soft-light">{{ item.token?.supply || item.supply }}x</span>
                    <h2 class="gallery-item__title h5 fw-bold text-light  p-0">{{ item.token?.name || item.name }}</h2>
                    <span class="gallery-item__author">{{ author }}</span>
                    <span class="gallery-item__price text-right text-soft-light">
                        {{ price }} <crypto :currency="currency" type="symbol"></crypto>
                    </span>
                </div>
            </b-link>
        </article>
    `,
});

/**
 * Component for displaying a list of gallery items (tokens).
 */
Vue.component('token-list', {
    emits: ['select-item'],
    props: {
        items: {
            type: Array,
            required: true,
        },
        isLoading: {
            type: Boolean,
            required: true,
        },
    },
    template: `
        <div>
            <b-skeleton-wrapper :loading="isLoading" class="nft-gallery__token-wrapper">
                <template #loading>
                    <b-card v-for="i in 4" :key="i" no-body bg-variant="dark" text-variant="white">
                        <b-skeleton-img aspect="400:293"></b-skeleton-img>
                        <b-card-body class="p-2">
                            <b-skeleton width="20%" class="ml-auto"></b-skeleton>
                            <b-skeleton width="65%" class="mb-2"></b-skeleton>
                            <b-skeleton width="40%"></b-skeleton>
                            <b-skeleton width="20%" class="ml-auto"></b-skeleton>
                        </b-card-body>
                    </b-card>
                </template>

                <div class="nft-gallery__token-wrapper">
                    <gallery-item v-for="item in items" :key="item.id" :item="item" @select-item="$emit('select-item', $event)"></gallery-item>
                </div>
            </b-skeleton-wrapper>
        </div>
    `,
});

/**
 * Root component for the NFT gallery.
 */
const app = new Vue({
    // el: '#nft-gallery',

    data() {
        return {
            currentItem: null,
        };
    },

    render: (createElement) => {
        const context = {
            props: {
                currentItem: this.currentItem,
                ...mountEl.dataset,
            },
            on: {
                selectItem: (item) => {
                    console.log('on selectItem', item);
                    this.currentItem = item;
                },
                'select-item': (item) => {
                    console.log('on select-item', item);
                    this.currentItem = item;
                },
            },
        };
        return createElement(RouterView, context);
    },

    router,

    // template: `<router-view></router-view>`,
}).$mount('#nft-gallery');
