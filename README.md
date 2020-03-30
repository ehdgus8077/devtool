# setup
- install docker 
- git clone
- ./dockerbuild.sh

# start
```
sudo docker run --name devtool -d -v /tmp/devtool:/server/key -p 80:80 devtool:latest
```

# terminate
```
sudo docker rm -f devtool
```