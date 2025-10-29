server {
    listen 80;

    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name n-lux.com www.n-lux.com;

    client_max_body_size 100M;

    ssl_certificate /etc/letsencrypt/live/n-lux.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n-lux.com/privkey.pem;

    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=15768000" always;

    # ssl_stapling on;
    # ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/n-lux.com/chain.pem;

    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    location /.well-known/acme-challenge/ {
        root /var/www/n-lux.com/html;
        allow all;
    }
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /creative/ {
        proxy_pass http://127.0.0.1:5173/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}