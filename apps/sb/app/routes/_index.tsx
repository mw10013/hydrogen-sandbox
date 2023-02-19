/* eslint-disable hydrogen/prefer-image-component */
import {useLoaderData} from '@remix-run/react';
import {json, LoaderArgs, LoaderFunction} from '@shopify/remix-oxygen';
import background from '~/assets/background-webp.webp';
import logo from '~/assets/logo-webp.webp';

// https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background.webp?v=1676653150

const query = `#graphql
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

export const loader = (async ({context}: LoaderArgs) => {
  const data = await context.storefront.query(query);
  return data;
}) satisfies LoaderFunction;

export default function HomeRoute() {
  const data = useLoaderData();
  const layoutData = data.layout.fields.reduce((acc: any, v: any) => {
    acc[v.key] = v;
    return acc;
  }, {});
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 min-h-screen">
      <img
        // src={background}
        src="https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background-webp.webp?v=1676655454"
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-none"
      />
      <img src={logo} alt="" className="" />
      <div className="bg-gray-200 p-4">
        <pre className="border-2 border-blue-300 p-4">
          {JSON.stringify(layoutData, null, 2)}
        </pre>
        <pre className="border-2 border-blue-300 p-4 mt-2">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
