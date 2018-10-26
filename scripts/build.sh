echo "Removing old build..."
rm -rf build

echo "Building..."
./node_modules/.bin/parcel build --no-source-maps --out-dir=build --public-url "./" -t electron src/index.html --no-cache

echo "Copying electron..."
cp src/electron.js build/index.js

echo "Copying package.json..."
cp src/package.json build/package.json

echo "Installing node modules..."
NODE_ENV=production yarn install --production --modules-folder=build/node_modules

echo "Replacing DEV paths for PROD..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '.bak' 's/\/node_modules\/mathjax/..\/node_modules\/mathjax/g' build/src.*.js
else
    sed -i 's/\/node_modules\/mathjax/..\/node_modules\/mathjax/g' build/src.*.js
fi

echo "All done!"