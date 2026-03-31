cd app
npm run build
sleep 5
rm -rf ~/public_html/*
mv ~/pechapp/app/dist/* ~/public_html/
cat > ~/public_html/.htaccess <<'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
