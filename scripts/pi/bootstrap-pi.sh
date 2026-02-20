#!/usr/bin/env bash
set -euo pipefail

# First-time Raspberry Pi setup for this site:
# - installs nginx + php-fpm + sqlite support
# - creates stable deploy folders under /var/www/sounddesigner
# - configures nginx to serve /var/www/sounddesigner/current

SITE_ROOT="${SITE_ROOT:-/var/www/sounddesigner}"
SITE_CURRENT="${SITE_ROOT}/current"
SITE_RELEASES="${SITE_ROOT}/releases"
SITE_DATA="${SITE_ROOT}/data"
SITE_NAME="${SITE_NAME:-sounddesigner}"
SERVER_NAME="${SERVER_NAME:-_}"

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script expects a Debian/Raspberry Pi OS system with apt-get."
  exit 1
fi

if ! command -v php >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y php-fpm php-sqlite3
fi

PHP_VERSION="$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')"
PHP_FPM_SERVICE="php${PHP_VERSION}-fpm"
PHP_SOCK="/run/php/php${PHP_VERSION}-fpm.sock"

sudo apt-get update
sudo apt-get install -y nginx php-fpm php-sqlite3 sqlite3

if [ ! -S "${PHP_SOCK}" ]; then
  PHP_SOCK="$(find /run/php -maxdepth 1 -name 'php*-fpm.sock' | head -n 1 || true)"
fi

if [ -z "${PHP_SOCK}" ]; then
  echo "Could not locate PHP-FPM socket under /run/php."
  exit 1
fi

sudo mkdir -p "${SITE_RELEASES}" "${SITE_DATA}"

# Keep deploy path writable by your SSH user, while allowing nginx/php read access.
sudo chown -R "${USER}:www-data" "${SITE_ROOT}"
sudo chmod -R g+rwX "${SITE_ROOT}"

# Keep the SQLite DB path writable by PHP.
sudo chown -R www-data:www-data "${SITE_DATA}"
sudo chmod -R ug+rwX "${SITE_DATA}"

NGINX_CONF="/etc/nginx/sites-available/${SITE_NAME}"
sudo tee "${NGINX_CONF}" >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAME};

    root ${SITE_CURRENT};
    index index.html index.php;
    client_max_body_size 20m;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${PHP_SOCK};
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

sudo ln -sfn "${NGINX_CONF}" "/etc/nginx/sites-enabled/${SITE_NAME}"
if [ -e /etc/nginx/sites-enabled/default ]; then
  sudo rm -f /etc/nginx/sites-enabled/default
fi

sudo nginx -t
sudo systemctl enable nginx "${PHP_FPM_SERVICE}"
sudo systemctl restart nginx "${PHP_FPM_SERVICE}"

cat <<EOF
Bootstrap complete.

Site root:       ${SITE_ROOT}
Current release: ${SITE_CURRENT}
SQLite data dir: ${SITE_DATA}
Nginx site:      ${NGINX_CONF}
EOF
