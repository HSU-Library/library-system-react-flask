import lgpio
import time
import signal
import sys

scan_trigger = 12

# GPIO 핸들러 열기
h = lgpio.gpiochip_open(0)

running = True

def handle_sigterm(signum, frame):
        global running
        running = False
        
signal.signal(signal.SIGTERM, handle_sigterm)

try:
    while True:
        # ON
        lgpio.gpio_write(h, scan_trigger, 1)
        time.sleep(0.075)
        
        # OFF
        lgpio.gpio_write(h, scan_trigger, 0)
        time.sleep(0.075)

except KeyboardInterrupt:
    print("exit")


finally:
    lgpio.gpiochip_close(h)
    sys.exit(0)
