echo "Removing old build..."
rm -rf build

echo "Building..."
./node_modules/.bin/parcel build --no-source-maps --out-dir=build --public-url "./" -t electron src/index.html --no-cache

echo "Copying node_modules..."
cp -R node_modules build

echo "Copying electron..."
cp src/electron.js build/index.js

echo "Copying package.json..."
cp src/package.json build/package.json

echo "Replacing DEV paths for PROD..."
sed -i '.bak' 's/\/node_modules\/mathjax/..\/node_modules\/mathjax/g' build/src.*.js

echo "All done!"