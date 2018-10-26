echo "Packaging..."
./node_modules/.bin/electron-packager build Livre --platform=win32,darwin --overwrite --out=publications

echo "Making Windows installer..."
./node_modules/.bin/electron-installer-windows --src publications/Livre-win32-x64/ --dest publications/installers/

echo "All done!"