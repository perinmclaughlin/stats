#!/usr/bin/bash
baseurl=''
offlinestatus=''
echo "runs at http://localhost:8081/$baseurl $offlinestatus"
docker run -v "$(pwd)/:/usr/share/nginx/html/$baseurl:ro" -p 8081:80 nginx 
