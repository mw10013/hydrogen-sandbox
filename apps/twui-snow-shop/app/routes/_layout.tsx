/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable hydrogen/prefer-image-component */
import {Link, Outlet} from '@remix-run/react';
import {useState} from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function Logo() {
  return (
    <Link to="/">
      <span className="sr-only">Your Company</span>
      <img
        className="h-8 w-auto"
        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
        alt=""
      />
    </Link>
  );
}

function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200">
        <div className="flex h-16 items-center">
          <button
            type="button"
            className="rounded-md bg-white p-2 text-gray-400 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="ml-4 flex lg:ml-0">
            <Logo />
          </div>
        </div>
      </div>
    </nav>
  );
}

function Header() {
  return (
    <header className="relative bg-white">
      <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
        Get free delivery on orders over $100
      </p>
      <Navigation />
    </header>
  );
}

export default function LayoutRoute() {
  return (
    <div className="bg-white">
      <Header />
      <Outlet />
    </div>
  );
}
