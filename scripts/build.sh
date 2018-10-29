echo "Removing old build..."
rm -rf build

echo "Building..."
./node_modules/.bin/parcel build --no-source-maps --out-dir=build --public-url "./" -t electron src/index.html --no-cache

echo "Copying electron..."
cp src/electron.js build/index.js

echo "Copying package.json..."
cp package.json build/package.json

echo "Cleaning package.json..."
node -e '
const fs = require("fs");
const packageJson = require("./build/package.json");
const whitelist = ["name", "description", "author", "version", "license", "private", "dependencies"];
fs.writeFileSync("build/package.json", JSON.stringify(Object.keys(packageJson)
    .filter(k => whitelist.includes(k))
    .map(k => ({ [k]: packageJson[k] }))
    .reduce((p, n) => ({ ...p, ...n }), {})
));
'

if [ -n "$JENKINS" ]; then
    sed -i 's/..\/..\/otava-digikirja-api/..\/otava-digikirja-api/' package.json
fi

echo "Installing node modules..."
cd build
NODE_ENV=production yarn install --production --modules-folder=build/node_modules
cd ..

echo "Replacing DEV paths for PROD..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '.bak' 's/..\/node_modules\/mathjax/\/node_modules\/mathjax/g' build/src.*.js
else
    sed -i 's/\/node_modules\/mathjax/..\/node_modules\/mathjax/g' build/src.*.js
fi

echo "All done!"