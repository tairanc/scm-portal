#!/bin/sh
# 要替换的服务器地址名称
scmServerUrl='$.scmServerUrl'
dictSource='$.dictSource'
addressSource='$.addressSource'
jdAddressSource='$.jdAddressSource'
showAllMenu='$.showAllMenu'
loginUrl='$.loginUrl'

# 地址配置文件json
config='config.json'

if [ ${1} ]; then

    eval $(awk -F'[",]' '/showAllMenu/{printf("boo=%s;",$4)}' ${config})

    eval $(awk -F'[",]' '/dictSource/{printf("dictSource1=%s;",$4)}' ${config})
    eval $(awk -F'[",]' '/addressSource/{printf("addressSource1=%s;",$4)}' ${config})
    eval $(awk -F'[",]' '/jdAddressSource/{printf("jdAddressSource1=%s;",$4)}' ${config})


    eval $(awk -F'[",]' '/'${1}'/{printf("url=%s;",$4)}' ${config})
    eval $(awk -F'[",]' '/'${1}'/{printf("app=%s;",$5)}' ${config})

    if [ ${url} ]; then
        sed -i 's|'${showAllMenu}'.*=.*;|'${showAllMenu}' = '${boo}';|'  js/util/common.js

        sed -i 's|'${dictSource}'.*=.*;|'${dictSource}' = '${dictSource1}';|'  js/util/common.js
        sed -i 's|'${addressSource}'.*=.*;|'${addressSource}' = '${addressSource1}';|'  js/util/common.js
        sed -i 's|'${jdAddressSource}'.*=.*;|'${jdAddressSource}' = '${jdAddressSource1}';|'  js/util/common.js

        sed -i 's|'${scmServerUrl}'.*=.*;|'${scmServerUrl}' = "'${url}'";|'  js/util/common.js
        sed -i 's|'${loginUrl}'.*=.*;|'${loginUrl}' = "'${app}'";|'  js/util/common.js
    else
        echo '参数有误，请核对参数 '${1}' 是否存在'
    fi

else

    echo '参数不能为空，请输入如：sh build.sh dev'

fi