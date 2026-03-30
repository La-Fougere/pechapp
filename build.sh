cd app
npm run build
sleep 5
rm -rf ~/public_html/*
cp -r dist/* ~/public_html/
