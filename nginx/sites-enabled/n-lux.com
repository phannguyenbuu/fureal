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
    
    location /view360/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }


    location /creative/ {
        alias /var/www/html/creative/;  # trỏ đúng tới thư mục dist sau khi deploy
        index index.html;

        # SPA fallback: với React Router hoặc Single Page App, fallback về index.html
        try_files $uri $uri/ /creative/index.html;

        # Cache các file static tĩnh
        location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|json|wasm|glb|hdr|ico)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    location /models/ {
        alias /var/www/html/creative/models/;  # Models riêng
    }

    location /images/ {
        alias /var/www/html/creative/images/;  # Models riêng
    }

    
    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}