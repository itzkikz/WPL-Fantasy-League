import { Link, useMatchRoute } from '@tanstack/react-router';

const BottomNavbar = ()  => {
  const matchRoute = useMatchRoute();

  const navItems = [
    { label: "Home", path: "/standings" },
    { label: "Manage", path: "/manager" },
    { label: "Coming", path: "/coming" },
    { label: "Soon", path: "/soon" },
    { label: "Settings", path: "/settings" }
  ];

  if (matchRoute({ to: '/login' })) {
  return null; // Truthy check works for both {} and { params }
}

  return (
    <nav className="flex-none border-t dark:border-[#541e5d]">
      <div className="grid h-16 grid-cols-5">
        {navItems.map(({ label, path }) => {
          const isActive = matchRoute({ to: path, fuzzy: false });
          
          return (
            <Link
              key={label}
              to={path}
              className={`inline-flex flex-col items-center justify-center text-[11px] transition-colors ${
                isActive 
                  ? 'dark:text-[#541e5d] font-semibold' 
                  : 'dark:hover:text-[#541e5d]'
              }`}
            >
              {label === "Home" && (
                      <svg
                        className="w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
                        />
                      </svg>
                    )}
                    {label === "Manage" && (
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    )}
                    {label === "Settings" && (
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="square"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}

              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavbar;
