import {useLoaderData} from '@remix-run/react';
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
  const result = (await context.storefront.query(query)) as any;
  return result;
  // const data: any = {};
  // for (const field of result.layout.fields) {
  //   switch (field.key) {
  //     case 'background_image':
  //     case 'logo':
  //       data[field.key] = field.reference.image;
  //       break;
  //     case 'nav_links':
  //       data[field.key] = field.references.nodes.map((i) => {
  //         const o: any = {};
  //         for (const f of i.fields) {
  //           switch (f.type) {
  //             case 'single_line_text_field':
  //               o[f.key] = f.value;
  //               break;
  //             case 'file_reference':
  //               o[f.key] = f.reference.image;
  //               break;
  //           }
  //         }
  //         return o;
  //       });
  //       break;
  //   }
  // }
  // return data;
}) satisfies LoaderFunction;

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-4 border-black mx-auto max-w-6xl bg-black/40">
        <div className="text-white text-3xl pt-4 px-8">Our Boxes</div>
        <pre className="text-white">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
