/**
 * TrackingService - Third-party analytics and tracking integration
 * Integrates Google Analytics, Microsoft Clarity, and Cloudflare RUM
 * Respects Global Privacy Control (GPC) signal
 */

/**
 * Initialize tracking services
 * @param {string} gaTrackingId - Google Analytics tracking ID 
 * @param {string} clarityTrackingId - Microsoft Clarity tracking ID
 * @param {string} cloudflareRumToken - Cloudflare RUM token
 */
export function initializeTracking(gaTrackingId, clarityTrackingId, cloudflareRumToken) {
  // Respect Global Privacy Control
  if (navigator.globalPrivacyControl) {
    window.gtag = () => {};
    console.log(
      "%cWe can see that you have enabled the Global Privacy Control, indicating that you do not wish to have your information sold or shared.",
      "font-weight:bold; color: lightgreen;",
      "\nYour privacy is important to us, and we completely honor your choice.",
      "As a result, we have deactivated Google Analytics, Microsoft Clarity, and Cloudflare RUM. 😉"
    );
    return;
  }

  // Setup Cloudflare RUM (Real User Measurements)
  if (cloudflareRumToken) {
    setupCloudflareRUM(cloudflareRumToken);
  }

  // Setup Google Analytics
  if (gaTrackingId) {
    setupGoogleAnalytics(gaTrackingId);
  }

  // Setup Microsoft Clarity
  if (clarityTrackingId) {
    setupMicrosoftClarity(clarityTrackingId);
  }
}

/**
 * Setup Cloudflare RUM
 * @param {string} token - Cloudflare RUM token
 */
function setupCloudflareRUM(token) {
  const rumScript = document.createElement("script");
  rumScript.defer = true;
  rumScript.src = "https://static.cloudflareinsights.com/beacon.min.js";
  rumScript.setAttribute(
    "data-cf-beacon",
    JSON.stringify({ token: token })
  );
  document.head.appendChild(rumScript);
}

/**
 * Setup Google Analytics
 * @param {string} id - Google Analytics tracking ID
 */
function setupGoogleAnalytics(id) {
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(gtagScript);

  const dataLayerScript = document.createElement("script");
  dataLayerScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');`;
  document.head.appendChild(dataLayerScript);
}

/**
 * Setup Microsoft Clarity
 * @param {string} id - Microsoft Clarity tracking ID
 */
function setupMicrosoftClarity(id) {
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function (...args) {
        (c[a].q = c[a].q || []).push(args);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
}
