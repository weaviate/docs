/**
 * Sets `src=<id>` on /e/<id> requests before the redirect rules run.
 *
 * Reads the id out of the request path, adds it to the query string, and
 * rewrites. Any query the request already had is preserved alongside it.
 *
 * WHY IT IS DONE HERE AND NOT IN THE `to` VALUES
 * ----------------------------------------------
 * Netlify forwards an incoming query string to a redirect destination ONLY when
 * the destination has no query string of its own. Write
 * `to = "/errors/x?src=py-dep011#anchor"` and the query the request arrived with
 * is silently DROPPED -- no build error, no broken link. Measured with
 * `netlify dev` and confirmed against production docs.weaviate.io. So every `to`
 * in the /e/ block stays plain and the parameter is added here instead;
 * _build_scripts/validate-redirects.js enforces the plain `to` values.
 *
 * ORDERING
 * --------
 * Edge functions run BEFORE the redirect rules (measured: a function and a 301
 * on the same path -> the function answers and the 301 never fires), and a
 * rewrite re-enters the redirect engine without re-running this function, so
 * rewriting to the same path with an extra param terminates rather than looping.
 *
 * `onError: "bypass"` skips this function if it throws, and the request falls
 * through to the plain redirect rules. Without it a thrown error is a 500 --
 * measured -- on a link that is printed inside an error message. Do not remove
 * it.
 */

export const config = {
  path: "/e/*",
  onError: "bypass",
};

// Same shape the redirector's ids are required to have: lowercase
// <origin>-<category><nnn>. Anything else is left alone rather than reflected
// into a URL, so a crafted path cannot put arbitrary text in the query string.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async (request: Request, context: any) => {
  const url = new URL(request.url);

  // A frozen legacy alias redirects /e/dep011 -> /e/py-dep011, so this can run
  // twice for a single click, the second time on a request that already carries
  // the parameter. The value set on the first hop stands.
  if (url.searchParams.has("src")) return context.next();

  const id = url.pathname.slice("/e/".length).replace(/\/+$/, "");
  if (!id || id.length > 64 || !ID.test(id)) return context.next();

  url.searchParams.set("src", id);
  return context.rewrite(url.toString());
};
