import {useLoaderData} from '@remix-run/react';
import {LoaderArgs, LoaderFunction} from '@shopify/remix-oxygen';

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

export default function HomeRoute() {
  const data = useLoaderData();
  return <div className="px-4 text-2xl text-white sm:px-6 lg:px-8">Index</div>;
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
