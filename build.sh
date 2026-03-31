cd app
npm run build
sleep 5
rm -rf ~/public_html/*
mv ~/pechapp/app/dist/* ~/public_html/
