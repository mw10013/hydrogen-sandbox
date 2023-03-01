import {type LinksFunction, type V2_MetaFunction} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react';
import favicon from '../public/favicon.svg';
import stylesheet from '~/styles/tailwind.css';

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: stylesheet},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: 'Tahuu',
    },
    {
      name: 'description',
      content: 'Tahuu chocolates - taste your spirit',
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({error}: {error: any}) {
  // eslint-disable-next-line no-console
  console.error(error);
  return (
    <html lang="en">
      <head>
        <title>Error Boundary</title>
        <Meta />
        <Links />
      </head>
      <body>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        <Scripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}
