import {Outlet} from '@remix-run/react';

export default function LayoutRoute() {
  return (
    <div className="bg-white">
      <header className="relative bg-white">
        <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>
      </header>
      <Outlet />
    </div>
  );
}
