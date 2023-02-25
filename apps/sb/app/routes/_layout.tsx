/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable hydrogen/prefer-image-component */
import {Await, Link, Outlet, useLoaderData, useMatches} from '@remix-run/react';
import {
  AppLoadContext,
  defer,
  LoaderArgs,
  LoaderFunction,
} from '@shopify/remix-oxygen';
import {Image} from '@shopify/hydrogen-react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import invariant from 'tiny-invariant';
import {Storefront} from '@shopify/hydrogen';
import {Cart} from '@shopify/hydrogen/storefront-api-types';
import {Suspense} from 'react';

const LAYOUT_QUERY = `#graphql
query Layout {
  layout: metaobject(handle: {handle: "main-layout", type: "layout"}) {
    fields {
      type
      key
      value
      reference {
        __typename
        ... on MediaImage {
          ...mediaImageFields
        }
      }
      references(first: 10) {
        nodes {
          __typename
          ... on Metaobject {
            handle
            type
            fields {
              type
              key
              value
              reference {
                __typename
                ... on MediaImage {
                  ...mediaImageFields
                }
              }
            }
          }
        }
      }
    }
  }
}

fragment mediaImageFields on MediaImage {
  image {
    url
    altText
    width
    height
  }
}
`;

async function getLayoutData({storefront}: AppLoadContext) {
  const result = (await storefront.query(LAYOUT_QUERY)) as any;
  const data: any = {};
  for (const field of result.layout.fields) {
    switch (field.key) {
      case 'background_image':
      case 'logo':
        data[field.key] = field.reference.image;
        break;
      case 'nav_links':
        data[field.key] = field.references.nodes.map((i: any) => {
          const o: any = {};
          for (const f of i.fields) {
            switch (f.type) {
              case 'single_line_text_field':
                o[f.key] = f.value;
                break;
              case 'file_reference':
                o[f.key] = f.reference.image;
                break;
            }
          }
          return o;
        });
        break;
    }
  }
  return data;
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

async function getCart({storefront}: AppLoadContext, cartId: string) {
  invariant(storefront, 'missing storefront client in cart query');

  const {cart} = await storefront.query<{cart?: Cart}>(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}

export const loader = (async ({context}: LoaderArgs) => {
  const [cartId, layout] = await Promise.all([
    context.session.get('cartId'),
    getLayoutData(context),
  ]);

  return defer({
    layout,
    selectedLocale: context.storefront.i18n,
    cartId,
    cart: cartId ? getCart(context, cartId) : undefined,
    // analytics: {
    //   shopifySalesChannel: ShopifySalesChannel.hydrogen,
    //   shopId: layout.shop.id,
    // },
  });
}) satisfies LoaderFunction;

function Header() {
  const {layout, ...data} = useLoaderData<typeof loader>();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between">
        <div></div>
        <div className="bg-black opacity-80 mt-8 p-2 rounded-md shadow text-gray-200">
          <a href="#" className="group -m-2 flex items-center p-2">
            <ShoppingBagIcon
              className="h-6 w-6 flex-shrink-0 text-gray-200 group-hover:text-gray-500"
              aria-hidden="true"
            />
            <span className="ml-2 text-sm font-medium text-gray-100 group-hover:text-gray-800">
              0
            </span>
            <span className="sr-only">items in cart, view bag</span>
          </a>
          <Suspense fallback={<p>Awaiting cart</p>}>
            <Await resolve={data.cart}>
              {(cart) => <pre>{JSON.stringify(cart, null, 2)}</pre>}
            </Await>
          </Suspense>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
      <div className="lg:flex lg:justify-between mt-4">
        <Link to="/">
          {/* <Image data={data.logo} loaderOptions={{crop: 'left', width: 820}} /> */}
          <img src={layout.logo.url} alt="" className="w-[600px]" />
        </Link>
        <div className="flex justify-center">
          {layout.nav_links.map((i: any) => (
            <Link key={i.name} to={i.href} className="flex-none">
              <img
                className="w-[90px] h-[75px] sm:w-[125px] sm:h-[100px]"
                src={i.image.url}
                alt={i.image.altText}
                // width={i.image.width}
                // height={i.image.height}
                width={358}
                height={300}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LayoutRoute() {
  const {layout} = useLoaderData<typeof loader>();
  return (
    <div
      className="overflow-auto h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url('${layout.background_image.url}')`,
      }}
    >
      <Header />
      <Outlet />
      {/* <div className="bg-gray-200 p-4">
        <pre className="border-2 border-blue-300 p-4 mt-2">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}

/*

{
  "data": {
    "layout": {
      "fields": [
        {
          "type": "file_reference",
          "key": "background_image",
          "value": "gid://shopify/MediaImage/32920574722368",
          "reference": {
            "__typename": "MediaImage",
            "image": {
              "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background-webp.webp?v=1676655454",
              "altText": null,
              "width": 1960,
              "height": 2602
            }
          },
          "references": null
        },
        {
          "type": "file_reference",
          "key": "logo",
          "value": "gid://shopify/MediaImage/32920278204736",
          "reference": {
            "__typename": "MediaImage",
            "image": {
              "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/logo-webp.webp?v=1676653169",
              "altText": null,
              "width": 1660,
              "height": 432
            }
          },
          "references": null
        },
        {
          "type": "list.metaobject_reference",
          "key": "nav_links",
          "value": "[\"gid://shopify/Metaobject/9830720\",\"gid://shopify/Metaobject/9863488\"]",
          "reference": null,
          "references": {
            "nodes": [
              {
                "__typename": "Metaobject",
                "handle": "about",
                "type": "nav_link",
                "fields": [
                  {
                    "type": "single_line_text_field",
                    "key": "href",
                    "value": "/about",
                    "reference": null
                  },
                  {
                    "type": "file_reference",
                    "key": "image",
                    "value": "gid://shopify/MediaImage/32920282923328",
                    "reference": {
                      "__typename": "MediaImage",
                      "image": {
                        "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/about-png.png?v=1676653197",
                        "altText": null,
                        "width": 358,
                        "height": 300
                      }
                    }
                  },
                  {
                    "type": "single_line_text_field",
                    "key": "name",
                    "value": "About",
                    "reference": null
                  }
                ]
              },
              {
                "__typename": "Metaobject",
                "handle": "story",
                "type": "nav_link",
                "fields": [
                  {
                    "type": "single_line_text_field",
                    "key": "href",
                    "value": "/story",
                    "reference": null
                  },
                  {
                    "type": "file_reference",
                    "key": "image",
                    "value": "gid://shopify/MediaImage/32920283087168",
                    "reference": {
                      "__typename": "MediaImage",
                      "image": {
                        "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/story-png.png?v=1676653197",
                        "altText": null,
                        "width": 356,
                        "height": 300
                      }
                    }
                  },
                  {
                    "type": "single_line_text_field",
                    "key": "name",
                    "value": "Story",
                    "reference": null
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}

{
  "background_image": {
    "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background-webp.webp?v=1676655454",
    "altText": null,
    "width": 1960,
    "height": 2602
  },
  "logo": {
    "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/logo-webp.webp?v=1676653169",
    "altText": null,
    "width": 1660,
    "height": 432
  },
  "nav_links": [
    {
      "href": "/about",
      "image": {
        "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/about-png.png?v=1676653197",
        "altText": null,
        "width": 358,
        "height": 300
      },
      "name": "About"
    },
    {
      "href": "/story",
      "image": {
        "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/files/story-png.png?v=1676653197",
        "altText": null,
        "width": 356,
        "height": 300
      },
      "name": "Story"
    }
  ]
}

*/
