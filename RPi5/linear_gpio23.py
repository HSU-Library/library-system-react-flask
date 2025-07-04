import lgpio
import time
import sys

h = lgpio.gpiochip_open(0)  # 기본 GPIO 칩 열기

MOVE_PIN = 23


lgpio.gpio_claim_output(h, MOVE_PIN)

lgpio.gpio_write(h, MOVE_PIN, 1)  # 이동 LOW

print("(GPIO23 HIGH)")

time.sleep(1)

lgpio.gpio_write(h, MOVE_PIN, 0)  # 정지 HIGH
print("(GPIO23 LOW)")

lgpio.gpiochip_close(h)
