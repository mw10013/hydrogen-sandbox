import {Await, useLoaderData} from '@remix-run/react';
import {defer, LoaderFunction} from '@shopify/remix-oxygen';
import {Suspense} from 'react';

async function getDeferredValue(value?: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return value;
}

export const loader = (async () => {
  const immediateValue = 'immediateValue';
  const deferredValue = getDeferredValue();
  return defer({
    immediateValue,
    deferredValueString: await getDeferredValue('string'),
    deferredValueUndefined: await getDeferredValue(),
  });
}) satisfies LoaderFunction;

export default function Sb1Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-gray-300 max-w-md mx-auto mt-8 px-4 py-2 border ">
      <p>Immediate Value: {data.immediateValue}</p>
      <Suspense fallback={<p>PENDING deferredValueString</p>}>
        <Await resolve={data.deferredValueString}>
          {(v) => <p className="font-bold">{`Deferred value string: ${v}`}</p>}
        </Await>
      </Suspense>
      <Suspense fallback={<p>PENDING deferredValueUndefined</p>}>
        <Await resolve={data.deferredValueUndefined}>
          {(v) => (
            <p className="font-bold">{`Deferred value undefined: ${v}`}</p>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
