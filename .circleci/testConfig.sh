#!/usr/bin/env bash
curl --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision=91bd889785595691777e86ed0abd19bff11bfaac\
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/github/danutzcodrescu/yoga-typeorm-be/tree/master
