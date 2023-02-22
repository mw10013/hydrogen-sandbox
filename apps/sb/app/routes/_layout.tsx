/* eslint-disable hydrogen/prefer-image-component */
import {Link, Outlet, useLoaderData} from '@remix-run/react';
import {LoaderArgs, LoaderFunction} from '@shopify/remix-oxygen';
import {Image} from '@shopify/hydrogen-react';

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
  const result = (await context.storefront.query(query)) as any;
  const data: any = {};
  for (const field of result.layout.fields) {
    switch (field.key) {
      case 'background_image':
      case 'logo':
        data[field.key] = field.reference.image;
        break;
      case 'nav_links':
        data[field.key] = field.references.nodes.map((i) => {
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
}) satisfies LoaderFunction;

function Header() {
  const data = useLoaderData();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="lg:flex lg:justify-between mt-4">
        <Link to="/">
          {/* <Image data={data.logo} loaderOptions={{crop: 'left', width: 820}} /> */}
          <img src={data.logo.url} alt="" className="w-[600px]" />
        </Link>
        <div className="flex justify-center">
          {data.nav_links.map((i: any) => (
            <Link key={i.name} to={i.href} className="flex-none">
              <img
                className="h-16 sm:h-20"
                src={i.image.url}
                alt={i.image.altText}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// background image: 3038 × 2602
export default function LayoutRoute() {
  const data = useLoaderData();
  return (
    <div
      style={{
        backgroundImage:
          "url('https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background.jpg?v=1676861944')",
      }}
      className="relative isolate overflow-auto bg-gray-900
    h-screen bg-cover bg-center bg-[url('https://cdn.shopify.com/s/files/1/0720/0230/6368/files/background.jpg?v=1676861944')]-"
    >
      {/* <img
        src={data.background_image.url}
        alt=""
        // className="absolute inset-0 -z-10 h-full w-full object-none"
        // className="absolute inset-0- top-0 left-0 -z-10 w-[1519px] h-[1301px] object-cover object-[50%_50%]"
        // className="absolute top-0 left-0 -z-10 w-full"
        // className="absolute inset-0 -z-10 h-full w-full object-cover"
        className="absolute inset-0 -z-10 w-[1519px] h-[1301px] object-left-top"
      /> */}
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
