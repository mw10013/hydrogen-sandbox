/* eslint-disable hydrogen/prefer-image-component */
import {useLoaderData} from '@remix-run/react';
import {LoaderArgs, LoaderFunction} from '@shopify/remix-oxygen';
import background from '~/assets/background-webp.webp';
import logo from '~/assets/logo-webp.webp';

// https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background.webp?v=1676653150

const query = `#graphql
  query Layout {
    metaobjects(type: "nav_bar", first: 5) {
      nodes {
        __typename
        handle
        type
        fields {
          __typename
          type
          key
          value
          references(first: 10) {
            nodes {
              __typename
              ... on Metaobject {
                handle
                type
                fields {
                  __typename
                  type
                  key
                  value
                  reference {
                    __typename
                    ... on MediaImage {
                      previewImage {
                        __typename
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const loader = (async ({context}: LoaderArgs) => {
  const result = await context.storefront.query(query);
  console.log({result});
  return {result};
}) satisfies LoaderFunction;

export default function HomeRoute() {
  const data = useLoaderData();
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 h-screen">
      <img
        // src={background}
        src="https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background-webp.webp?v=1676655454"
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <img src={logo} alt="" className="" />
      <div className="bg-gray-200 p-4">
        <details className="outline outline-2 outline-blue-300 p-4">
          <summary>JSON</summary>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
