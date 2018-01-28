docker run -v $(pwd):/app --entrypoint rm sandrokeil/typescript -rf dist/*
ls dist
docker run -v $(pwd):/app --entrypoint yarn sandrokeil/typescript install
echo "begin compile"
docker run -v $(pwd):/app --entrypoint ./node_modules/.bin/au sandrokeil/typescript build --env prod
echo "end compile $?"
#docker run -v $(pwd):/app --entrypoint sh sandrokeil/typescript build_tsdecls_only.sh
