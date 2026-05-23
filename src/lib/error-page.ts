export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Something went wrong</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#f7f8f8; color:#111; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .card { max-width: 420px; padding: 32px; background:#fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.06); text-align:center; }
  h1 { margin: 0 0 8px; font-size: 20px; }
  p { margin: 0 0 24px; color:#555; font-size: 14px; }
  .row { display:flex; gap:8px; justify-content:center; }
  button, a { font: inherit; padding: 10px 16px; border-radius: 8px; border:1px solid #d0d5dd; background:#fff; color:#111; text-decoration:none; cursor:pointer; }
  button.primary { background:#16a34a; border-color:#16a34a; color:#fff; }
</style>
</head>
<body>
  <div class="card">
    <h1>Something went wrong</h1>
    <p>An unexpected error occurred while rendering this page.</p>
    <div class="row">
      <button class="primary" onclick="location.reload()">Try again</button>
      <a href="/">Go home</a>
    </div>
  </div>
</body>
</html>`;
}
