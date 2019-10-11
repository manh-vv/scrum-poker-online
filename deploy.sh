#!/usr/bin/env bash

FIREBASE_TOKEN=$1

yarn build

firebase deploy --token ${FIREBASE_TOKEN}
