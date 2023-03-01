/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable hydrogen/prefer-image-component */
import {
  Await,
  Link,
  Outlet,
  useLoaderData,
  useMatches,
  useOutletContext,
} from '@remix-run/react';
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
import {I18nBase, Storefront} from '@shopify/hydrogen';
import {Cart} from '@shopify/hydrogen/storefront-api-types';
import {Fragment, Suspense} from 'react';
import React from 'react';
import {Dialog, Transition} from '@headlessui/react';

type ContextType = {i18n: I18nBase};

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
      nodes {
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

  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

  const {cart} = await storefront.query<{cart?: Cart}>(CART_QUERY, {
    variables: {
      cartId,
      // cartId: '1',
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
    i18n: context.storefront.i18n,
    cartId,
    cart: cartId ? await getCart(context, cartId) : undefined,
  });
}) satisfies LoaderFunction;

function Cart({
  open,
  setOpen,
  title,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {title}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {children}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>$262.00!</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="#"
                          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                          Checkout
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={() => setOpen(false)}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function Navigation({setCartOpen}: {setCartOpen: (open: boolean) => void}) {
  const {layout, ...data} = useLoaderData<typeof loader>();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between">
        <div></div>
        <div className="mt-8 rounded-md bg-black p-2 text-gray-200 opacity-80 shadow">
          <button
            type="button"
            className="group -m-2 flex items-center p-2"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBagIcon
              className="h-6 w-6 flex-shrink-0 text-gray-200 group-hover:text-gray-500"
              aria-hidden="true"
            />
            <span className="ml-2 text-sm font-medium text-gray-100 group-hover:text-gray-500">
              <Suspense fallback="0">
                <Await resolve={data.cart} errorElement={'Cart fetch error'}>
                  {(cart) => cart?.totalQuantity ?? 0}
                </Await>
              </Suspense>
            </span>
            <span className="sr-only">items in cart, view bag</span>
          </button>
        </div>
      </div>
      <div className="mt-4 lg:flex lg:justify-between">
        <Link to="/">
          {/* <Image data={data.logo} loaderOptions={{crop: 'left', width: 820}} /> */}
          <img src={layout.logo.url} alt="" className="w-[600px]" />
        </Link>
        <div className="flex justify-center">
          {layout.nav_links.map((i: any) => (
            <Link key={i.name} to={i.href} className="flex-none">
              <img
                className="h-[75px] w-[90px] sm:h-[100px] sm:w-[125px]"
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

const products = [
  {
    id: 1,
    name: 'Throwback Hip Bag',
    href: '#',
    color: 'Salmon',
    price: '$90.00',
    quantity: 1,
    imageSrc:
      'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-01.jpg',
    imageAlt:
      'Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt.',
  },
  {
    id: 2,
    name: 'Medium Stuff Satchel',
    href: '#',
    color: 'Blue',
    price: '$32.00',
    quantity: 1,
    imageSrc:
      'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-02.jpg',
    imageAlt:
      'Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.',
  },
  // More products...
];

function Header() {
  const {cart} = useLoaderData<typeof loader>();
  const [cartOpen, setCartOpen] = React.useState(false);
  return (
    <>
      <Cart title="Shopping cart" open={cartOpen} setOpen={setCartOpen}>
        {cart?.lines.nodes.map((cartLine) => (
          <li key={cartLine.id} className="flex py-6">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              <img
                src={cartLine.merchandise.image?.url}
                alt={cartLine.merchandise.image?.altText ?? ''}
                width={cartLine.merchandise.image?.width ?? undefined}
                height={cartLine.merchandise.image?.height ?? undefined}
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <h3>
                    <Link
                      to={`/products/${cartLine.merchandise.product.handle}`}
                    >
                      {cartLine.merchandise.product.title}
                    </Link>
                  </h3>
                  <p className="ml-4">Price???</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">Color???</p>
              </div>
              <div className="flex flex-1 items-end justify-between text-sm">
                <p className="text-gray-500">Qty {cartLine.quantity}</p>

                <div className="flex">
                  <button
                    type="button"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </Cart>
      <header className="relative overflow-hidden">
        <Navigation setCartOpen={setCartOpen} />
      </header>
    </>
  );
}

export default function LayoutRoute() {
  const {layout, i18n} = useLoaderData<typeof loader>();
  const context: ContextType = {i18n};
  return (
    <div
      className="h-screen overflow-auto bg-cover bg-center"
      style={{
        backgroundImage: `url('${layout.background_image.url}')`,
      }}
    >
      <Header />
      <Outlet context={context} />
      {/* <div className="bg-gray-200 p-4">
        <pre className="border-2 border-blue-300 p-4 mt-2">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}

export function useI18N() {
  return useOutletContext<ContextType>().i18n;
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

{
  "id": "gid://shopify/Cart/c1-6969d39f56715457ac6883149af402d8",
  "checkoutUrl": "https://sandbox-shop-01.myshopify.com/cart/c/c1-6969d39f56715457ac6883149af402d8",
  "totalQuantity": 1,
  "buyerIdentity": {
    "countryCode": "US",
    "customer": null,
    "email": null,
    "phone": null
  },
  "lines": {
    "nodes": [
      {
          "id": "gid://shopify/CartLine/827d97a3-bab9-4cac-a394-6085accd35b0?cart=c1-6969d39f56715457ac6883149af402d8",
          "quantity": 1,
          "attributes": [],
          "cost": {
            "totalAmount": {
              "amount": "35.0",
              "currencyCode": "USD"
            },
            "amountPerQuantity": {
              "amount": "35.0",
              "currencyCode": "USD"
            },
            "compareAtAmountPerQuantity": null
          },
          "merchandise": {
            "id": "gid://shopify/ProductVariant/44457543860544",
            "availableForSale": true,
            "compareAtPrice": null,
            "price": {
              "currencyCode": "USD",
              "amount": "35.0"
            },
            "requiresShipping": true,
            "title": "Default Title",
            "image": {
              "id": "gid://shopify/ProductImage/40556190171456",
              "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/products/43dc46_de5c6ba4cd3149478deb4288e1dc5a4e_mv2.webp?v=1676500217",
              "altText": null,
              "width": 650,
              "height": 840
            },
            "product": {
              "handle": "70-dark-chocolate",
              "title": "70% Dark Chocolate",
              "id": "gid://shopify/Product/8153242861888"
            },
            "selectedOptions": [
              {
                "name": "Title",
                "value": "Default Title"
              }
            ]
        }
      }
    ]
  },
  "cost": {
    "subtotalAmount": {
      "currencyCode": "USD",
      "amount": "35.0"
    },
    "totalAmount": {
      "currencyCode": "USD",
      "amount": "35.0"
    },
    "totalDutyAmount": null,
    "totalTaxAmount": null
  },
  "note": "",
  "attributes": [],
  "discountCodes": []
}

*/
