#!/usr/bin/env bash

FIREBASE_TOKEN=$1

ls -laF

firebase deploy --token ${FIREBASE_TOKEN}
