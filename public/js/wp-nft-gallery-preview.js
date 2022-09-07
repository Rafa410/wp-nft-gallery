const { __, _x, _n, _nx, sprintf } = wp.i18n;

const mountEl = document.querySelector('#nft-gallery-preview');

/**
 * Root component for the NFT Gallery
 */
Vue.component('nft-gallery-preview', {
    data() {
        return {
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
        <section class="nft-gallery-preview-wrapper w-100 py-4">
            <b-skeleton-wrapper :loading="isLoading" class="nft-gallery-preview">
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

                <div class="nft-gallery-preview">
                    <gallery-item v-for="item in items" :key="item.id" :item="item"></gallery-item>
                </div>
            </b-skeleton-wrapper>
        </section>
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
    },
    template: `
        <div class="gallery-item">
            <div class="gallery-item__image">
                <div v-if="isImgLoading" class="position-absolute w-100 h-100">
                    <b-skeleton-img aspect="400:293" class="img-cover"></b-skeleton-img>
                </div>
                <b-img-lazy class="img-cover" v-bind="imgProps" :src="thumbnail_url" :alt="item.token?.name || item.name" @load.native="isImgLoading = false"></b-img-lazy>
            </div>
        </div>
    `,
});

/**
 * Root component for the NFT gallery.
 */
const app = new Vue({
    // el: '#nft-gallery-preview',

    template: `
        <nft-gallery-preview></nft-gallery-preview>
    `,
}).$mount('#nft-gallery-preview');
