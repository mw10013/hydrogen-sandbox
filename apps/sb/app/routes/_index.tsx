/* eslint-disable hydrogen/prefer-image-component */
import background from '~/assets/background-webp.webp';

export default function HomeRoute() {
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 h-screen">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
    </div>
  );
}
