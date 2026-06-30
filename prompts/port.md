i need you to do the following:

i need you to port old-sites/tips into apps/tips and preserve the
exact funciton of the site.

if you need to add new deps, add them to the catalog in the root package.json
(e.g. motion, framer-motion, motion-dom) and be explicity about it. we block
anything that isnt 3 days old, optional deps, peer deps, and what you install
becomes the defacto version.
