#!/usr/bin/env bash

FIREBASE_TOKEN=$1

firebase deploy --token ${FIREBASE_TOKEN}
