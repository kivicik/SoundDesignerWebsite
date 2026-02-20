# Raspberry Pi Hosting Guide

This repo can run well on a Raspberry Pi 24/7.

The setup below hosts the built site with:
- `nginx` for web serving
- `php-fpm` for `mail/save_message.php`
- `sqlite` for contact messages (`/var/www/sounddesigner/data/messages.sqlite`)

## 1) First-time Pi setup

On your Raspberry Pi:

```bash
sudo apt-get update
sudo apt-get install -y openssh-server git
```

Copy this repo to the Pi once (or clone it), then run:

```bash
cd /path/to/this/repo
chmod +x scripts/pi/bootstrap-pi.sh
./scripts/pi/bootstrap-pi.sh
```

After this, nginx is enabled and starts on boot.

## 2) Deploy updates from your Windows machine

From this repo on Windows PowerShell:

```powershell
.\scripts\pi\deploy-to-pi.ps1 -PiHost 192.168.1.50 -PiUser pi
```

Notes:
- Default local deploy source is `_site/agency-jekyll-theme-gh-pages`.
- Each deploy creates a timestamped release and switches `/var/www/sounddesigner/current` symlink.
- Keeps the last 5 releases.
- Does not overwrite `/var/www/sounddesigner/data` (your SQLite messages stay intact).

## 3) Your edit -> update workflow

1. Edit your site locally.
2. If you edit Jekyll source files under `agency-jekyll-theme-gh-pages`, rebuild your site output so `_site/agency-jekyll-theme-gh-pages` is updated.
3. Run:

```powershell
.\scripts\pi\deploy-to-pi.ps1 -PiHost <pi-ip> -PiUser pi
```

## 4) Access from your network

Use:

```text
http://<pi-ip>/
```

Example:

```text
http://192.168.1.50/
```

## 5) Optional: expose publicly

For public internet access, use one of:
- Router port forwarding (`80/443`) + a domain + TLS (recommended with Caddy or Nginx certbot).
- Cloudflare Tunnel (no port forwarding, usually easier/safer for home networks).

If you want, I can add a second script for either public option.
