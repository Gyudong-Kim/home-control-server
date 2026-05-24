sudo cp /home/gyudong/home-control-server/install/service/home-control-server.service /etc/systemd/system/
sudo systemctl daemon-reload

sudo systemctl enable --now home-control-server