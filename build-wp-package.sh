#!/usr/bin/env bash
set -euo pipefail

rm -rf wp-package
mkdir -p wp-package/ideleon-static/static
cp -R out/. wp-package/ideleon-static/static/

# Create crawler directives for the migrated static site.
cat > wp-package/ideleon-static/static/robots.txt <<'EOF'
User-agent: *
Allow: /

Sitemap: https://ideleon.com/sitemap.xml
EOF

# Build a sitemap from every generated static HTML page.
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  find wp-package/ideleon-static/static -type f -name 'index.html' | sort | while read -r file; do
    rel="${file#wp-package/ideleon-static/static/}"
    if [ "$rel" = "index.html" ]; then
      url="https://ideleon.com/"
    else
      dir="${rel%/index.html}"
      url="https://ideleon.com/${dir}/"
    fi
    printf '  <url><loc>%s</loc></url>\n' "$url"
  done
  echo '</urlset>'
} > wp-package/ideleon-static/static/sitemap.xml

# Remove obsolete partner contacts from generated HTML/JS/text payloads.
find wp-package/ideleon-static/static -type f \
  ! -name '*.png' ! -name '*.jpg' ! -name '*.jpeg' ! -name '*.webp' ! -name '*.gif' ! -name '*.ico' \
  ! -name '*.svg' ! -name '*.woff' ! -name '*.woff2' ! -name '*.ttf' ! -name '*.mp4' ! -name '*.pdf' \
  -print0 | xargs -0 perl -pi -e 's/sapunov\.a\.a\@ideleon-group\.ru/zakaz\@ideleon.com/g; s/alexei\@ideleon\.com/ilya\@ideleon.com/g; s/\+7-910-305-73-02/\+7-926-696-13-86/g; s/\+7-915-038-40-30/\+7-926-696-13-86/g'

cat > wp-package/ideleon-static/style.css <<'EOF'
/*
Theme Name: ИДЕЛЕОН — Static Migration
Theme URI: https://ideleon.com
Author: ИДЕЛЕОН
Description: WordPress shell serving the migrated static build of the former ИДЕЛЕОН Next.js site.
Version: 1.0.0
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: ideleon-static
*/
EOF

cat > wp-package/ideleon-static/index.php <<'EOF'
<?php
/**
 * WordPress shell for the migrated static site.
 */
EOF

cat > wp-package/ideleon-static/functions.php <<'EOF'
<?php
if (!defined('ABSPATH')) { exit; }

function ideleon_static_path() {
    $uri = isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '/';
    $path = parse_url($uri, PHP_URL_PATH);
    if (!is_string($path) || $path === '') { $path = '/'; }
    return '/' . ltrim($path, '/');
}

function ideleon_static_file($relative) {
    $relative = ltrim(str_replace('\\', '/', $relative), '/');
    $file = trailingslashit(get_template_directory()) . 'static/' . $relative;
    return is_file($file) ? $file : false;
}

function ideleon_mime($file) {
    $type = wp_check_filetype($file);
    if (!empty($type['type'])) return $type['type'];
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $map = array(
        'svg' => 'image/svg+xml',
        'webp' => 'image/webp',
        'woff2' => 'font/woff2',
        'woff' => 'font/woff',
        'json' => 'application/json',
        'txt' => 'text/plain; charset=utf-8',
        'xml' => 'application/xml',
        'js' => 'application/javascript',
        'css' => 'text/css',
    );
    return isset($map[$ext]) ? $map[$ext] : 'application/octet-stream';
}

function ideleon_serve_asset() {
    if (is_admin()) return;

    $path = ideleon_static_path();
    $assetPrefixes = array('/_next/', '/images/', '/icon.png', '/apple-icon.png', '/favicon.ico', '/yandex_', '/zen_');
    $match = false;
    foreach ($assetPrefixes as $prefix) {
        if ($prefix === $path || (substr($prefix, -1) === '/' && strpos($path, $prefix) === 0)) {
            $match = true;
            break;
        }
    }
    if (!$match) {
        $candidate = ideleon_static_file(ltrim($path, '/'));
        if (!$candidate || strtolower(pathinfo($candidate, PATHINFO_EXTENSION)) === 'html') return;
        $file = $candidate;
    } else {
        $file = ideleon_static_file(ltrim($path, '/'));
        if (!$file) return;
    }

    nocache_headers();
    header('Content-Type: ' . ideleon_mime($file));
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}
add_action('template_redirect', 'ideleon_serve_asset', 1);

function ideleon_static_template($template) {
    if (is_admin()) return $template;
    $method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';
    if ($method !== 'GET' && $method !== 'HEAD') return $template;

    $relative = trim(ideleon_static_path(), '/');
    if ($relative === '') {
        $file = ideleon_static_file('index.html');
    } else {
        $file = ideleon_static_file($relative . '/index.html');
        if (!$file && substr($relative, -5) === '.html') {
            $file = ideleon_static_file($relative);
        }
    }

    if (!$file) {
        $file = ideleon_static_file('404.html');
        if ($file) status_header(404);
    }

    return $file ?: $template;
}
add_filter('template_include', 'ideleon_static_template', 99);

function ideleon_cancel_canonical($redirect) {
    if (is_admin()) return $redirect;
    return false;
}
add_filter('redirect_canonical', 'ideleon_cancel_canonical');

function ideleon_api_request() {
    if (is_admin()) return;

    $path = ideleon_static_path();
    $method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';
    if ($path !== '/api/request' || $method !== 'POST') return;

    $data = $_POST;
    if (empty($data)) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json)) $data = $json;
    }

    $name = isset($data['name']) ? sanitize_text_field($data['name']) : '';
    $phone = isset($data['phone']) ? sanitize_text_field($data['phone']) : '';
    $email = isset($data['email']) ? sanitize_email($data['email']) : '';
    $subject = isset($data['subject']) ? sanitize_text_field($data['subject']) : 'Заявка с сайта ИДЕЛЕОН';
    $task = isset($data['task']) ? sanitize_textarea_field($data['task']) : '';
    $message = isset($data['message']) ? sanitize_textarea_field($data['message']) : '';
    $source = isset($data['sourcePage']) ? esc_url_raw($data['sourcePage']) : (isset($data['source']) ? sanitize_text_field($data['source']) : 'Сайт');

    if ($subject === 'Заявка с сайта ИДЕЛЕОН' && !empty($data['requestType'])) {
        $subject = $data['requestType'] === 'calculation' ? 'Расчёт с сайта ИДЕЛЕОН' : 'Заявка с сайта ИДЕЛЕОН';
    }

    $body = "Источник: {$source}\nИмя: {$name}\nТелефон: {$phone}\nE-mail: {$email}\n\n";
    if ($task !== '') $body .= "Задача / расчёт:\n{$task}\n\n";
    if ($message !== '') $body .= "Сообщение:\n{$message}\n";

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'From: ИДЕЛЕОН <zakaz@ideleon.com>',
    );
    if ($email) $headers[] = 'Reply-To: ' . $email;

    $attachments = array();
    if (!empty($_FILES['attachment']['tmp_name']) && is_uploaded_file($_FILES['attachment']['tmp_name'])) {
        $uploadError = isset($_FILES['attachment']['error']) ? (int) $_FILES['attachment']['error'] : UPLOAD_ERR_OK;
        if ($uploadError === UPLOAD_ERR_OK) {
            $attachments[] = $_FILES['attachment']['tmp_name'];
        }
    }

    $mailError = '';
    $errorHandler = function($error) use (&$mailError) {
        if ($error instanceof WP_Error) {
            $mailError = $error->get_error_message();
        }
    };
    add_action('wp_mail_failed', $errorHandler);

    $sent = wp_mail('zakaz@ideleon.com', $subject, $body, $headers, $attachments);

    if ($sent) {
        wp_mail('ilya@ideleon.com', 'Копия: ' . $subject, $body, $headers, $attachments);
    }

    remove_action('wp_mail_failed', $errorHandler);

    status_header($sent ? 200 : 500);
    header('Content-Type: application/json; charset=utf-8');
    echo wp_json_encode(array(
        'ok' => (bool) $sent,
        'message' => $sent
            ? 'Заявка успешно отправлена.'
            : ('Не удалось отправить письмо. ' . ($mailError ?: 'Почтовый сервер Hoster не принял сообщение.')),
    ));
    exit;
}
add_action('template_redirect', 'ideleon_api_request', 1);
EOF

cat > wp-package/ideleon-static/comments.php <<'EOF'
<?php
if (!defined('ABSPATH')) { exit; }
EOF

cat > wp-package/ideleon-static/README-START-HERE.txt <<'EOF'
ИДЕЛЕОН — WordPress migration package

1. WordPress → Внешний вид → Темы → Добавить новую → Загрузить тему.
2. Загрузи ZIP-файл ideleon-static-theme.zip.
3. Установи и активируй тему «ИДЕЛЕОН — Static Migration».
4. WordPress → Настройки → Постоянные ссылки → «Сохранить изменения».

Перенос сделан из исходного сайта ИДЕЛЕОН в GitHub через статический экспорт Next.js.
WordPress используется как оболочка и обработчик заявок.
Контакты партнёра в пакет не включены.
EOF

(cd wp-package && zip -qr ../ideleon-static-theme.zip ideleon-static)
ls -lh ideleon-static-theme.zip
