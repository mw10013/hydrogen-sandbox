/* eslint-disable hydrogen/prefer-image-component */
import {useLoaderData} from '@remix-run/react';
import {Money} from '@shopify/hydrogen-react';
import {LoaderArgs, LoaderFunction} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

const query = `#graphql
query Product($handle: String!) {
    product(handle: $handle) {
      title
      description
      availableForSale
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      totalInventory
      variants(first: 1) {
        nodes {
          id
          price {
            amount
            currencyCode
          }
          sku
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
  `;

export const loader = (async ({context, params}: LoaderArgs) => {
  const handle = params.handle;
  invariant(handle, 'Missing handle');
  const data = await context.storefront.query<any>(query, {
    variables: {
      handle,
    },
  });
  return data;
}) satisfies LoaderFunction;

export default function ProductRoute() {
  const {product} = useLoaderData<typeof loader>();
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-4 border-black mx-auto max-w-2xl bg-black/40 px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
          <div className="flex justify-between lg:col-span-5 lg:col-start-8">
            <h1 className="text-xl font-medium text-gray-100 ">
              {product.title}
            </h1>
            <p className="text-xl font-medium text-gray-100">
              <Money
                data={product.priceRange.maxVariantPrice}
                withoutCurrency
              />
            </p>
          </div>
          <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start1 lg:mt-0">
            <img
              className="rounded-lg"
              src={product.featuredImage.url}
              alt={product.featuredImage.altText}
              width={product.featuredImage.width}
              height={product.featuredImage.height}
            />
          </div>
          <div className="mt-8 lg:col-span-5">
            <h2 className="text-sm font-medium text-gray-100">Description</h2>
            <div className="prose prose-sm mt-4 text-gray-300">
              {product.description}
            </div>
          </div>
        </div>

        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </div>
    </div>
  );
}

/*

{
  "data": {
    "product": {
      "title": "70% Dark Chocolate",
      "description": "The Original Chocalate. Soft, rich, smooth 70% Dark Chocolate. Ingredients : Dark Chocolate, Coconut Oil, 1.5g sugar! For Focus, Performance and Energy. 18p Box Assortment 100% vegan and Gluten Free",
      "availableForSale": true,
      "priceRange": {
        "maxVariantPrice": {
          "amount": "35.0",
          "currencyCode": "USD"
        }
      },
      "totalInventory": 5,
      "variants": {
        "nodes": [
          {
            "id": "gid://shopify/ProductVariant/44457543860544",
            "price": {
              "amount": "35.0",
              "currencyCode": "USD"
            },
            "sku": "135668549887633"
          }
        ]
      },
      "featuredImage": {
        "url": "https://cdn.shopify.com/s/files/1/0720/0230/6368/products/43dc46_de5c6ba4cd3149478deb4288e1dc5a4e_mv2.webp?v=1676500217",
        "altText": null,
        "width": 650,
        "height": 840
      }
    }
  }
}

*/
