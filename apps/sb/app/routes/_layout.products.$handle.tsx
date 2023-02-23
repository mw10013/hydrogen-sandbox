/* eslint-disable hydrogen/prefer-image-component */
import {useLoaderData} from '@remix-run/react';
import {LoaderArgs, LoaderFunction} from '@shopify/remix-oxygen';

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

export const loader = (async ({context}: LoaderArgs) => {
  const data = await context.storefront.query<any>(query, {
    variables: {
      handle: '70-dark-chocolate',
    },
  });
  return data;
}) satisfies LoaderFunction;

export default function ProductRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-gray-200">
      <img
        src={data.product.featuredImage.url}
        alt={data.product.featuredImage.altText}
        width={data.product.featuredImage.width}
        height={data.product.featuredImage.height}
      />
      Product
      <pre>{JSON.stringify(data, null, 2)}</pre>
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
