const { __, _x, _n, _nx, sprintf } = wp.i18n;

const objktCurrencies = {
    1: 'tezos',
};

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
         * @returns {Array} The available mime types.
         */
        getMimeTypes() {
            return [
                { value: null, text: __('All types', 'nft-gallery') },
                { value: 'image/jpeg', text: __('JPEG', 'nft-gallery') },
                { value: 'image/png', text: __('PNG', 'nft-gallery') },
                { value: 'image/gif', text: __('GIF', 'nft-gallery') },
                { value: 'video/mp4', text: __('MP4', 'nft-gallery') },
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
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            ipfs_url: 'https://ipfs.io/ipfs/',
            assets_url:
                'https://assets.objkt.media/file/assets-003/:fa_contract/:token_id/thumb288',
        };
    },
    computed: {
        author() {
            return this.item.token.creators.map((creator) => creator.holder.alias).join(', ');
        },
        currency() {
            return objktCurrencies[this.item.currency_id] || '';
        },
        price() {
            return this.item.price / 1000000;
        },
        ipfs_thumbnail_url() {
            return this.ipfs_url + this.item.token.thumbnail_uri.split('/').pop();
        },
        thumbnail_url() {
            return `https://source.unsplash.com/random/400x293/?nft&sig=${this.item.token.token_id}`;
            return this.assets_url
                .replace(':fa_contract', this.item.fa_contract)
                .replace(':token_id', this.item.token.token_id);
        },
    },
    template: `
        <article class="gallery-item">
            <a href="#" class="gallery-item__link text-decoration-none">
                <div class="gallery-item__image">
                    <img :src="thumbnail_url" :alt="item.token.name" class="img-fluid">
                </div>
                <div class="gallery-item__info d-flex flex-column p-2">
                    <span class="galler-item__editions text-right text-soft-light">{{ item.token.supply }}x</span>
                    <h2 class="gallery-item__title h5 fw-bold text-light  p-0">{{ item.token.name }}</h2>
                    <span class="gallery-item__author">{{ author }}</span>
                    <span class="gallery-item__price text-right text-soft-light">
                        {{ price }} <crypto :currency="currency" type="symbol"></crypto>
                    </span>
                </div>
            </a>
        </article>
    `,
});

/**
 * Component for displaying a list of gallery items (tokens).
 */
Vue.component('token-list', {
    props: {
        items: {
            type: Array,
            required: true,
        },
    },
    template: `
        <div class="nft-gallery__token-wrapper">
            <gallery-item v-for="item in items" :item="item"></gallery-item>
        </div>
    `,
});

/**
 * Root component for the NFT gallery.
 */
const app = new Vue({
    el: '#nft-gallery',

    data: {
        items: [],
        isLoading: true,
        ipfs_url: 'https://ipfs.io/ipfs/',
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
                    items = await this.getItemsFromObjkt();
                    break;
                default:
                    console.warn(`Selected marketplace "${marketplace}" not supported`);
                    break;
            }
            return items;
        },

        /**
         * Load the items from the Objkt GraphQL API
         *
         */
        async getItemsFromObjkt() {
            console.debug('Objkt endpoint: ', this.objktEndpoint);
            console.debug('Objkt alias: ', this.objktAlias);

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
                    variables: { alias: this.objktAlias },
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
    },

    template: `
		<div class="nft-gallery">
            <gallery-filters></gallery-filters>
            <p v-if="items.length > 0" class="my-2">
                {{ items.length }} {{ __('results', 'nft-gallery') }}
            </p>
            <token-list :items="items" class="py-3 mb-3"></token-list>
		</div>
    `,
});
