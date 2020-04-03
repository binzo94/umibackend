#!/bin/sh
target=$1
chmod 777 ./ossutil64
ak=$OSS_AK
sk=$OSS_SK
bucket=$TEST_BUCKET
endpoint=$OSS_ENDPOINT
./ossutil64 config -e $endpoint -i $ak -k $sk
dateValue="`date +'%Y-%m-%d'`"
echo '------- backup start -------'
echo "------- ${dateValue} -------"
./ossutil64 cp oss://${bucket}/${target}/index.html oss://${bucket}/${target}/${dateValue}/  -f
./ossutil64 cp oss://${bucket}/${target}/umi.js oss://${bucket}/${target}/${dateValue}/  -f
./ossutil64 cp oss://${bucket}/${target}/umi.css oss://${bucket}/${target}/${dateValue}/  -f
./ossutil64 cp oss://${bucket}/${target}/static/ oss://${bucket}/${target}/${dateValue}/static/ -r  -f
echo '------- backup end ---------'
echo '------- deploy start ---------'
./ossutil64 cp ./dist/ oss://${bucket}/${target} -r  -f
echo '------- deploy end ---------'
