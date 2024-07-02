// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// const isApiRoute = createRouteMatcher(['/api(.*)']);

// export default clerkMiddleware((auth, req) => {
//   // Allow API routes to pass through without authentication
//   if (isApiRoute(req)) return;

//   // Protect all other routes
//   auth().protect();
// });

// export const config = {
//   matcher: ['/((?!.*\\..*|_next).*)', '/'],
// };

import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/api/:path*"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
