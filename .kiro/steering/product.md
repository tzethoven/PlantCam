# PlantCam

PlantCam is a Raspberry Pi-based plant monitoring and watering system. It combines hardware sensors and controls with a web interface to:

- Monitor plant environment (temperature, humidity)
- Control automated watering via GPIO-connected relay
- View plants via camera feed
- Schedule automatic watering cycles

The system is designed to run on a Raspberry Pi with connected sensors (DHT11 temperature/humidity sensor), a relay for water pump control, and an optional camera module for visual monitoring.

Key features:

- Real-time sensor monitoring with historical data charts
- Manual and scheduled watering control
- Live camera feed (when enabled)
- Web-based interface accessible from any device on the local network

## Hardware Integration

The system interfaces with Raspberry Pi GPIO pins for:

- Relay control (GPIO 18/pin 530) for water pump activation
- DHT11 sensor for temperature/humidity readings
- Camera module for live plant monitoring

## Deployment Target

Designed to run on Raspberry Pi in production with graceful fallbacks for development environments.
