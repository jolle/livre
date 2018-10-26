echo "Packaging..."
./node_modules/.bin/electron-packager build Livre --platform=darwin --overwrite --out=publications

echo "All done!"