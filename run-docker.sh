echo "runs at http://localhost:8081/stats/ (offline enabled)"
docker run -v $(pwd)/dist:/usr/share/nginx/html/stats:ro -p 8081:80 nginx
