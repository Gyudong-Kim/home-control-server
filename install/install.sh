WS_DIR="/home/gyudong/ws"

sudo cp "$WS_DIR/home-control-server/install/service/home-control-server.service" "/etc/systemd/system/"

sudo systemctl daemon-reload

sudo systemctl enable --now home-control-server