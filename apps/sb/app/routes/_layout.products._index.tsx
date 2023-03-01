/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable hydrogen/prefer-image-component */
import {Link, useLoaderData} from '@remix-run/react';
import {Money} from '@shopify/hydrogen-react';
import {LoaderArgs, LoaderFunction} from '@shopify/remix-oxygen';

const query = `#graphql
query Products {
  products(first: 16) {
    nodes {
      handle
      title
      availableForSale
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
        width
        height
      }
    }
  }
}
`;

export const loader = (async ({context}: LoaderArgs) => {
  const data = await context.storefront.query<any>(query);
  return data;
}) satisfies LoaderFunction;

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl border-4 border-black bg-black/40 py-6">
        <div className="px-8 text-3xl text-white ">Our Boxes</div>
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))]  gap-6">
          {data.products.nodes.map((i: any) => {
            return (
              <div key={i.handle} className="text-white">
                <Link to={`/products/${i.handle}`}>
                  <div className="flex flex-col items-center gap-2">
                    <img
                      className="w-40"
                      src={i.featuredImage.url}
                      alt={i.featuredImage.altText}
                      width={i.featuredImage.width}
                      height={i.featuredImage.height}
                    />
                    <p className="text-center">{i.title}</p>
                    <Money
                      className="text-gray-200"
                      data={i.priceRange.maxVariantPrice}
                      withoutCurrency
                    />
                  </div>
                </Link>
                <div className="mt-2 grid place-content-center">
                  <button
                    type="button"
                    disabled={!i.availableForSale}
                    className="py{-2 inline-flex items-center rounded-full border border-transparent bg-yellow-600 px-5 text-base font-medium text-gray-700 shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {i.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {/* <pre className="text-white">{JSON.stringify(data, null, 2)}</pre> */}
      </div>
    </div>
  );
}

/*

{
  "products": {
    "nodes": [
      {
        "handle": "70-dark-chocolate",
        "title": "70% Dark Chocolate",
        "availableForSale": true,
        "priceRange": {
          "maxVariantPrice": {
            "amount": "35.0",
            "currencyCode": "USD"
          }
        },
        "featuredImage": {
          "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/products/43dc46_de5c6ba4cd3149478deb4288e1dc5a4e_mv2.webp?v=1676500217",
          "altText": null,
          "width": 650,
          "height": 840
        }
      }
    ]
  }
}

*/
