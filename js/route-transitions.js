(() => {
  const body = document.body;
  if (!body) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let navigationPending = false;

  function clearEntryState(event) {
    if (event.target === body && event.animationName === "route-page-enter") {
      body.classList.remove("route-entering");
    }
  }

  if (!reducedMotion.matches) body.classList.add("route-entering");
  body.addEventListener("animationend", clearEntryState);

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reducedMotion.matches) return;

    const target = event.target instanceof window.Element ? event.target : event.target?.parentElement;
    const link = target?.closest("a[href]");
    if (!link || link.hasAttribute("download") || link.relList.contains("external")) return;
    if (link.target && link.target.toLowerCase() !== "_self") return;

    const destination = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    if (destination.origin !== current.origin) return;
    if (destination.pathname === current.pathname && destination.search === current.search) return;

    event.preventDefault();
    if (navigationPending) return;
    navigationPending = true;
    body.classList.remove("route-entering");
    body.classList.add("route-leaving");
    window.setTimeout(() => window.location.assign(destination.href), 130);
  });

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    navigationPending = false;
    body.classList.remove("route-leaving", "route-entering");
    if (!reducedMotion.matches) {
      window.requestAnimationFrame(() => body.classList.add("route-entering"));
    }
  });
})();
