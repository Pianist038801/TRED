#!/bin/bash
gulp
cd android
./gradlew installRelease
cd ..
