const { __, _x, _n, _nx, sprintf } = wp.i18n;

/**
 * Component for displaying the gallery filters.
 */
Vue.component('gallery-filters', {
    template: `
        <div class="nft-gallery-filters">
            <h2>{{ __('My Filters', 'nft-gallery') }}</h2>
        </div>
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
        <div class="nft-gallery-token-wrapper">
            <p v-for="item in items">{{ item.token.name }}</p>
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
         * @param {array} listing - The listing of tokens from the Objkt API
         * @returns {array} - The filtered listing of tokens
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
            <token-list :items="items"></token-list>
		</div>
    `,
});
