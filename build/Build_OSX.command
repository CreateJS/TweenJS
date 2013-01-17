#!/bin/bash
cd $(dirname "$0")

LCNAME="tweenjs"

echo -e "\r--- $LCNAME ---"
echo -n "Please enter version number (x.x.x) ? defaults to 'NEXT' : "
read VERSION
echo -e "\r"

if [ "$VERSION" == "" ] 
then
	VERSION="NEXT";
fi   

while [ "$COPY" != "Y" ] || [ "$COPY" != "y" ] || [ "$COPY" != "n" ] || [ "$COPY" != "N" ] || [ "$COPY" == "" ]
do
echo -n "Would you like to copy '${LCNAME}-${VERSION}.min.js' to 'lib' folder (y / n) ?  defaults to 'y' : "
read COPY
echo -e "\r"

if [ "$COPY" == "" ] || [ "$COPY" == "Y" ] || [ "$COPY" == "y" ]
then
	COPY="y";
    break;
fi 
if [ "$COPY" == "n" ] || [ "$COPY" == "N" ]
then
    break;
fi 
done

echo -n "Building $LCNAME version: $VERSION"
node ./build.js --tasks=ALL --os=MAC --version=$VERSION -v # run the build
echo -e "\r"
if [ "$COPY" == "y" ] # spaces are important!
then
	echo -n "'${LCNAME}-${VERSION}.min.js' was copied to 'lib' folder"
	mv -f "./output_min/${LCNAME}-${VERSION}.min.js" ../lib
else 
    echo -n "'${LCNAME}-${VERSION}.min.js' was copied to 'build/output' folder"
    mv -f "./output_min/${LCNAME}-${VERSION}.min.js" ./output
fi
rm -rf "./output_min"
echo -e "\r"
echo -e "\r"
echo "--- Complete ---"
