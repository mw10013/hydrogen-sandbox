/* eslint-disable hydrogen/prefer-image-component */

import {Await, useLoaderData} from '@remix-run/react';
import {defer, LoaderFunction} from '@shopify/remix-oxygen';
import {Suspense} from 'react';

export const loader = (async () => {
  const immediateValue = 'immediateValue';
  const deferredValue = new Promise((resolve) => {
    setTimeout(() => resolve('deferredValue'), 3000);
  });
  return defer({
    immediateValue,
    deferredValue,
  });
}) satisfies LoaderFunction;

export default function Sb1Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="max-w-md mx-auto mt-8 px-4 py-2 border">
      <p>Immediate Value: {data.immediateValue}</p>
      <Suspense fallback="Pending deferred value">
        <Await resolve={data.deferredValue}>
          {(v) => `Deferred value: ${v}`}
        </Await>
      </Suspense>
    </div>
  );
}
