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
  const data = (await context.storefront.query(query)) as any;
  return data;
}) satisfies LoaderFunction;

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-4 border-black mx-auto max-w-6xl bg-black/40">
        <div className="text-white text-3xl pt-4 px-8">Our Boxes</div>
        <div>
          {data.products.nodes.map((i: any) => {
            return (
              <div key={i.handle} className="text-white">
                <Link to={`/products/${i.handle}`}>
                  <div className="flex flex-col gap-2 items-center">
                    <img
                      className="w-40"
                      src={i.featuredImage.url}
                      alt={i.featuredImage.altText}
                    />
                    <p>{i.title}</p>
                    <Money
                      className="text-white"
                      data={i.priceRange.maxVariantPrice}
                      withoutCurrency
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        <pre className="text-white">{JSON.stringify(data, null, 2)}</pre>
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
