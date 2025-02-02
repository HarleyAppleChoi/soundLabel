cp ../backend/proto/audio.proto .
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. ./audio.proto
